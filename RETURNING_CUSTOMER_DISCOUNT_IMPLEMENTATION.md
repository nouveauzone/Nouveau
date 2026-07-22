# Returning Customer Discount System - Implementation Guide

## Overview
Automatic 10% discount system for returning customers (customers with at least 1 successful paid order) on Nouveauz.com.

## Architecture

### Backend Components

#### 1. **Customer Discount Service** (`backend/services/customerDiscountService.js`)
- **`isReturningCustomer(userId)`**: Checks if customer has 1+ paid orders
- **`getPaidOrderCount(userId)`**: Returns total count of paid orders
- **`calculateReturningCustomerDiscount(subtotal, isReturning)`**: Calculates 10% discount

#### 2. **Pricing Service** (`backend/services/pricingService.js`)
- **`calculateOrderTotals(items, couponCode, isReturningCustomer)`**: 
  - Enhanced to support returning customer discount
  - Coupon takes precedence if provided
  - Returns: `{ subtotal, discount, discountType, discountPct, isReturningCustomer, total }`
  - `discountType` can be: "coupon", "returning_customer", or "none"

#### 3. **Razorpay Payment Route** (`backend/routes/payments.js`)
- **`POST /api/payments/razorpay/create-order`**:
  - Now detects returning customers
  - Returns `discountInfo` in response:
    ```json
    {
      "success": true,
      "order": { ... },
      "discountInfo": {
        "subtotal": 1000,
        "discount": 100,
        "finalAmount": 900,
        "isReturningCustomer": true,
        "discountPct": 10
      }
    }
    ```

#### 4. **Order Controller** (`backend/controllers/orderController.js`)
- **`POST /api/orders/create`**:
  - Checks if customer is returning
  - Passes `isReturningCustomer` to `calculateOrderTotals`
  - Saves `discountType` in order document

#### 5. **Order Schema** (`backend/models/Order.js`)
- New field: `discountType` (enum: "coupon", "returning_customer", "none")
- Existing fields enhanced:
  - `discount`: Amount of discount applied
  - `discountPct`: Percentage of discount (new)

### Frontend Components

#### 1. **CheckoutPage** (`frontend/src/pages/CheckoutPage.jsx`)
- Enhanced to:
  - Track `discountInfo` state
  - Display discount badge when applied
  - Show discount line in order summary
  - Pass `onDiscountApplied` callback to NouveauzCheckout

#### 2. **NouveauzCheckout** (`frontend/src/components/NouveauzCheckout.jsx`)
- Enhanced to:
  - Pass `subtotal` and `cartItems` to Razorpay create-order
  - Handle `discountInfo` response
  - Call `onDiscountApplied` callback with discount details
  - Display discount in Razorpay flow

#### 3. **CartPage** (`frontend/src/pages/CartPage.jsx`)
- Added informational badge for authenticated users:
  - "Returning customers get 10% automatic discount at checkout!"

## Data Flow

### Order Creation Flow

```
1. User logs in → Cart ready for checkout
2. User fills address → Proceeds to payment
3. Frontend calls NouveauzCheckout
4. NouveauzCheckout calls apiService.createRazorpayOrder({
     amount: totalPrice,
     subtotal: subtotal,
     items: cartItems
   }, token)
5. Backend Razorpay endpoint:
   - Checks if user is authenticated
   - Fetches paid order count for user
   - Calculates 10% discount if returning customer
   - Returns Razorpay order with discountInfo
6. Frontend receives discountInfo
   - Calls onDiscountApplied callback
   - Displays discount badge and saves discountInfo to state
7. User proceeds with payment
8. After successful payment:
   - Razorpay verification endpoint updates order
   - Backend saves discount info (discountType: "returning_customer")
```

### Discount Calculation Priority
1. **Coupon Code** (if valid) → Apply coupon discount
2. **Returning Customer** (if no coupon) → Apply 10% discount
3. **No Discount** → Standard pricing

## Security Features

### Backend Validation
- ✅ All discount calculations done on backend
- ✅ Frontend cannot modify discount values
- ✅ Order verification checks discount correctness
- ✅ Database validates discount type and amount
- ✅ Discount tied to user ID (no guest access)

### Guest Users
- ✅ No discount for unauthenticated users
- ✅ System checks `req.user._id` before calculating discount
- ✅ Invalid user IDs are skipped

### Failed Orders
- ✅ Discount applies only to paid orders
- ✅ Status check: `paymentStatus === "paid"`

## API Endpoints

### Razorpay Create Order
```
POST /api/payments/razorpay/create-order
Headers: Authorization: Bearer {token}
Body: {
  amount: number,
  subtotal: number (optional),
  items: array (optional)
}

Response: {
  success: true,
  order: { ... },
  discountInfo: {
    subtotal: number,
    discount: number,
    finalAmount: number,
    isReturningCustomer: boolean,
    discountPct: number
  }
}
```

### Create Order
```
POST /api/orders/create
Headers: Authorization: Bearer {token}
Body: {
  items: array,
  shippingAddress: object,
  paymentMethod: "RAZORPAY",
  paymentReference: string,
  couponCode: string (optional)
}

Response: Order document with discountType field
```

## Database Schema Changes

### Order Document
```javascript
{
  ...existing fields,
  discount: Number,          // Amount of discount in rupees
  discountType: String,      // "coupon" | "returning_customer" | "none"
  couponCode: String,        // Applied coupon code (if any)
}
```

## Display Examples

### Cart Page Badge
```
✨ Returning Customer? Get 10% automatic discount at checkout!
```

