# Madeline_chocolate — Full-Stack E-Commerce

A modern e-commerce website for **Madeline_chocolate**, a homemade chocolate and return gifts business.

## Phase 1 Features (Implemented)

- Product catalog with search & category filters
- 5 seeded products (Homemade Chocolate, Kit Kat, Potli Pouch, Piggy Bank, Thank You Card)
- Shopping cart with quantity management
- User authentication (register, login, forgot/reset password)
- User profile with saved delivery address (auto-fills checkout)
- Checkout with **UPI QR** and **Cash on Delivery**
- PDF invoice generation & download
- Order confirmation with tracking status
- Customer dashboard (profile, orders, wishlist)
- Admin dashboard (product CRUD, order management, stats)
- Dark/Light mode, WhatsApp button, responsive design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + React + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT |
| PDF | PDFKit |
| State | Context API |

## Project Structure

```
madeline-chocolate/
├── frontend/          # Next.js app (port 3000)
├── backend/           # Express API (port 5000)
├── DEPLOYMENT.md      # Deployment guide
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Supabase](https://supabase.com))

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 3. Access the App

- **Storefront:** http://localhost:3000
- **API:** http://localhost:5000/api/health
- **Admin Login:** admin@madelinechocolate.com / Admin@123456

## Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | admin@madelinechocolate.com |
| Password | Admin@123456 |

Change these in production via `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/products | List products |
| POST | /api/orders | Create order |
| GET | /api/orders/:id/invoice | Download PDF invoice |
| GET | /api/admin/stats | Admin dashboard stats |
| PATCH | /api/admin/orders/:id/status | Update order status |

## Phase 2 (Future)

- Product reviews with photo upload
- Recharts analytics dashboard
- WebSocket real-time stats
- Cloudinary image upload
- Email notifications (SMTP configured, optional)

## License

Private — Madeline_chocolate business use.
