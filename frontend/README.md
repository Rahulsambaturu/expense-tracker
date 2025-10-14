# Expense Tracker Frontend (React + Vite)

This is a React frontend for your existing Spring Boot backend in `expensetrackerApp/`. The backend code is untouched. The UI provides separate flows for regular users and admins (admins can also access all user functions).

## Features

- **Authentication**
  - Login and Signup pages
  - JWT stored in localStorage
  - Auth header automatically attached to requests
- **Authorization**
  - Protected routes for authenticated users
  - Admin-only routes for admin dashboard
- **User**
  - Dashboard to view, add, and delete own expenses
  - View categories list to select while creating expenses
  - Profile page to view/update details, and delete account
- **Admin**
  - View all users
  - View all expenses
  - Delete a user by id (if id is present in backend response)

## Project Structure

- `src/api/client.js` — Axios instance with base URL and auth header injection
- `src/context/AuthContext.jsx` — Authentication state, login/signup/logout helpers, admin detection
- `src/components/ProtectedRoute.jsx` — Guard for authenticated routes
- `src/components/AdminRoute.jsx` — Guard for admin-only routes
- `src/pages/Login.jsx` — Login page
- `src/pages/Signup.jsx` — Signup page
- `src/pages/UserDashboard.jsx` — User dashboard (CRUD on own expenses)
- `src/pages/AdminDashboard.jsx` — Admin dashboard (users + all expenses)
- `src/pages/Profile.jsx` — User profile management
- `vite.config.js` — Dev server on port 3000 (CORS in backend already allows http://localhost:3000)

## Backend Endpoints Used

- `POST /users/Signup` — Register
- `POST /users/Login` — Login (returns JWT as plain string)
- `GET /users/me` — Get current user info
- `PUT /users/update` — Update current user
- `DELETE /users/me` — Delete current user
- `GET /users/admin` — Admin: list users
- `DELETE /users/admin/{id}` — Admin: delete user by id
- `GET /category` — List categories
- `GET /expenses/user` — List current user's expenses
- `GET /expenses/user/DailyexpensesSum` — Sum of today's expenses
- `POST /expenses` — Create expense for current user
- `DELETE /expenses/{id}` — Delete expense by id
- `GET /expenses/admin` — Admin: list all expenses

Note: If `/users/admin` does not include user ids in the response, the delete user button will be disabled since the backend requires numeric id for deletion. This is by design to avoid modifying the backend.

## Setup

1. Prerequisites
   - Node.js 18+
   - Backend running at `http://localhost:8080` (default). Adjust if different.

2. Configure API Base URL (optional)
   - Copy `.env.example` to `.env` and adjust as needed:

     ```env
     VITE_API_BASE_URL=http://localhost:8080
     ```

3. Install dependencies and run

   ```bash
   npm install
   npm run dev
   ```

   The app will start at `http://localhost:3000`.

## Notes

- The backend CORS config allows `http://localhost:3000` so it works with Vite dev server.
- JWT expiry in backend is 5 minutes. You may need to re-login after expiry.
- No backend changes were made.