### Checkout Order Summary
```
Subtotal                              ₹1000
Returning Customer Discount (10%)     -₹100  [GREEN]
CGST 2.5%                             ₹25
SGST 2.5%                             ₹25
Shipping                              FREE
─────────────────────────────────────────
Total                                 ₹950
```

### Checkout Payment Badge
```
🎉 Returning Customer Discount Applied
   You saved ₹100 on this order!
```

## Testing Scenarios

### Test Case 1: New Customer (First Order)
- Create account
- Add items to cart
- Go to checkout
- Verify NO discount is applied
- Verify `isReturningCustomer: false` in Razorpay response
- Complete payment

### Test Case 2: Returning Customer (2nd+ Order)
- Use account with paid order history
- Add items to cart
- Go to checkout
- Verify 10% discount IS applied
- Verify `isReturningCustomer: true` in Razorpay response
- Verify discount badge shows correct amount
- Complete payment
- Verify order saved with `discountType: "returning_customer"`

### Test Case 3: Coupon vs Returning Discount
- Returning customer with coupon code
- Verify coupon discount takes precedence
- Verify `discountType: "coupon"`

### Test Case 4: Guest Checkout
- Clear auth token (logout)
- Add items and attempt checkout
- Verify no discount applied
- Verify `isReturningCustomer: false`

### Test Case 5: Failed/Unpaid Orders
- Create unpaid order
- Mark as pending/failed
- Attempt new order
- Verify NO discount (order not counted as paid)

## Error Handling

### Backend
- Invalid user ID → Skipped, no discount
- Database query failure → Logged, default to no discount
- Order verification mismatch → Error with details
- Missing payment reference → Standard validation error

### Frontend
- Network error during discount fetch → Show toast, continue with full price
- Invalid discount response → Log error, use full price
- Payment cancellation → No error, return to checkout

## Performance Considerations

### Database Queries
- Order count query uses index: `{ userId: 1, paymentStatus: 1 }`
- Single query per Razorpay order creation
- No N+1 queries or loops

### Caching
- No client-side discount caching (calculated per session)
- Backend calculates fresh on each Razorpay order
- No stale discount data issues

## Backward Compatibility

### Existing Installations
- ✅ All changes are backward compatible
- ✅ Existing orders unaffected
- ✅ Discount calculation is optional
- ✅ No breaking changes to APIs

### Migration Notes
- New `discountType` field defaults to "none"
- Existing orders have `discount: 0` and `discountType: "none"`
- No data migration required

## Future Enhancements

1. **Tiered Discounts**: Increase discount percentage based on order count
   - 1+ orders: 10%
   - 5+ orders: 15%
   - 10+ orders: 20%

2. **Custom Discount Campaigns**: Admin panel to set discount percentages
   - Per customer
   - Per customer segment
   - Time-based (seasonal)

3. **Loyalty Points**: Combine discount with point system
   - Earn points on purchases
   - Redeem points for discounts

4. **First-Time Buyer Discount**: 15% discount for new customers
   - Applies to first order only
   - No code required

5. **Referral Discounts**: Refer friends, get discount
   - Both referrer and referee get discount
   - Tracked via referral codes

## Production Checklist

- [x] Backend services implemented
- [x] Database schema updated
- [x] API endpoints enhanced
- [x] Frontend components updated
- [x] Security validation added
- [x] Error handling implemented
- [x] Display badges/notifications added
- [x] Test scenarios documented
- [ ] Load testing (with discount calculation)
- [ ] UAT with real customers
- [ ] Monitor discount application rates
- [ ] Document in admin panel (if applicable)

## Troubleshooting

### Issue: Discount not applying
**Solution**: 
- Verify user has paid orders: Check Order collection with `paymentStatus: "paid"`
- Verify user is authenticated: Check Authorization header
- Check logs: Backend logs should show `[razorpay] returning customer detected`

### Issue: Discount amount incorrect
**Solution**:
- Verify subtotal calculation: Frontend vs Backend
- Check coupon priority: Coupon should override returning discount
- Validate discount percentage: Should always be 10%

### Issue: Order saves without discount info
**Solution**:
- Verify `discountType` is being passed to Order creation
- Check order schema allows `discountType` field
- Ensure payment verification preserves discount data

## Code Examples

### Backend - Check if Returning Customer
```javascript
const { isReturningCustomer } = require('../services/customerDiscountService');

const userId = req.user._id;
const isReturning = await isReturningCustomer(userId);

if (isReturning) {
  // Apply 10% discount
}
```

### Backend - Calculate Discount
```javascript
const { calculateOrderTotals } = require('../services/pricingService');

const totals = calculateOrderTotals(
  items,           // Order items
  couponCode,      // Optional coupon
  isReturning      // Boolean: is returning customer
);

// totals.discount -> Amount in rupees
// totals.discountType -> "coupon" | "returning_customer" | "none"
```

### Frontend - Handle Discount Response
```javascript
const gatewayOrder = await apiService.createRazorpayOrder({
  amount: totalPrice,
  subtotal: subtotal,
  items: cartItems
}, token);

if (gatewayOrder?.discountInfo?.isReturningCustomer) {
  setDiscountInfo(gatewayOrder.discountInfo);
  toast(`Saved ₹${gatewayOrder.discountInfo.discount}!`);
}
```

## Support & Contact

For issues or questions:
- Check logs in: `~/.pm2/logs/` (backend)
- Frontend errors in: Browser DevTools Console
- Database queries: MongoDB compass/shell
- Razorpay: Dashboard at razorpay.com
