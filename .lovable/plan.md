

# Paystack Integration for Digital Products

## Current State
- Products are **hardcoded** in `src/data/productsData.ts` — no database table
- Admin page reads from static data, no CRUD
- Cart exists but checkout is disabled ("Checkout (Soon)")
- No payment infrastructure at all

## What We Need to Build

### 1. Database: `products` table + `product_orders` table

**`products`** table for admin CRUD:
- id, title, description, category, price (integer, kobo), currency, image_url, creator_name, creator_user_id, download_url, downloads_count, is_published, created_at, updated_at

**`product_orders`** table to track purchases:
- id, user_id, product_id, email, amount, currency, paystack_reference, paystack_transaction_id, status (pending/success/failed), created_at

RLS: Anyone can view published products. Admins full CRUD. Users can insert orders and view own orders. Admins can view all orders.

### 2. Edge Function: `paystack-initialize`
- Receives product_id + user email
- Looks up product price from DB (never trust frontend amount)
- Calls `POST https://api.paystack.co/transaction/initialize` with secret key
- Creates a `product_orders` row with status=pending
- Returns `authorization_url` to frontend

### 3. Edge Function: `paystack-webhook`
- Receives Paystack webhook events
- Verifies `x-paystack-signature` via HMAC SHA512
- On `charge.success`: verifies amount matches, updates order status to "success", increments product downloads_count
- Prevents duplicate fulfillment by checking existing order status

### 4. Edge Function: `paystack-verify`
- Called after user returns from Paystack checkout
- Calls `GET https://api.paystack.co/transaction/verify/{reference}`
- Updates order status accordingly
- Returns success/fail to frontend

### 5. Secret Required
- `PAYSTACK_SECRET_KEY` — the user's Paystack secret key (sk_live_xxx or sk_test_xxx)

### 6. Frontend Changes

**Products page** (`Products.tsx` + `ProductGrid.tsx`):
- Fetch products from Supabase instead of static data
- Remove "Coming Soon" overlay for published products
- Product click opens a detail dialog with "Buy Now" / "Get Free" button
- Buy Now: calls `paystack-initialize`, redirects to `authorization_url`
- After return: calls `paystack-verify`, shows success/failure toast

**Cart Dialog** (`CartDialog.tsx`):
- Enable checkout button — initializes Paystack for total amount
- Or simplify to single-product purchase flow (recommended for v1)

**Admin Products** (`AdminProducts.tsx`):
- Full CRUD against `products` table
- Add/Edit product dialog with form fields
- Toggle published status
- View orders/sales per product

**Dashboard Products** (`DashboardProducts.tsx`):
- Show user's purchased products with download links

### 7. Config
- Add `[functions.paystack-initialize]`, `[functions.paystack-webhook]`, `[functions.paystack-verify]` to `supabase/config.toml` with `verify_jwt = false`

## Implementation Order
1. Ask user for Paystack secret key via secrets tool
2. Create DB migration (products + product_orders tables)
3. Build 3 edge functions
4. Update Admin Products with full CRUD
5. Update Products page with live data + payment flow
6. Update Dashboard Products to show purchases
7. Seed initial products from existing static data via migration

## Technical Notes
- Paystack amounts are in **kobo** (NGN lowest denomination): NGN 5000 = 500000
- Currency will default to NGN
- Popup method is simplest: frontend redirects to `authorization_url`, Paystack handles the rest
- Webhook ensures reliability even if user closes browser after payment

