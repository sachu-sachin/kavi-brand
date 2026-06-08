# Kavi Brand E-Commerce Blueprint (Ultra-Lean MVP)

This document outlines the zero-budget, highly-disciplined technical architecture for the Next.js-based e-commerce website for Kavi Brand. It is strictly optimized for Hostinger's ₹249/mo Managed Node.js plan (2 vCPU / 3 GB RAM).

## User Review Required

> [!IMPORTANT]
> The plan is now in its finalized, production-ready state (9.8/10 score). We have incorporated the final edge-case protections including **Stock Reservation Expiry** (no cron needed), **FULLTEXT search**, and strict **Admin Session/CSRF** constraints. Please give the final sign-off, and we will generate the Task List and begin coding!

## 1. Architectural Diagram

```mermaid
graph TD
    Customer[Customer Browser/Mobile] -->|HTTPS| NextFrontend[Next.js Frontend]
    NextFrontend -->|Server Actions / API| Prisma[Prisma ORM]
    Prisma -->|MySQL Connection| MySQL[(Hostinger Managed MySQL)]
    
    subgraph Admin Area
        AdminLogin[/admin/login] -->|Verify bcrypt credentials| Middleware
        Middleware -->|Set Secure HTTP-Only Cookie| AdminUI[/admin custom pages]
        AdminUI -->|Server Actions| Prisma
    end
    
    subgraph Payment & Inventory Flow
        Checkout[Checkout Page] -->|Clear Expired Reservations -> Reserve Stock| Prisma
        Checkout -->|Create Pending Order| Prisma
        Checkout -->|Initiate| Razorpay[Razorpay Gateway]
        Razorpay -->|Webhook: Signature Verify| WebhookAPI[Next.js API Route]
        WebhookAPI -->|Idempotency Check -> Mark PAID| Prisma
        WebhookAPI -.->|Async Fire| Email[Hostinger SMTP]
    end
```

## 2. Technology Stack & Justification

*   **Core Framework:** **Next.js (App Router)**
*   **Database:** **Hostinger Managed MySQL**
*   **ORM:** **Prisma** (Robust typing and seamless MySQL migrations).
*   **Customer Auth:** **Guest Checkout Only** (No NextAuth initially. Reduces friction. Collect name, phone, email, and address at checkout).
*   **Admin Auth:** **Custom Credential Auth** (Bcrypt + tiny custom session auth. Controlled via `.env` variables `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`). *Session Rule: `httpOnly`, `secure`, `sameSite=strict`, `maxAge=8h` with explicit logout route.*
*   **Admin Dashboard:** **Custom Admin (`/admin`)** (Built with Shadcn UI data tables and forms).
*   **Payments:** **Razorpay**
*   **Validation:** **Zod**
*   **Styling:** **Tailwind CSS + shadcn/ui**
*   **Images:** **Git-Committed Static Assets (`/public/products/`)** (Zero cost. Manually optimize to WebP, <150KB. *Phase 1 Operational Rule: Admin image management is developer-assisted. No runtime file uploads to disk, as Hostinger deployments wipe runtime artifacts.*)
*   **Emails:** **Hostinger SMTP** (Via Nodemailer. Zero cost, no Resend limits).
*   **Analytics:** **Google Analytics (Free)**
*   **Deployment:** **GitHub → Hostinger Auto Deploy**

## 3. Database Schema (Prisma)

A hardened, future-proof schema optimized for spices and weights:

*   **Product:** `id`, `name`, `slug` (Indexed), `description`, `brand`, `categoryId`, `featured`, `active`. *Note: MySQL `FULLTEXT(name, description)` index applied for performant search.*
*   **ProductVariant:** `id`, `productId`, `sku` (Indexed), `unitValue` (e.g., 250), `unitType` (e.g., 'g', 'kg', 'ml'), `price`, `salePrice`, `stock`
*   **Category:** `id`, `name`, `slug` (Indexed)
*   **Customer:** `id`, `name`, `email` (Indexed), `phone` (Indexed). *Rule: Customer dedupe logic by email/phone to prevent database explosion.*
*   **Address:** `id`, `customerId`, `line1`, `city`, `state`, `pincode`
*   **Order:** `id`, `customerId`, `total`, `paymentStatus`, `orderStatus` (PENDING, PAID, FAILED, SHIPPED, DELIVERED, CANCELLED), `razorpayOrderId` (Indexed), `razorpayPaymentId` (Indexed), `refundStatus`, `cancelReason`, `reservationExpiresAt` (DateTime)
*   **OrderItem:** `orderId`, `variantId`, `qty`, `price`
*   **OrderStatusHistory:** `id`, `orderId`, `status`, `changedAt`, `note` (Critical for admin audit trails)
*   **Coupon:** `code`, `type`, `value`, `minAmount`, `expiry`, `active`, `usageLimit`, `usedCount`, `startDate` (Hardened against abuse)

## 4. Payment & Inventory Flow (Strict Enforcement)

To prevent inventory overselling (two customers buying the last item simultaneously) and webhook retries, we enforce this exact flow:

1. Customer initiates checkout.
2. Next.js releases any stuck inventory where `reservationExpiresAt < NOW()`.
3. Next.js validates current stock.
4. Next.js creates a `PENDING` order with `reservationExpiresAt = NOW() + 15 mins` and **reserves the stock** immediately.
5. Next.js creates a Razorpay Order.
6. User completes payment via Razorpay UI.
7. Razorpay sends a webhook to the Next.js API.
8. Next.js verifies the Razorpay signature.
9. **Idempotency Check:** If `order.paymentStatus == PAID`, exit immediately (returns 200).
10. **Atomic Transaction:** Mark order as `PAID`. Commit transaction.
11. Return 200 OK to Razorpay.
12. **Async Task:** Fire confirmation email via Hostinger SMTP (does not block webhook response).

