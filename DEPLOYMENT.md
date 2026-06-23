# Deployment Guide — Madeline_chocolate

Deploy the frontend on **Vercel** and the backend on **Railway** with **Supabase** PostgreSQL.

---

## 1. Database — Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings → Database → Connection string**
4. Copy the **URI** connection string (Transaction pooler recommended for serverless)
5. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
postgresql://postgres.xxxxx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

---

## 2. Backend — Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and create a new project
3. Select **Deploy from GitHub repo** → choose your repo
4. Set **Root Directory** to `backend`
5. Add environment variables:

| Variable | Value |
|----------|-------|
| DATABASE_URL | Your Supabase connection string |
| JWT_SECRET | A long random string |
| JWT_EXPIRES_IN | 7d |
| PORT | 5000 |
| FRONTEND_URL | https://your-app.vercel.app |
| UPI_ID | your-business@upi |
| UPI_NAME | Madeline_chocolate |
| ADMIN_EMAIL | admin@madelinechocolate.com |
| ADMIN_PASSWORD | Strong password |
| SMTP_HOST | smtp.gmail.com (optional) |
| SMTP_PORT | 587 |
| SMTP_USER | your-email@gmail.com |
| SMTP_PASS | app password |

6. Set **Start Command:** `npm run build && npm start`
7. Railway will assign a public URL like `https://madeline-api.up.railway.app`

### Run Migrations on Railway

In Railway shell or locally with production DATABASE_URL:

```bash
npm run db:push
npm run db:seed
```

---

## 3. Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:

| Variable | Value |
|----------|-------|
| NEXT_PUBLIC_API_URL | https://your-railway-api.up.railway.app/api |

4. Deploy

Vercel auto-detects Next.js. No custom build command needed.

---

## 4. Post-Deployment Checklist

- [ ] Change admin password in production
- [ ] Update UPI ID to real business UPI
- [ ] Update WhatsApp number in `WhatsAppButton.tsx` and `Footer.tsx`
- [ ] Update contact info in `Footer.tsx` and `contact/page.tsx`
- [ ] Upload product images (replace placeholder paths in admin panel)
- [ ] Configure SMTP for order confirmation emails
- [ ] Test COD and UPI checkout flows
- [ ] Test PDF invoice download

---

## 5. Custom Domain (Optional)

### Vercel
Settings → Domains → Add `madelinechocolate.com`

### Railway
Settings → Networking → Custom Domain → `api.madelinechocolate.com`

Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` accordingly.

---

## 6. Environment Summary

```
Production Flow:
Customer → Vercel (Next.js) → Railway (Express API) → Supabase (PostgreSQL)
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Ensure `FRONTEND_URL` matches your Vercel domain exactly |
| DB connection fails | Use Supabase pooler URL (port 6543), not direct (5432) |
| JWT errors | Ensure same `JWT_SECRET` across redeploys |
| Images not loading | Upload to Cloudinary or use `/public/images/` paths |

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Use a local PostgreSQL or Supabase dev database for `DATABASE_URL`.
