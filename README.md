# InvenPro - Inventory Management System

A production-ready full-stack Inventory Management System built with the MERN stack.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router DOM, React Hook Form, Axios, Recharts, React Toastify, React Icons

**Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs, Multer

---

## Features

- **JWT Authentication** — Register, Login, Auto-login, Logout
- **Role-Based Access Control** — Admin & User roles with protected routes
- **Admin Dashboard** — Stats, Charts, Recent Orders & Products
- **Category Management** — CRUD, Search, Pagination, Duplicate prevention
- **Supplier Management** — CRUD, Search, Pagination
- **Product Management** — CRUD, Image upload, SKU generator, Stock status badges, Filters, Sort, CSV export
- **Order Management** — CRUD, Status tracking, Stock deduction, CSV export
- **User Management** — Admin-only, CRUD, Role management
- **Profile Management** — Update name/email, Avatar upload, Change password
- **Safe Delete Logic** — Prevents deletion of items in use
- **Responsive Design** — Collapsible sidebar, mobile drawer, dark sidebar theme
- **Charts** — Monthly orders, Revenue trend, Category distribution (Recharts)

---

## Folder Structure

```
inventory-management-system/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── assets/
│       ├── components/ui/  # Reusable UI components
│       ├── context/        # AuthContext
│       ├── hooks/          # usePagination
│       ├── layouts/        # DashboardLayout, Sidebar
│       ├── pages/          # All page components
│       ├── routes/         # ProtectedRoute
│       ├── services/       # Axios API service
│       ├── utils/          # Helpers, formatters
│       ├── App.jsx
│       └── main.jsx
│
└── server/                 # Node.js/Express backend
    ├── config/             # MongoDB connection
    ├── controllers/        # Business logic
    ├── middleware/         # Auth, upload, error handler
    ├── models/             # Mongoose schemas
    ├── routes/             # Express routes
    ├── utils/              # Token & SKU generators
    ├── uploads/            # Uploaded files (auto-created)
    └── server.js
```

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` inside the `server/` folder:

```bash
cd server
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/inventory_db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed an Admin User (First Time)

After starting the server, register via the `/register` page. Then manually update the user's role to `admin` in MongoDB Atlas:

```
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

### 4. Run the Application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/auth/me | Get current user | Protected |
| PUT | /api/auth/profile | Update profile | Protected |
| PUT | /api/auth/change-password | Change password | Protected |
| GET | /api/categories | List categories | Protected |
| POST | /api/categories | Create category | Admin |
| PUT | /api/categories/:id | Update category | Admin |
| DELETE | /api/categories/:id | Delete category | Admin |
| GET | /api/suppliers | List suppliers | Protected |
| POST | /api/suppliers | Create supplier | Admin |
| PUT | /api/suppliers/:id | Update supplier | Admin |
| DELETE | /api/suppliers/:id | Delete supplier | Admin |
| GET | /api/products | List products | Protected |
| POST | /api/products | Create product | Admin |
| PUT | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |
| GET | /api/orders | List orders | Protected |
| POST | /api/orders | Create order | Protected |
| PUT | /api/orders/:id | Update order status | Admin |
| DELETE | /api/orders/:id | Delete order | Protected |
| GET | /api/users | List users | Admin |
| POST | /api/users | Create user | Admin |
| PUT | /api/users/:id | Update user | Admin |
| DELETE | /api/users/:id | Delete user | Admin |
| GET | /api/dashboard/stats | Dashboard stats | Admin |

---

## Stock Status Rules

| Status | Condition | Badge Color |
|--------|-----------|-------------|
| Out of Stock | quantity = 0 | Red |
| Low Stock | 0 < quantity < 10 | Yellow |
| In Stock | quantity >= 10 | Green |

---

## Safe Delete Rules

- **Category** cannot be deleted if products are assigned to it
- **Supplier** cannot be deleted if products are assigned to it  
- **Product** cannot be deleted if orders exist for it

---

## License

MIT
