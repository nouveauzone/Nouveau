# Nouveau Backend API Documentation

## Base URL

- **Local Development:** `http://localhost:5000/api`
- **Production:** `https://nouveau-backend.onrender.com/api`

---

## Authentication

### JWT Token Usage

All protected endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- Default expiration: **7 days**
- Refresh tokens: Use `/auth/refresh` endpoint before expiration
- On expiration: Request returns `401 Unauthorized`

---

## Error Handling

All error responses follow this format:

```json
{
  "status": "fail",
  "message": "Error description",
  "stack": "... (development only)"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Server Error

---

## Endpoints

### 1. Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phone": "+91-9999999999"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9999999999",
    "role": "user"
  }
}
```

**Validation Rules:**
- Name: Required, min 3 characters
- Email: Required, valid email format, unique
- Password: Required, min 8 characters
- Phone: Optional, valid phone format

---

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error (401):**
```json
{
  "status": "fail",
  "message": "Invalid email or password"
}
```

---

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <expired_token>
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

### 2. Products

#### List All Products
```http
GET /products?page=1&limit=10&category=Indian%20Ethnic%20Wear&sort=-price
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `category` (string): Filter by category
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `isFeatured` (boolean): Get featured products only
- `sort` (string): Sort field with prefix (+/-). Example: `-price`, `+createdAt`

**Response (200):**
```json
{
  "status": "success",
  "count": 25,
  "totalPages": 3,
  "currentPage": 1,
  "products": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Elegant Saree",
      "description": "Traditional Indian saree...",
      "price": 2499,
      "originalPrice": 4999,
      "discount": 50,
      "category": "Indian Ethnic Wear",
      "subcategory": "Sarees",
      "images": ["https://cdn.example.com/saree1.jpg"],
      "sizes": [
        {
          "size": "Free Size",
          "quantity": 45
        }
      ],
      "rating": 4.5,
      "reviews": 12,
      "isFeatured": true,
      "isNew": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### Get Product Details
```http
GET /products/507f1f77bcf86cd799439011
```

**Response (200):**
```json
{
  "status": "success",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Elegant Saree",
    "description": "Traditional Indian saree with modern design",
    "price": 2499,
    "originalPrice": 4999,
    "discount": 50,
    "category": "Indian Ethnic Wear",
    "subcategory": "Sarees",
    "gender": "women",
    "images": ["https://cdn.example.com/saree1.jpg"],
    "sizes": [
      {
        "size": "Free Size",
        "quantity": 45
      }
    ],
    "reviews": [
      {
        "id": "rev123",
        "user": "Jane Doe",
        "rating": 5,
        "comment": "Beautiful and comfortable!",
        "date": "2024-01-20T14:25:00Z"
      }
    ],
    "rating": 4.5,
    "reviewCount": 12,
    "isFeatured": true,
    "isNew": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T08:45:00Z"
  }
}
```

---

#### Create Product (Admin Only)
```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Premium Kurti",
  "description": "Handcrafted premium kurti with traditional embroidery",
  "price": 1899,
  "originalPrice": 3499,
  "category": "Indian Western Wear",
  "subcategory": "Kurtis",
  "gender": "women",
  "images": ["https://cdn.example.com/kurti1.jpg"],
  "sizes": [
    {"size": "XS", "quantity": 10},
    {"size": "S", "quantity": 15},
    {"size": "M", "quantity": 20},
    {"size": "L", "quantity": 18},
    {"size": "XL", "quantity": 12}
  ],
  "discount": 46,
  "isFeatured": false,
  "isNew": true
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Product created successfully",
  "product": { ... }
}
```

**Validation:**
- Title: Required, min 5 characters
- Price: Required, must be > 0
- Category: Must be one of the allowed categories
- Images: At least one image URL required
- Sizes: At least one size with quantity required

---

#### Update Product (Admin Only)
```http
PUT /products/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Premium Kurti",
  "price": 1699,
  "discount": 51,
  "isFeatured": true
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Product updated successfully",
  "product": { ... }
}
```

---

#### Delete Product (Admin Only)
```http
DELETE /products/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

---

### 3. Orders

#### Create Order
```http
POST /orders
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "size": "M",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "size": "L",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+91-9999999999",
    "email": "john@example.com",
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "razorpay",
  "couponCode": "SAVE20"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Order created successfully",
  "order": {
    "id": "507f1f77bcf86cd799439020",
    "trackingId": "ORD1705319400123",
    "userId": "507f1f77bcf86cd799439011",
    "products": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "title": "Elegant Saree",
        "image": "https://cdn.example.com/saree1.jpg",
        "price": 2499,
        "size": "M",
        "quantity": 2
      }
    ],
    "shippingAddress": { ... },
    "subtotal": 4998,
    "discount": 1000,
    "shippingCharge": 50,
    "totalAmount": 4048,
    "paymentMethod": "razorpay",
    "paymentStatus": "pending",
    "orderStatus": "Awaiting Payment Verification",
    "statusHistory": [
      {
        "status": "Awaiting Payment Verification",
        "message": "Order awaiting payment verification",
        "timestamp": "2024-01-20T10:30:00Z"
      }
    ],
    "estimatedDelivery": "2024-01-27T10:30:00Z",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

