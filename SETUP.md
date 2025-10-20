# ÖDP-MD² - Quick Setup Guide

This guide will help you get ÖDP-MD² up and running in under 10 minutes.

## Prerequisites

Make sure you have installed:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

OR

- **Docker & Docker Compose** ([Download](https://www.docker.com/))

## Option 1: Docker (Recommended)

The fastest way to get started:

```bash
# Navigate to project
cd /home/alex/Projects/Portfolio/OEDP/Bash

# Start all services
docker-compose up -d

# Wait for services to start (30-60 seconds)

# Seed development data
docker-compose exec backend npm run seed:dev

# Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Mailhog: http://localhost:8025
```

**Default Login Credentials:**
- Admin: `admin@oedp.de` / `Password123!`
- Member: `member1@oedp.de` / `Password123!`

Done! 🎉

## Option 2: Local Development

### Step 1: Install Dependencies

```bash
# Navigate to project
cd /home/alex/Projects/Portfolio/OEDP/Bash

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Setup PostgreSQL Database

```bash
# Create database
createdb oedp_md2

# Or using psql
psql -U postgres
CREATE DATABASE oedp_md2;
\q
```

### Step 3: Configure Environment

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/oedp_md2
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
SMTP_HOST=localhost
SMTP_PORT=1025
```

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### Step 4: Initialize Database

```bash
cd ../backend

# Run migrations
npm run migration:run

# Seed development data
npm run seed:dev
```

### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**OR use single command from root:**
```bash
npm run dev
```

### Step 6: Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

**Default Login:**
- Admin: `admin@oedp.de` / `Password123!`
- Member: `member1@oedp.de` / `Password123!`

## Verify Installation

1. **Backend Health Check:**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T...",
  "uptime": 123.456
}
```

2. **Login Test:**
   - Go to http://localhost:5173/login
   - Use demo credentials
   - Should redirect to home page

3. **Create Test Motion:**
   - Click "Antrag erstellen"
   - Fill form
   - Save as draft
   - Should see success message

## Troubleshooting

### Port Already in Use

**Backend (port 3000):**
```bash
# Find process
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Frontend (port 5173):**
```bash
# Find process
lsof -i :5173
# Kill process
kill -9 <PID>
```

### Database Connection Failed

1. Check PostgreSQL is running:
```bash
pg_isready
```

2. Test connection:
```bash
psql -U your_user -d oedp_md2
```

3. Check DATABASE_URL in `backend/.env`

### Migration Errors

```bash
# Revert last migration
cd backend
npm run migration:revert

# Re-run migrations
npm run migration:run
```

### Clear Everything and Start Fresh

```bash
# Stop all services
docker-compose down -v

# Remove database
dropdb oedp_md2

# Remove node_modules
rm -rf node_modules backend/node_modules frontend/node_modules

# Start from Step 1
```

## Next Steps

### Development

1. **Read Documentation:**
   - [Development Guide](./docs/development.md)
   - [API Documentation](./docs/api-docs.md)
   - [User Guide](./docs/user-guide.md)

2. **Explore Code:**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`
   - Database: `backend/src/entities/`

3. **Make Changes:**
   - Hot reload is enabled
   - Changes apply automatically
   - Check terminal for errors

### Production Deployment

See [Development Guide - Deployment](./docs/development.md#deployment) for:
- Environment setup
- Build process
- Docker deployment
- SSL configuration
- Monitoring

## Demo Users

The seed script creates 100 test users:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@oedp.de | Password123! | admin | Full system access |
| bgst@oedp.de | Password123! | bgst | Bundesgeschäftsstelle |
| bantrk@oedp.de | Password123! | bantrk | Antragskommission |
| member1@oedp.de | Password123! | member | Regular member |
| member2@oedp.de | Password123! | member | Regular member |
| ... | ... | member | members 3-100 |

## Sample Data

The seed creates:
- 3 sample motions in different states
- 100 member accounts
- Admin, BGSt, BAntrK accounts

## Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart service
docker-compose restart backend

# Stop all
docker-compose down

# Rebuild
docker-compose build --no-cache

# Database backup
pg_dump oedp_md2 > backup.sql

# Database restore
psql oedp_md2 < backup.sql
```

## Support

**Issues?**
- Check [Troubleshooting](#troubleshooting) section
- Review terminal logs for errors
- Check browser console for frontend errors

**Contact:**
- Email: it-support@oedp.de
- Wiki: https://wiki.oedp.de/md2
- GitHub Issues: (if available)

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │ ◄────► │   Backend   │ ◄────► │  PostgreSQL │
│  (React)    │  HTTP   │  (Express)  │   SQL   │  Database   │
│  Port 5173  │         │  Port 3000  │         │  Port 5432  │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │
      │                        ▼
      │                 ┌─────────────┐
      │                 │   MailHog   │
      │                 │  (Dev Mail) │
      │                 │  Port 8025  │
      │                 └─────────────┘
      ▼
┌─────────────┐
│   Adminer   │
│   (DB UI)   │
│  Port 8080  │
└─────────────┘
```

## Security Notes

⚠️ **IMPORTANT:** This setup is for **DEVELOPMENT ONLY**

Before production:
1. Change all default passwords
2. Generate strong JWT_SECRET
3. Enable SSL/TLS
4. Configure firewall rules
5. Set NODE_ENV=production
6. Review CORS settings
7. Enable rate limiting
8. Set up backups
9. Configure monitoring
10. Review security checklist

## License

Proprietary – © 2025 ÖDP Bundesverband

---

**Questions?** Contact it-support@oedp.de
