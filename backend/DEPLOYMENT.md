# Nouveau Backend - Deployment & Setup Guide

## 📋 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **MongoDB Atlas** account (cloud database)
- **Cloudinary** account (image hosting)
- **Razorpay** account (payment gateway)
- **Vercel** account

---

## 🚀 Local Development Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cd backend
cp .env.example .env
```

**Required variables:**
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_32_char_secret_key
ADMIN_EMAIL=admin@nouveau.com
ADMIN_PASS=Your_Secure_Password123!
CLIENT_URLS=http://localhost:3000,https://nouveau-delta.vercel.app
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages:
- **express** - Web framework
- **mongoose** - MongoDB ORM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT auth
- **axios** - HTTP client
- **multer** - File uploads
- **express-validator** - Request validation
- **helmet**, **express-rate-limit**, **hpp** - Security
- **morgan** - Request logging

### 3. Start Local Server

```bash
npm run dev
```

This uses **nodemon** for auto-reload on file changes.

**Expected output:**
```
API listening on http://0.0.0.0:5000
MongoDB connected ✓
```

### 4. Verify Health Check

```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "db": "connected",
  "uptime": 2.341,
  "environment": "development"
}
```

---

## 🗄️ Database Setup

### MongoDB Atlas Connection

1. **Create Cluster** at https://cloud.mongodb.com
2. **Add IP Address** (whitelist your IP or use 0.0.0.0 for development)
3. **Create Database User** with secure password
4. **Get Connection String:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nouveau?retryWrites=true&w=majority
   ```

### Auto-Bootstrap Admin User

The system automatically creates an admin user on first database connection:
- **Email:** `admin@nouveau.com` (from `.env`)
- **Password:** `Admin@Nouveau2024!` (from `.env`)

To change these credentials, update `.env` before first run.

### Seed Sample Data

```bash
npm run seed
```

This creates:
- 20 sample products with images
- 5 demo user accounts
- 10 sample orders

---

## 🔐 Authentication

### JWT Flow

1. **User Login**
   ```bash
   POST /api/auth/login
   Body: { "email": "user@example.com", "password": "password123" }
   ```

2. **Response includes JWT token:**
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": { "id": "...", "name": "...", "email": "...", "role": "user" }
   }
   ```

3. **Use Token in Requests**
   - Add to header: `Authorization: Bearer <token>`
   - Token expires in 7 days (configurable in auth middleware)

### Protected Routes

All routes with `protect` middleware require valid JWT:
```bash
# Example: Get user profile
GET /api/users/me
Header: Authorization: Bearer eyJ...
```

### Admin Routes

Routes with `admin` middleware require both:
1. Valid JWT token
2. User role = "admin"

```bash
# Example: Create product (admin only)
POST /api/products
Header: Authorization: Bearer eyJ...
```

---

## 📦 API Documentation

### Authentication Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/logout` | JWT | Logout user |
| POST | `/api/auth/refresh` | JWT | Refresh token |

### Product Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | No | List all products |
| GET | `/api/products/:id` | No | Get product details |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Order Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/orders` | JWT | Get user orders |
| GET | `/api/orders/:id` | JWT | Get order details |
| POST | `/api/orders` | JWT | Create order |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/orders/:id/track` | No | Track order |

### User Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/users/me` | JWT | Get current user |
| GET | `/api/users/:id` | Admin | Get user details |
| PUT | `/api/users/me` | JWT | Update profile |
| POST | `/api/users/me/addresses` | JWT | Add address |
| PUT | `/api/users/me/addresses/:id` | JWT | Update address |

---

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import** → **File** 
3. Select `postman_collection.json` from the `/backend` folder

### Collection Structure

```
Nouveau API
├── Auth
│   ├── Register
│   ├── Login
│   ├── Logout
│   └── Refresh Token
├── Products
│   ├── List All
│   ├── Get By ID
│   ├── Create (Admin)
│   ├── Update (Admin)
│   └── Delete (Admin)
├── Orders
│   ├── Create Order
│   ├── Get My Orders
│   ├── Get Order Details
│   ├── Update Status (Admin)
│   └── Track Order
└── Users
    ├── Get Profile
    ├── Update Profile
    └── Manage Addresses
```

### Quick Test Flow

1. **Register User**
   ```
   POST /api/auth/register
   Body: {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "Password123!",
     "phone": "+91-9999999999"
   }
   ```

2. **Login**
   ```
   POST /api/auth/login
   Body: {
     "email": "john@example.com",
     "password": "Password123!"
   }
   ```
   
   **Copy the token from response**