---

#### Get User Orders
```http
GET /orders?status=Placed&sort=-createdAt
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `status` (string): Filter by order status
- `sort` (string): Sort field
- `page` (number): Page number
- `limit` (number): Items per page

**Response (200):**
```json
{
  "status": "success",
  "count": 5,
  "orders": [ ... ]
}
```

---

#### Get Order Details
```http
GET /orders/507f1f77bcf86cd799439020
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "status": "success",
  "order": { ... }
}
```

---

#### Track Order
```http
POST /orders/track
Content-Type: application/json

{
  "trackingId": "ORD1705319400123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "order": {
    "trackingId": "ORD1705319400123",
    "orderStatus": "Shipped",
    "estimatedDelivery": "2024-01-27T10:30:00Z",
    "statusHistory": [
      {
        "status": "Placed",
        "message": "Order placed successfully",
        "timestamp": "2024-01-20T10:30:00Z"
      },
      {
        "status": "Processing",
        "message": "Order processing started",
        "timestamp": "2024-01-20T14:00:00Z"
      },
      {
        "status": "Shipped",
        "message": "Shipped with DHL Express",
        "timestamp": "2024-01-21T08:30:00Z"
      }
    ]
  }
}
```

---

#### Update Order Status (Admin Only)
```http
PUT /orders/507f1f77bcf86cd799439020/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Shipped",
  "message": "Order shipped via DHL Express. Tracking: DHLxxx123"
}
```

**Valid Status Values:**
- `Awaiting Payment Verification`
- `Placed`
- `Processing`
- `Shipped`
- `Out for Delivery`
- `Delivered`
- `Cancelled`

**Response (200):**
```json
{
  "status": "success",
  "message": "Order status updated",
  "order": { ... }
}
```

---

### 4. Users

#### Get Current User Profile
```http
GET /users/me
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "status": "success",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9999999999",
    "role": "user",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "country": "India",
    "addresses": [
      {
        "id": "addr123",
        "label": "Home",
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "isDefault": true
      }
    ],
    "wishlist": ["507f1f77bcf86cd799439012"],
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLogin": "2024-01-20T14:25:00Z"
  }
}
```

---

#### Update User Profile
```http
PUT /users/me
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+91-8888888888",
  "avatar": "https://cdn.example.com/new-avatar.jpg",
  "country": "India"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

#### Add Address
```http
POST /users/me/addresses
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "label": "Office",
  "street": "456 Business Park",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Address added successfully",
  "user": { ... }
}
```

---

#### Update Address
```http
PUT /users/me/addresses/addr123
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "label": "Home Office",
  "street": "789 Updated Street",
  "city": "Mumbai",
  "pincode": "400002",
  "isDefault": true
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Address updated successfully",
  "user": { ... }
}
```

---

#### Delete Address
```http
DELETE /users/me/addresses/addr123
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Address deleted successfully"
}
```

---

### 5. System

#### Health Check
```http
GET /health
```

**Response (200):**
```json
{
  "db": "connected",
  "uptime": 1234.56,
  "environment": "development"
}
```

---

#### Root Endpoint
```http
GET /
```

**Response (200):**
```json
{
  "message": "Nouveau™ API v2 running 🪷",
  "status": "ok"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Global limit:** 1000 requests per 15 minutes per IP
- **Auth limit:** 50 requests per 15 minutes per IP for auth endpoints
- **Localhost:** Not rate limited (for development)

Rate limit headers in response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705319400
```

---

## CORS

The API accepts requests from:
- `http://localhost:3000` (local development)
- `https://nouveau-delta.vercel.app` (production)
- All `*.vercel.app` and `*.vercel.dev` domains

---

## Best Practices

### 1. Always Use HTTPS in Production
```
https://api.nouveau-backend.onrender.com/api
```

### 2. Store Tokens Securely
- Use `httpOnly` cookies or secure localStorage
- Never share tokens in logs
- Regenerate on sensitive changes

### 3. Handle Pagination
```
GET /products?page=1&limit=20
```

### 4. Implement Retry Logic
- Retry with exponential backoff for 5xx errors
- Don't retry 4xx errors
- Use `Retry-After` header if present

### 5. Cache Responses
- Cache product listings (5 minutes)
- Cache user profile (1 minute)
- Don't cache order data

---

## Troubleshooting

### 401 Unauthorized
- Check token is included in Authorization header
- Verify token hasn't expired
- Ensure token is valid JWT format

### 403 Forbidden
- Verify you have admin role for admin endpoints
- Check user account status

### 429 Too Many Requests
- Rate limit exceeded
- Wait for `Retry-After` seconds
- Implement exponential backoff

### 500 Internal Server Error
- Check server logs
- Verify database connection
- Contact support with error ID

---

## API Versioning

Current Version: **v2**

Future versions will be at:
- `/api/v3/...`

Old endpoints remain supported for 6 months during version transitions.

---

## Support

- **Status Page:** https://status.nouveau.com
- **Email:** support@nouveau.com
- **Discord:** https://discord.gg/nouveau
- **GitHub Issues:** https://github.com/nouveau/api/issues
