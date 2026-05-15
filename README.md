# Nouveau™ — Own Your Aura
### Premium Indian Fashion eCommerce — Complete Full Stack

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Tailwind CSS, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| Payments | Razorpay + UPI + COD |
| Images | Cloudinary (optional) |
| Hosting | Vercel (frontend) + Render (backend) |

---

## ⚡ Quick Start

### 1. Clone & Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, CLIENT_URL
npm start
```

### 2. Setup Frontend
```bash
cd frontend
npm install
# Create .env file:
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm start
```

App runs on: `http://localhost:3000`

---

## 🔐 Admin Panel

Access via: `http://localhost:3000` → navigate to `/admin` route

**Default credentials** (change in `.env`):
- Email: `admin@nouveau.com`
- Password: `Admin@Nouveau2024!`

Admin can:
- ✅ Add / Edit / Delete products
- ✅ Upload product images
- ✅ Set category, price, discount, stock
- ✅ View and manage all orders
- ✅ Update order status
- ✅ View registered users
- ✅ Dashboard with sales charts

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy via Vercel CLI or GitHub integration
# vercel.json is already configured
```

### Backend → Render
1. Push `backend/` folder to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set environment variables from `.env.example`
4. `render.yaml` is pre-configured

### Database → MongoDB Atlas
1. Create free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Get connection string
3. Set as `MONGO_URI` in backend `.env`

---

## 🏗️ Project Structure

```
nouveau-complete-full/
├── frontend/
│   ├── public/
│   │   ├── index.html          # SEO meta tags
│   │   ├── _redirects          # Netlify SPA routing
│   │   └── *.jpeg              # Product images
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx        # ✨ Banner slider (3 slides)
│   │   │   ├── Navbar.jsx      # Sticky nav with search
│   │   │   ├── ProductCard.jsx # Card with hover effects
│   │   │   ├── Footer.jsx      # Links + policy banner
│   │   │   └── Buttons.jsx     # BtnPrimary, BtnOutline, BtnGold
│   │   ├── pages/
│   │   │   ├── HomePage.jsx    # Slider + categories + trending
│   │   │   ├── ShopPage.jsx    # Filter + sort + grid
│   │   │   ├── ProductPage.jsx # Details + NO RETURN policy
│   │   │   ├── CartPage.jsx    # Cart management
│   │   │   ├── CheckoutPage.jsx # Guest + user checkout
│   │   │   ├── AdminPage.jsx   # Full admin panel
│   │   │   └── ...more pages
│   │   ├── context/
│   │   │   ├── Providers.jsx   # Auth, Cart, Wishlist, Orders
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── WishlistContext.jsx
│   │   └── styles/
│   │       ├── theme.js        # 🖤 Black + Gold theme
│   │       └── globalStyles.js # Global CSS
│   └── vercel.json             # Vercel deployment config
├── backend/
│   ├── models/                 # User, Product, Order
│   ├── routes/                 # auth, products, orders, payments...
│   ├── middleware/             # auth JWT, validation, error handler
│   ├── utils/                  # bootstrap admin, email, AppError
│   ├── server.js               # Express app entry point
│   ├── .env.example            # All required env vars
│   └── render.yaml             # Render deployment config
└── README.md
```

---

## 💳 Payment Setup

### Razorpay (Recommended for India)
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get Key ID and Key Secret from Dashboard
3. Add to backend `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxx
   RAZORPAY_KEY_SECRET=xxx
   ```
4. Add Key ID to frontend `.env`:
   ```
   REACT_APP_RAZORPAY_KEY=rzp_live_xxx
   ```

### UPI + COD (Works without setup)
Already integrated — customers can pay via UPI QR or Cash on Delivery.

---

## ⚠️ Store Policies

All product pages display:
> **"All sales are final. No return, no exchange."**

This is shown prominently on every product detail page.

---

## 📱 Features Checklist

- [x] Banner slider with 3 auto-rotating slides
- [x] 2 category system (Ethnic + Western)
- [x] Product cards with image, title, price, discount badge, add-to-cart
- [x] Product detail page with multiple images, size selection, description
- [x] No Return / No Exchange policy on product page
- [x] Shop page with category filter + price range + sort
- [x] Cart system (add, remove, update quantity)
- [x] Guest checkout + user login checkout
- [x] Payment via UPI, COD, Razorpay
- [x] Admin panel with secure login
- [x] Admin: add/edit/delete products with image upload
- [x] Admin: order management with status updates
- [x] JWT authentication
- [x] MongoDB REST API backend
- [x] Black + Gold premium theme
- [x] Fully responsive (mobile + desktop)
- [x] SEO meta tags (OG, Twitter Card, canonical)
- [x] Vercel + Netlify + Render deployment configs
- [x] Clean code, no console errors
