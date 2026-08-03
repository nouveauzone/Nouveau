# Frontend-Backend Integration Guide

## Overview

This guide walks you through connecting the Nouveau React frontend (deployed on Vercel) to the Node.js Express backend.

---

## Prerequisites

- ✅ Backend running locally or deployed to Render
- ✅ Frontend running locally on `http://localhost:3000`
- ✅ MongoDB Atlas cluster connected
- ✅ Environment variables configured

---

## Part 1: Local Development Setup

### Step 1: Backend Configuration

**1a. Update Backend `.env`**

```bash
# backend/.env
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_secret_key_32_chars_minimum

# Allow both localhost and production frontend
CLIENT_URLS=http://localhost:3000,https://nouveau-delta.vercel.app

ADMIN_EMAIL=admin@nouveau.com
ADMIN_PASS=Admin@Nouveau2024!
```

**1b. Start Backend Server**

```bash
cd backend
npm run dev
```

Verify it's running:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "db": "connected",
  "uptime": 2.341,
  "environment": "development"
}
```

---

### Step 2: Frontend Configuration

**2a. Update Frontend `.env.local`** (create if doesn't exist)

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
```

Or if using `create-react-app`:

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000
```

**2b. Update `package.json`** (if using proxy)

```json
{
  "proxy": "http://localhost:5000"
}
```

**2c. Update API Config File**

Location: `frontend/src/config/api.js`

```javascript
const API_BASE_URL = 
  process.env.REACT_APP_API_URL || 
  process.env.VITE_API_URL || 
  'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PRODUCTS: '/products',
  ORDERS: '/orders',
  USERS: '/users',
  PAYMENTS: '/payments',
  UPLOAD: '/upload',
};

export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: parseInt(
    process.env.REACT_APP_API_TIMEOUT || 
    process.env.VITE_API_TIMEOUT || 
    '30000'
  ),
  headers: {
    'Content-Type': 'application/json',
  },
};
```

**2d. Start Frontend Server**

```bash
cd frontend
npm start
```

Or if using Vite:
```bash
npm run dev
```

---

### Step 3: Test Local Connection

**3a. In Browser Console**

```javascript
// Test API connectivity
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Connection OK:', data))
  .catch(err => console.error('❌ Connection Error:', err));
```

**3b. Test Authentication Flow**

1. Go to http://localhost:3000/auth
2. Click "Sign Up" or "Log In"
3. Fill in credentials
4. Check browser console for token
5. Verify token is saved in localStorage

**3c. Test Product Loading**

1. Navigate to shop page
2. Verify products load from backend
3. Check Network tab in DevTools for `/api/products` request

---

## Part 2: Production Deployment

### Step 1: Deploy Backend to Render

**1a. Push Code to GitHub**

```bash
git add .
git commit -m "Production ready backend"
git push origin main
```

**1b. Create Render Web Service**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Select GitHub repository
4. Configure:
   - **Name:** nouveau-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Region:** Choose closest to users (e.g., Singapore, Europe)

**1c. Add Environment Variables**

In Render Dashboard → Environment:

```
NODE_ENV=production
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=generate_new_secure_key_for_production
ADMIN_EMAIL=admin@nouveau.com
ADMIN_PASS=Admin@Nouveau2024!
CLIENT_URLS=https://nouveau-delta.vercel.app,https://www.nouveauz.com
```

**1d. Deploy**

- Click "Create Web Service"
- Render will auto-deploy on push to main branch
- Copy your Render URL: `https://nouveau-backend-xxxx.onrender.com`

**1e. Verify Production**

```bash
curl https://nouveau-backend-xxxx.onrender.com/api/health
```

---

### Step 2: Deploy Frontend to Vercel

**2a. Create `frontend/.env.production`**

```
REACT_APP_API_URL=https://nouveau-backend-xxxx.onrender.com/api
```

Or for Vite:

```
VITE_API_URL=https://nouveau-backend-xxxx.onrender.com/api
```

**2b. Update `frontend/vercel.json`**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "@vite_api_url"
  }
}
```

**2c. Push to GitHub**

```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

**2d. Connect to Vercel**

1. Go to https://vercel.com/new
2. Select GitHub repository
3. Configure:
   - **Framework:** Create React App (or Vite if applicable)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build` (or `dist` for Vite)
   
4. **Add Environment Variables:**
   - `REACT_APP_API_URL` = `https://nouveau-backend-xxxx.onrender.com/api`
   - Or `VITE_API_URL` = `https://nouveau-backend-xxxx.onrender.com/api`

5. Click "Deploy"
6. Vercel will auto-deploy on push to main branch
7. Copy your Vercel URL: `https://nouveau-delta.vercel.app`

