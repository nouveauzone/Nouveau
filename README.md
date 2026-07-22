# Nouveau™ — Own Your Aura
### Premium Indian Fashion eCommerce — Complete Full Stack

![Nouveau](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v18+-green) ![React](https://img.shields.io/badge/React-18+-blue)

---

## 🎯 Project Overview

Nouveau is a production-ready full-stack eCommerce platform focused on premium Indian fashion. It pairs a React frontend with an Express + MongoDB backend and includes production deployment guides, security best-practices, and API documentation for quick integration.

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| Payments | Razorpay, UPI, COD |
| Images | Cloudinary (optional) |
| Hosting | Vercel (frontend), Render (backend) |

---

## ⚡ Quick Start (Local Development)

### 1. Backend
```powershell
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, CLIENT_URLS
npm run dev
```

### 2. Frontend
```powershell
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
npm start
```

Open: http://localhost:3000

---

## 📁 Project Structure

```
nouveau-complete-full/
├── frontend/
├── backend/
├── DEPLOYMENT.md
├── API_DOCUMENTATION.md
└── FRONTEND_BACKEND_INTEGRATION.md
```

---

## 📚 Documentation & Guides

- [DEPLOYMENT.md](backend/DEPLOYMENT.md) — Backend deployment and Render guide
- [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) — Full API reference
- [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md) — Connect frontend (Vercel) to backend
- [Postman collection](backend/postman_collection.json) — Import for testing

---

## 🔐 Admin Panel

Default admin user is auto-bootstrapped on first run (from `.env`):
- Email: `admin@nouveau.com`
- Password: `Admin@Nouveau2024!`

Change before production.

---

## 💳 Payments

Configure Razorpay keys in `backend/.env`:

```
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
```

Add `REACT_APP_RAZORPAY_KEY` in frontend production env.

---

## ✅ Features

- Product catalog with filters and pagination
- Product detail pages with size & stock management
- Cart, checkout, and order placement
- Order tracking and admin status updates
- JWT auth and role-based access control
- Image uploads via Cloudinary (optional)
- Rate limiting, helmet, mongo-sanitize for security

---

## Troubleshooting

Common commands:

```powershell
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Health check
curl http://localhost:5000/api/health
```

---

## License

Nouveau™ — All Rights Reserved © 2024