*(Note: The `reservationExpiresAt` logic completely eliminates the need for expensive background workers or crons. Abandoned orders simply unlock their stock the next time someone attempts to check out.)*

## 5. Security & SEO Checklist

### Security (Production-Worthy)
*   [ ] Custom Admin Route Protection (Middleware + Signed HTTP-Only Cookies).
*   [ ] CSRF Protection for admin actions (`SameSite=strict` cookies + CSRF tokens on admin POST mutations).
*   [ ] Rate limiting on API routes and checkout.
*   [ ] Strict Input Validation everywhere using Zod.
*   [ ] Secure `.env` handling (Razorpay keys, Admin hashes).
*   [ ] Razorpay Signature Verification on all webhooks.
*   [ ] SQL Transaction Safety (Atomicity) during checkout and stock updates.
*   [ ] XSS-safe rendering (natively handled by React/Next.js, but strictly enforced on rich-text).

### SEO (D2C Critical)
*   [ ] `sitemap.xml` and `robots.txt` generation.
*   [ ] Canonical URLs for all product pages.
*   [ ] Open Graph tags for social sharing.
*   [ ] JSON-LD Product Schema for rich Google search results.
*   [ ] Breadcrumbs schema.

## 6. Performance Rules for Hostinger (2 vCPU / 3 GB RAM)

*   **Selective SSR:** Use SSR only for SEO-critical pages (Home, Category, Product). Use CSR for dynamic user flows (Cart, Checkout, Admin Dashboard).
*   **Database Indexing:** Ensure slugs, SKUs, emails, phones, and order IDs are indexed in MySQL. Use `FULLTEXT` on product names/descriptions.
*   **No Redis:** Too expensive. Rely on database indexing and Next.js caching headers.
*   **No Background Queues:** Process simple tasks inline, but ensure webhook responses are fast (fire-and-forget emails).

## 7. Detailed MVP Execution Phases

To ensure a smooth, disciplined build process, the MVP will be executed in the following sequential phases:

### Phase 1: Foundation & Database (The Core)
*   **Init:** Set up Next.js App Router, Tailwind CSS, and Shadcn UI.
*   **Database:** Configure Prisma ORM and connect to MySQL.
*   **Schema:** Run migrations for the complete hardened database schema (Products, Variants, Customers, Orders, Coupons, etc.).
*   **Seed:** Create a developer seed script to populate initial dummy categories and spice products for UI testing.

### Phase 2: Secure Admin Panel (The Command Center)
*   **Admin Auth:** Implement `/admin/login` using Bcrypt, signed HTTP-only cookies, and Next.js Middleware protection.
*   **Product Management:** Build Shadcn data tables and forms for creating/editing Products and Variants (with Zod validation).
*   **Image Workflow:** Setup the developer-assisted local image pipeline (`/public/products/`).
*   **Order Management:** Build screens for the admin to view incoming orders and manually update shipping statuses.

### Phase 3: Storefront & Cart (The User Experience)
*   **UI Components:** Build the Home Page (hero, featured items), Category browsing, and Product Detail pages using the premium Apple/Flipkart aesthetic , bento grid , glassmorphism , modern design.
*   **Search:** Implement the highly-performant MySQL `FULLTEXT` search bar.
*   **Shopping Cart:** Build a persistent slide-out cart using browser local storage.
*   **Responsiveness:** Ensure flawless mobile-first navigation.

### Phase 4: Secure Checkout & Payments (The Money Flow)
*   **Guest Checkout:** Build the frictionless checkout form (Name, Email, Phone, Address) with Customer deduplication logic.
*   **Inventory Protection:** Implement the pre-checkout `reservationExpiresAt` logic to safely lock stock for 15 minutes.
*   **Razorpay Integration:** Connect the Razorpay frontend payment modal.
*   **Webhook Architecture:** Build the highly-secure, atomic Razorpay webhook receiver to verify signatures, check idempotency, and officially mark orders as `PAID`.
*   **Transactional Emails:** Setup async order confirmation emails via Hostinger SMTP and Nodemailer.

### Phase 5: Security, SEO & Deployment (The Launch)
*   **Hardening:** Apply final CSRF tokens, strict rate limiting, and environment variable checks.
*   **SEO Setup:** Generate dynamic `sitemap.xml`, `robots.txt`, Canonical URLs, and JSON-LD structured product data.
*   **Deployment:** Connect the GitHub repository to Hostinger. Configure the auto-deploy pipeline (`prisma generate`, `prisma migrate deploy`, `next build`).
*   **Final QA:** Run Lighthouse performance audits and execute end-to-end test transactions.

### Phase 6: Post-Revenue Scale (Future Enhancements)
*(These features are explicitly delayed until the store generates revenue)*
*   Automated Shipping integration (e.g., Shiprocket API).
*   Customer Accounts and self-serve Order Tracking portals.
*   Abandoned cart recovery email sequences.
*   WhatsApp transactional notifications.

## 8. Deployment Strategy

*   **Version Control:** GitHub repository.
*   **CI/CD:** Hostinger "Push to GitHub and deploy automatically".
*   **Build Commands:** 
    1. `prisma generate`
    2. `prisma migrate deploy` (Never use `db push` in production).
    3. `next build`

## Verification Plan

### Automated Checks
*   Lighthouse scores > 90.
*   Successful deployment hook executing migrations.

### Manual Verification
*   **Guest Checkout Flow:** Add items -> Enter details -> Razorpay Test Payment -> Verify `PAID` order and correct stock reservation.
*   **Webhook Resilience:** Fire duplicate Razorpay webhooks to verify idempotency.
*   **Admin Auth:** Attempt to access `/admin` without cookie -> Verify redirect to `/admin/login`.