3. **Set Token in Postman**
   - Go to **Environments** → Create new
   - Add variable: `token` = (paste token here)
   - Use in headers: `Authorization: Bearer {{token}}`

4. **Create Order**
   ```
   POST /api/orders
   Header: Authorization: Bearer {{token}}
   Body: {
     "products": [
       {
         "productId": "507f1f77bcf86cd799439011",
         "size": "M",
         "quantity": 2
       }
     ],
     "shippingAddress": {
       "name": "John Doe",
       "phone": "+91-9999999999",
       "street": "123 Main St",
       "city": "Mumbai",
       "state": "Maharashtra",
       "pincode": "400001"
     }
   }
   ```

---

## 🌐 CORS Configuration

The API accepts requests from:
- **Local development:** `http://localhost:3000`
- **Vercel production:** `https://nouveau-delta.vercel.app`
- **Wildcard Vercel:** `*.vercel.app`, `*.vercel.dev`

To add more origins, update in `server.js`:
```javascript
const CLIENT_URLS = [
  "http://localhost:3000",
  "https://nouveau-delta.vercel.app",
  // Add your origin here
];
```

---

## 🚀 Deploy to Vercel

### Step 1: Create Vercel Project
1. Go to https://vercel.com
2. Import the GitHub repository
3. Select the repo that contains `frontend`, `backend`, and `api`

### Step 2: Confirm Build Settings
1. Use the repository root as the project root
2. Let Vercel use the root `vercel.json`
3. The backend function is served from `/api/index.js`
4. The frontend SPA is served from the static build output

### Step 3: Environment Variables
1. Open **Project Settings** → **Environment Variables**
2. Add the production values:
   ```
   NODE_ENV=production
  MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_secure_secret_key
  CLIENT_URLS=https://nouveau-delta.vercel.app
   ...
   ```

### Step 4: Deploy
1. Click **Deploy**
2. Vercel will build the frontend and deploy the serverless backend together
3. Your site should be available on the Vercel URL for the project

### Step 5: Update Frontend
In frontend `.env` or config:
```
REACT_APP_API_URL=/api
```

---

## 📊 Monitoring

### Health Check Endpoint
```bash
GET /api/health
```

### Server Logs
- **Local:** Check terminal output
- **Vercel:** Dashboard → Functions and Logs

### Error Tracking
Enable error logs in production:
```bash
NODE_ENV=production npm start
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error
1. Check `.env` MONGO_URI is correct
2. Verify IP whitelist in MongoDB Atlas
3. Check internet connection
4. Try: `mongosh` (local MongoDB client)

### JWT Token Expired
```bash
# Get new token
POST /api/auth/refresh
Header: Authorization: Bearer <expired_token>
```

### CORS Error
- Check frontend origin in `server.js` via `CLIENT_URLS`, `CLIENT_URL`, or `PRODUCTION_URL`
- Verify request includes `Content-Type: application/json`
- Ensure credentials are enabled on frontend

---

## 📝 Environment Variables Reference

| Variable | Type | Example | Required |
|----------|------|---------|----------|
| `NODE_ENV` | string | development/production | Yes |
| `PORT` | number | Local dev only; Vercel sets it internally | No |
| `MONGODB_URI` | string | mongodb+srv://... | Yes |
| `MONGO_URI` | string | mongodb+srv://... | Supported alias |
| `JWT_SECRET` | string | 32+ char random key | Yes |
| `ADMIN_EMAIL` | string | admin@nouveau.com | Yes |
| `ADMIN_PASS` | string | Admin123! | Yes |
| `CLIENT_URLS` | string (comma-separated) | http://localhost:3000,https://nouveau-delta.vercel.app | Yes |
| `CLOUDINARY_NAME` | string | Your Cloudinary name | For images |
| `RAZORPAY_KEY_ID` | string | rzp_live_xxx | For payments |
| `EMAIL_USER` | string | your_email@gmail.com | For emails |

---

## 🎯 Next Steps

1. ✅ Setup local environment
2. ✅ Test API with Postman
3. ✅ Connect frontend to backend
4. ✅ Configure payment gateway
5. ✅ Deploy to Render
6. ✅ Setup production database
7. ✅ Configure domain SSL
8. ✅ Monitor and maintain

---

## 📞 Support & Resources

- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Express.js Docs:** https://expressjs.com
- **Render Deployment:** https://render.com/docs
- **JWT Guide:** https://jwt.io
- **Postman Learning:** https://learning.postman.com

---

## 📄 License

Nouveau™ E-Commerce Platform - All Rights Reserved © 2024
