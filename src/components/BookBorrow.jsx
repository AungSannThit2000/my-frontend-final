import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

const API_URL = import.meta.env.VITE_API_URL;

const ADMIN_ACTIONS = [
  "ACCEPTED",
  "CLOSE-NO-AVAILABLE-BOOK",
  "CANCEL-ADMIN",
];

export default function BookBorrow () {
  //TODO: Implement your book request service here
  const { user } = useUser();
  const isAdmin = user.role === "ADMIN";

  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [targetDate, setTargetDate] = useState("");
  const [bookId, setBookId] = useState("");
  const [dateError, setDateError] = useState("");
  const [bookError, setBookError] = useState("");
  const [message, setMessage] = useState("");

  async function loadRequests() {
    const result = await fetch(`${API_URL}/api/borrow`, {
      method: "GET",
      credentials: "include",
    });

    if (result.ok) {
      setRequests(await result.json());
      setMessage("");
    } else {
      setMessage("Cannot load borrow requests");
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const requestResult = await fetch(`${API_URL}/api/borrow`, {
        method: "GET",
        credentials: "include",
      });

      if (cancelled) {
        return;
      }

      if (requestResult.ok) {
        const data = await requestResult.json();
        if (!cancelled) {
          setRequests(data);
          setMessage("");
        }
      } else {
        setMessage("Cannot load borrow requests");
      }

      if (!isAdmin) {
        const bookResult = await fetch(`${API_URL}/api/book`, {
          method: "GET",
          credentials: "include",
        });
        if (!cancelled && bookResult.ok) {
          setBooks(await bookResult.json());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  async function onCreateRequest() {
    let hasError = false;

    if (!targetDate) {
      setDateError("You must select date to submit request");
      hasError = true;
    } else {
      setDateError("");
    }

    if (!bookId) {
      setBookError("You must select book to submit request");
      hasError = true;
    } else {
      setBookError("");
    }

    if (hasError) {
      return;
    }

    const response = await fetch(`${API_URL}/api/borrow`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetDate,
        bookId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      setMessage(error.message || "Cannot create request");
      return;
    }

    setTargetDate("");
    setBookId("");
    setDateError("");
    setBookError("");
    setMessage("Request submitted. Waiting for admin review.");
    await loadRequests();
  }

  async function onAdminUpdate(requestId, requestStatus) {
    const response = await fetch(`${API_URL}/api/borrow`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        requestStatus,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      setMessage(error.message || "Cannot update request");
      return;
    }
    setMessage("Request status updated.");
    await loadRequests();
  }

  async function onUserCancel(requestId) {
    const response = await fetch(`${API_URL}/api/borrow`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        requestStatus: "CANCEL-USER",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      setMessage(error.message || "Cannot cancel request");
      return;
    }
    setMessage("Request cancelled by user.");
    await loadRequests();
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2>Borrow Service</h2>
        <p>Create borrowing requests and track request lifecycle.</p>
        <div className={`meta-chip ${isAdmin ? "role-admin" : "role-user"}`}>
          {isAdmin ? "ADMIN" : "USER"}
        </div>
      </div>

      <div className="nav-row">
        <Link to="/books" className="nav-chip">Books</Link>
        <Link to="/borrow" className="nav-chip">Borrow</Link>
        <Link to="/logout" className="nav-chip">Logout</Link>
      </div>

      {!isAdmin && (
        <div className="card">
          <h3>Create Borrow Request</h3>
          <div className="grid-2">
            <label htmlFor="target-date">
              Target Date
              <input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(event) => {
                  setTargetDate(event.target.value);
                  if (dateError) {
                    setDateError("");
                  }
                }}
              />
              {dateError && <span className="field-error">{dateError}</span>}
            </label>
            <label htmlFor="select-book">
              Book
              <select
                id="select-book"
                value={bookId}
                onChange={(event) => {
                  setBookId(event.target.value);
                  if (bookError) {
                    setBookError("");
                  }
                }}
              >
                <option value="">Select Book (Required)</option>
                {books.map((book) => (
                  <option key={book._id} value={book._id}>
                    {book.title} ({book.author})
                  </option>
                ))}
              </select>
              {bookError && <span className="field-error">{bookError}</span>}
            </label>
          </div>
          <div className="inline-actions">
            <button onClick={onCreateRequest}>Submit Request</button>
          </div>
        </div>
      )}

      <div className="card">
        <h3>{isAdmin ? "All Borrow Requests (ADMIN)" : "My Borrow Requests"}</h3>
        {message && (
          <div className={`message ${message.toLowerCase().includes("cannot") ? "error" : ""}`}>
            {message}
          </div>
        )}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book ID</th>
                <th>Created At</th>
                <th>Target Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.userEmail || request.userId}</td>
                  <td>{request.bookId || "-"}</td>
                  <td>{request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"}</td>
                  <td>{request.targetDate ? new Date(request.targetDate).toLocaleDateString() : "-"}</td>
                  <td>{request.requestStatus}</td>
                  <td>
                    {isAdmin ? (
                      <select
                        defaultValue=""
                        onChange={(event) => {
                          if (!event.target.value) {
                            return;
                          }
                          onAdminUpdate(request._id, event.target.value);
                        }}
                      >
                        <option value="">Set status</option>
                        {ADMIN_ACTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      request.requestStatus === "INIT" || request.requestStatus === "ACCEPTED" ? (
                        <button className="btn-ghost" onClick={() => onUserCancel(request._id)}>Cancel</button>
                      ) : (
                        "-"
                      )
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="6">No requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
