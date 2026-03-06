# Library Management System Frontend

Frontend application for the CSX4107/ITX4107 Web Application Development final exam.

Built with:
- React
- React Router
- Vite

## Features

- Login/logout flow with backend cookie-based authentication
- Role-aware UI (`ADMIN`, `USER`)
- Book pages:
  - List books
  - Search by title and author
  - View book detail
  - ADMIN-only create/update/delete actions
- Borrow pages:
  - USER can create borrow request
  - USER can cancel own request
  - ADMIN can update request status
- Modern responsive UI theme for desktop and mobile

## Test Accounts

Use backend-provided exam accounts:

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@test.com` | `admin123` |
| USER | `user@test.com` | `user123` |

## Environment Variables

Create `.env` in this frontend folder:

```env
VITE_API_URL=http://localhost:3000
```

If your backend runs on another host/port, update this URL accordingly.

## Getting Started

```bash
npm install
npm run dev
```

Default URL:
- `http://localhost:5173`

## Routes

- `/login` - Login page
- `/logout` - Logout flow
- `/books` - Book listing and create form (admin only for create)
- `/books/:id` - Book detail page (admin can update/delete)
- `/borrow` - Borrow request page and request list

## Role-Based UI Behavior

- ADMIN:
  - Can create/update/delete books
  - Can view and update all borrow requests
- USER:
  - Can view books and details
  - Can create borrow requests
  - Can cancel own request

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```text
src/
  components/
    Login.jsx
    Logout.jsx
    Books.jsx
    BookDetail.jsx
    BookBorrow.jsx
  contexts/
    UserContext.jsx
    UserProvider.jsx
  middleware/
    RequireAuth.jsx
  App.jsx
```

## Notes

- Frontend stores minimal session state in `localStorage` for route protection.
- Actual API authorization is still enforced by backend JWT validation.
- If UI seems logged in unexpectedly, use `/logout` or clear `localStorage` + cookies.
