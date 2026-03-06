import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

const API_URL = import.meta.env.VITE_API_URL;

export default function Books () {
  //TODO: Implement your Book list and create here, be careful about user's role.
  const { user } = useUser();
  const isAdmin = user.role === "ADMIN";

  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ title: "", author: "" });
  const [createForm, setCreateForm] = useState({
    title: "",
    author: "",
    quantity: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadBooks = useCallback(async (customFilters, shouldSetLoading = true) => {
    if (shouldSetLoading) {
      setIsLoading(true);
    }
    const query = new URLSearchParams();
    if (customFilters.title.trim()) {
      query.set("title", customFilters.title.trim());
    }
    if (customFilters.author.trim()) {
      query.set("author", customFilters.author.trim());
    }
    if (isAdmin) {
      query.set("includeDeleted", "true");
    }

    const response = await fetch(`${API_URL}/api/book?${query.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      setBooks(data);
      setMessage("");
    } else if (response.status === 401 || response.status === 403) {
      setMessage("Unauthorized access");
    } else {
      setMessage("Cannot load books");
    }
    setIsLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const query = new URLSearchParams();
      if (isAdmin) {
        query.set("includeDeleted", "true");
      }
      const response = await fetch(`${API_URL}/api/book?${query.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (cancelled) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (!cancelled) {
          setBooks(data);
          setMessage("");
        }
      } else if (response.status === 401 || response.status === 403) {
        setMessage("Unauthorized access");
      } else {
        setMessage("Cannot load books");
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  async function onCreateBook() {
    setMessage("");
    const response = await fetch(`${API_URL}/api/book`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: createForm.title,
        author: createForm.author,
        quantity: Number(createForm.quantity),
        location: createForm.location,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      setMessage(error.message || "Cannot create book");
      return;
    }

    setCreateForm({
      title: "",
      author: "",
      quantity: "",
      location: "",
    });
    setMessage("Book created");
    await loadBooks(filters);
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2>Library System</h2>
        <p>Search books, inspect details, and manage inventory based on your role.</p>
        <div className={`meta-chip ${isAdmin ? "role-admin" : "role-user"}`}>
          {isAdmin ? "ADMIN" : "USER"}
        </div>
      </div>

      <div className="nav-row">
        <Link to="/books" className="nav-chip">Books</Link>
        <Link to="/borrow" className="nav-chip">Borrow</Link>
        <Link to="/logout" className="nav-chip">Logout</Link>
      </div>

      <div className="card">
        <div className="grid-2">
          <label htmlFor="title-filter">
            Filter by title
            <input
              id="title-filter"
              placeholder="e.g. Clean Code"
              value={filters.title}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, title: event.target.value }))
              }
            />
          </label>
          <label htmlFor="author-filter">
            Filter by author
            <input
              id="author-filter"
              placeholder="e.g. Robert Martin"
              value={filters.author}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, author: event.target.value }))
              }
            />
          </label>
        </div>
        <div className="inline-actions">
          <button onClick={() => loadBooks(filters)}>Search</button>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <h3>Create Book (ADMIN)</h3>
          <div className="grid-4">
            <label htmlFor="book-title">
              Title
              <input
                id="book-title"
                placeholder="Book title"
                value={createForm.title}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </label>
            <label htmlFor="book-author">
              Author
              <input
                id="book-author"
                placeholder="Author"
                value={createForm.author}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, author: event.target.value }))
                }
              />
            </label>
            <label htmlFor="book-quantity">
              Quantity
              <input
                id="book-quantity"
                type="number"
                placeholder="0"
                value={createForm.quantity}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
              />
            </label>
            <label htmlFor="book-location">
              Location
              <input
                id="book-location"
                placeholder="Shelf / zone"
                value={createForm.location}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, location: event.target.value }))
                }
              />
            </label>
          </div>
          <div className="inline-actions">
            <button onClick={onCreateBook}>Create</button>
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${message.toLowerCase().includes("cannot") ? "error" : ""}`}>
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading books...</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Quantity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const bookId = String(book?._id || "");
                return (
                  <tr key={bookId || `${book.title}-${book.author}`}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.quantity}</td>
                    <td>{book.location}</td>
                    <td>{book.status || "ACTIVE"}</td>
                    <td>
                      {bookId ? (
                        <Link className="link-inline" to={`/books/${bookId}`}>Detail</Link>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
              {books.length === 0 && (
                <tr>
                  <td colSpan="6">No books found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
