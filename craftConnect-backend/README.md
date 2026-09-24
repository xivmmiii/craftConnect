# CraftConnect API

## Local setup

Copy `.env.example` to `.env`, set `JWT_SECRET` (at least 32 characters; the server refuses to start otherwise), configure `MONGO_URI`, then run `npm start`. Checkout uses a transaction when MongoDB is a replica set (or Atlas); on a standalone server it still reserves stock atomically and releases it if checkout fails.

Set the `SMTP_*` variables so password-reset emails are delivered; in development without SMTP the reset links are printed to the server console.

`FRONTEND_URL` is added to the CORS allowlist alongside the local Vite and deployed CraftConnect origins.

## API routes

Authentication uses an httpOnly `cc_session` cookie set by sign-up and sign-in. Browser clients must send requests with credentials (`withCredentials: true`). State-changing requests from origins outside the CORS allowlist are rejected.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/user/Signup` | Public | Create a buyer or seller account and sign in; accepts `email` or `emailID` |
| POST | `/user/Signin` | Public | Sign in and set the session cookie; accepts `email` or `emailID` |
| POST | `/user/Signout` | Public | Clear the session cookie |
| GET | `/user/me` | Signed in | Get the current user |
| POST | `/user/forgot-password` | Public | Email a password reset link |
| POST | `/user/reset-password` | Public | Set a new password with `{ "token", "password" }`; signs out all sessions |
| GET | `/product` | Public | List active products with pagination |
| GET | `/product/:id` | Public | Get an active product |
| GET | `/product/my` | Seller | List the signed-in seller’s products, optionally filtering `isActive` |
| POST | `/product` | Seller | Create product with name, price, category, stock, and optional description/imageUrl |
| PUT | `/product/:id` | Seller | Update the seller’s own product |
| DELETE | `/product/:id` | Seller | Deactivate the seller’s own product |
| GET / POST | `/cart` | Buyer | Read or add to the signed-in buyer’s cart |
| PUT | `/cart/:productId` | Buyer | Set a cart line quantity with `{ "qty": 2 }` |
| DELETE | `/cart/:productId` | Buyer | Decrease a cart line quantity by one |
| DELETE | `/cart/item/:productId` | Buyer | Remove a cart line |
| DELETE | `/cart` | Buyer | Clear the cart |
| POST | `/order/checkout` | Buyer | Place an order with `paymentMode` and a shipping address |
| GET | `/order/view/buyer` | Buyer | List buyer orders |
| GET | `/order/view/seller` | Seller | List orders containing the seller’s products |
| GET | `/admin/summary` | Admin | Get dashboard totals |
| POST | `/admin/signup` | Public, needs setup key | Create an admin account with `{ name, email, password, setupKey }`; `setupKey` must equal the server's `ADMIN_SIGNUP_KEY` (route is off when unset) |
| POST | `/admin/signin` | Public | Sign in; only admin accounts are accepted |
| GET | `/admin/user`, `/admin/product`, `/admin/order` | Admin | List paginated records, newest first (filters: `role`, `isActive`, `status`) |
| POST / PUT / DELETE | `/admin/user`, `/admin/user/:id` | Admin | Create, edit, or delete a member. A password change signs them out; deleting keeps their orders and hides their listings |
| PUT | `/admin/user/:id/deactivate`, `/admin/user/:id/activate` | Admin | Deactivate or reactivate a buyer or seller; a deactivated seller's listings are hidden |
| POST / PUT / DELETE | `/admin/product`, `/admin/product/:id` | Admin | Create a listing for a seller, edit it (including `isActive`), or delete it (also removed from carts) |
| POST / PUT / DELETE | `/admin/order`, `/admin/order/:id` | Admin | Create an order for a buyer (reserves stock), update status/payment/delivery/address (cancelling restocks and is final), or delete it (open orders restock) |

The checkout endpoint records a payment mode and a `pending` payment status; it does not charge cards or process UPI. Connect a payment provider before offering real online payments, and never send raw card details to this API.
