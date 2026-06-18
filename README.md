# EduBridge — Smart Government School Portal

An all-in-one school management portal for students, parents, teachers, administrators, and maintenance staff.

## 📁 Project Structure

```
EduBridge/
├── backend/        # Node.js + Express REST API
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── controllers/  # Route logic
│   │   ├── middleware/   # Auth, error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/       # React + Vite SPA
│   ├── src/
│   │   ├── components/   # Navbar, Footer, etc.
│   │   ├── pages/        # Route-level pages
│   │   └── services/     # Axios API calls
│   ├── index.html
│   └── package.json
│
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env        # Fill in MONGO_URI, JWT_SECRET
npm install
npm run dev                 # Starts on http://localhost:4000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env        # Fill in VITE_API_URL=http://localhost:4000
npm install
npm start                   # Starts on http://localhost:5173
```

## 🔑 Environment Variables

### `backend/.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 4000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `NODE_ENV` | `development` or `production` |

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full portal management, user creation |
| **Teacher** | Mark attendance, publish notices |
| **Student** | View attendance, meals, submit complaints |
| **Parent** | Track child's attendance, file suggestions |
| **Maintenance** | Update infrastructure repair status |

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router, Axios, Bootstrap 5
- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs
- **Database**: MongoDB Atlas