---

### Step 3: Update Backend CORS

**3a. Add Vercel URL to Backend**

Update `backend/.env`:

```
CLIENT_URLS=https://nouveau-delta.vercel.app,https://www.nouveauz.com
```

Or update `backend/server.js`:

```javascript
const CLIENT_URLS = [
  "http://localhost:3000",
  "https://nouveau-delta.vercel.app",
  "https://www.nouveauz.com",
  // Add your custom domain here
];
```

**3b. Redeploy Backend**

```bash
git add backend/.env
git commit -m "Update CORS for Vercel frontend"
git push origin main
```

Render will auto-redeploy within 2-3 minutes.

---

## Part 3: Environment Variables Checklist

### Backend (.env)

| Variable | Local | Production | Required |
|----------|-------|------------|----------|
| NODE_ENV | development | production | ✅ |
| PORT | 5000 | 5000 | ✅ |
| MONGO_URI | dev_cluster | prod_cluster | ✅ |
| JWT_SECRET | local_secret | prod_secret | ✅ |
| CLIENT_URLS | localhost:3000 | vercel.app | ✅ |
| ADMIN_EMAIL | admin@nouveau.com | admin@nouveau.com | ✅ |
| ADMIN_PASS | Initial Pass | Production Pass | ✅ |
| CLOUDINARY_NAME | your_name | your_name | Optional |
| RAZORPAY_KEY_ID | test_key | live_key | Optional |
| EMAIL_USER | sender@gmail.com | sender@gmail.com | Optional |

### Frontend (.env.local / .env.production)

| Variable | Local | Production | Required |
|----------|-------|------------|----------|
| REACT_APP_API_URL | http://localhost:5000/api | https://api.nouveau.onrender.com/api | ✅ |
| REACT_APP_API_TIMEOUT | 30000 | 30000 | Optional |
| REACT_APP_ENV | development | production | Optional |

---

## Part 4: Debugging Connection Issues

### Issue 1: CORS Error

**Error:** `Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:**

1. Check backend CORS configuration in `server.js`
2. Verify frontend origin in `CLIENT_URLS`
3. Ensure Authorization header is allowed:
   ```javascript
   cors({
     credentials: true,
     allowedHeaders: ['Content-Type', 'Authorization']
   })
   ```

### Issue 2: Token Not Persisting

**Error:** User logged in but logged out after page refresh

**Solution:**

```javascript
// frontend/src/context/AuthContext.jsx
useEffect(() => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    setAuthState({
      token,
      user: JSON.parse(user),
      isAuthenticated: true
    });
  }
}, []);
```

### Issue 3: API Timeout

**Error:** `Error: timeout of 30000ms exceeded`

**Solution:**

1. Check backend server is running
2. Verify Render/hosting service status
3. Increase timeout in frontend:
   ```javascript
   const axiosInstance = axios.create({
     timeout: 60000, // 60 seconds
   });
   ```

### Issue 4: 401 Unauthorized

**Error:** All authenticated requests return 401

**Solution:**

1. Clear localStorage: `localStorage.clear()`
2. Login again to get fresh token
3. Verify JWT_SECRET matches backend
4. Check token expiration

---

## Part 5: Testing Checklist

- [ ] **Local Development**
  - [ ] Backend health check responds
  - [ ] Frontend loads products
  - [ ] User registration works
  - [ ] Login returns JWT token
  - [ ] Protected routes require token
  - [ ] Admin routes check role

- [ ] **Production**
  - [ ] Render backend is deployed
  - [ ] Vercel frontend is deployed
  - [ ] CORS allows Vercel domain
  - [ ] Login works on production
  - [ ] Products load from API
  - [ ] Orders can be placed
  - [ ] Admin dashboard accessible

---

## Quick Reference: API URLs

### Local Development
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
API:      http://localhost:5000/api
```

### Production
```
Frontend: https://nouveau-delta.vercel.app
Backend:  https://nouveau-backend-xxxx.onrender.com
API:      https://nouveau-backend-xxxx.onrender.com/api
```

---

## Common curl Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "phone": "+91-9999999999"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

### Get Protected Route
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users/me
```

---

## Support & Next Steps

1. ✅ Backend deployed to Render
2. ✅ Frontend deployed to Vercel
3. ✅ Database connected and secure
4. ✅ Authentication working
5. Next: Configure domain name
6. Next: Setup SSL certificates
7. Next: Monitor performance
8. Next: Scale as needed

---

**Need help?** Check the logs:
- Backend: Render → Logs tab
- Frontend: Vercel → Deployments → View Build Logs
- Database: MongoDB Atlas → Monitoring tab
