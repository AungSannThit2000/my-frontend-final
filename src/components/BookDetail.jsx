import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

const API_URL = import.meta.env.VITE_API_URL;

export function BookDetail () {
  //TODO: Implement your Book management in detail here, i.e. Update or Delete
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user.role === "ADMIN";

  const [book, setBook] = useState(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    quantity: "",
    location: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadBook = useCallback(async (shouldSetLoading = true) => {
    if (shouldSetLoading) {
      setIsLoading(true);
    }
    const response = await fetch(`${API_URL}/api/book/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      setMessage(error.message || "Cannot load book detail");
      setIsLoading(false);
      return;
    }

    const data = await response.json();
    setBook(data);
    setForm({
      title: data.title ?? "",
      author: data.author ?? "",
      quantity: data.quantity ?? "",
      location: data.location ?? "",
    });
    setMessage("");
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const response = await fetch(`${API_URL}/api/book/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        setMessage(error.message || "Cannot load book detail");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (cancelled) {
        return;
      }
      setBook(data);
      setForm({
        title: data.title ?? "",
        author: data.author ?? "",
        quantity: data.quantity ?? "",
        location: data.location ?? "",
      });
      setMessage("");
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onUpdate() {
    const response = await fetch(`${API_URL}/api/book/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: form.title,
        author: form.author,
        quantity: Number(form.quantity),
        location: form.location,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      setMessage(error.message || "Cannot update book");
      return;
    }
    setMessage("Book updated");
    await loadBook();
  }

  async function onDelete() {
    const response = await fetch(`${API_URL}/api/book/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      setMessage(error.message || "Cannot delete book");
      return;
    }

    navigate("/books");
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2>Book Detail</h2>
        <p>Inspect and manage this book record.</p>
        <div className={`meta-chip ${isAdmin ? "role-admin" : "role-user"}`}>
          {isAdmin ? "ADMIN" : "USER"}
        </div>
      </div>

      <div className="nav-row">
        <Link to="/books" className="nav-chip">Back to Books</Link>
        <Link to="/borrow" className="nav-chip">Borrow</Link>
        <Link to="/logout" className="nav-chip">Logout</Link>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="card">
          <div className="grid-2">
            <label htmlFor="detail-title">
              Title
              {isAdmin ? (
                <input
                  id="detail-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              ) : (
                <input id="detail-title" value={book?.title || ""} disabled />
              )}
            </label>
            <label htmlFor="detail-author">
              Author
              {isAdmin ? (
                <input
                  id="detail-author"
                  value={form.author}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, author: event.target.value }))
                  }
                />
              ) : (
                <input id="detail-author" value={book?.author || ""} disabled />
              )}
            </label>
            <label htmlFor="detail-quantity">
              Quantity
              {isAdmin ? (
                <input
                  id="detail-quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, quantity: event.target.value }))
                  }
                />
              ) : (
                <input id="detail-quantity" value={book?.quantity || ""} disabled />
              )}
            </label>
            <label htmlFor="detail-location">
              Location
              {isAdmin ? (
                <input
                  id="detail-location"
                  value={form.location}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                />
              ) : (
                <input id="detail-location" value={book?.location || ""} disabled />
              )}
            </label>
          </div>

          <div className="inline-actions">
            <div className="meta-chip">Status: {book?.status || "ACTIVE"}</div>
          </div>

          {isAdmin && (
            <div className="inline-actions">
              <button onClick={onUpdate}>Update</button>{" "}
              <button className="btn-danger" onClick={onDelete}>Soft Delete</button>
            </div>
          )}
          {message && (
            <div className={`message ${message.toLowerCase().includes("cannot") ? "error" : ""}`}>
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
