# ÖDP-MD² – Mitgliederportal für Direkte Demokratie

**ÖDP Mitgliederanträge & Mitgliederbefragungen Digital Platform**

Version 1.0 – MVP Implementation (Phase 1)

## 🎯 Project Overview

ÖDP-MD² is a secure, transparent platform enabling direct democracy within the Ökologisch-Demokratische Partei (ÖDP). It implements:

- **§10.1 (Mitgliederantrag)**: Members can submit motions with 80 co-signers
- **§15 (Mitgliederbefragungen)**: Member surveys and opinion polls (Meinungsbilder)

## 🏗️ Architecture

```
├── backend/          # Node.js + Express + TypeScript API
├── frontend/         # React + TypeScript + Vite + TailwindCSS
├── database/         # PostgreSQL schema and migrations
└── docs/            # API documentation and guides
```

### Tech Stack

**Backend:**
- Node.js + Express.js (TypeScript)
- PostgreSQL with TypeORM
- JWT Authentication
- Bcrypt password hashing
- Zod validation

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- TailwindCSS + shadcn/ui components
- React Router v6
- Axios for API calls
- Lucide icons

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL 15
- Nginx reverse proxy
- GitHub Actions CI/CD

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Installation

1. **Clone and setup:**
```bash
cd /home/alex/Projects/Portfolio/OEDP/Bash
npm install
```

2. **Configure environment:**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend
cp frontend/.env.example frontend/.env
```

3. **Initialize database:**
```bash
cd backend
npm run migration:run
npm run seed:dev
```

4. **Start development servers:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

5. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

### Docker Setup (Alternative)

```bash
docker-compose up -d
```

## 📋 Features (Phase 1 MVP)

### ✅ Implemented

- [x] User authentication & authorization (JWT)
- [x] Role-based access control (Member, BGSt, BAntrK, BuVo, Admin)
- [x] Motion submission system
- [x] Digital signature collection (80 signatures required)
- [x] Vertrauensperson & Ersatzperson nomination
- [x] Admin validation workflow
- [x] Motion status tracking
- [x] PDF export for BPT documentation
- [x] Email notifications
- [x] Audit logging
- [x] GDPR-compliant data handling

### 🚧 In Development (Phase 2)

- [ ] Mitgliederbefragung module (surveys)
- [ ] Survey creation and execution
- [ ] Voting system with anonymity
- [ ] Results visualization
- [ ] Advanced analytics dashboard

## 🗂️ Database Schema

### Core Tables

- **users** – Member accounts and roles
- **motions** – Submitted Mitgliederanträge
- **signatures** – Digital support signatures
- **surveys** – Mitgliederbefragungen (Phase 2)
- **votes** – Survey responses (Phase 2)
- **audit_logs** – Immutable action history

## 🔐 Security Features

- TLS 1.3 encryption
- Bcrypt password hashing (cost factor 12)
- JWT with secure httpOnly cookies
- Rate limiting on authentication endpoints
- SQL injection protection via parameterized queries
- XSS protection with Content Security Policy
- GDPR compliance (data minimization, right to erasure)
- Comprehensive audit logging

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Member** | Submit motions, sign motions, vote in surveys |
| **BGSt** | Validate signatures, approve surveys |
| **BAntrK** | Review and schedule motions for BPT |
| **BuVo** | Access all reports and analytics |
| **Admin** | Full system access, user management |

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` – Register new member
- `POST /api/auth/login` – Login
- `POST /api/auth/logout` – Logout
- `GET /api/auth/me` – Get current user

### Motions
- `GET /api/motions` – List all motions (public)
- `POST /api/motions` – Create motion (authenticated)
- `GET /api/motions/:id` – Get motion details
- `PUT /api/motions/:id` – Update motion (owner only)
- `POST /api/motions/:id/sign` – Sign a motion
- `POST /api/motions/:id/submit` – Submit to BGSt (auto at 80 sigs)
- `POST /api/motions/:id/validate` – Validate motion (BGSt only)
- `GET /api/motions/:id/pdf` – Export motion PDF

### Admin
- `GET /api/admin/users` – List users
- `PUT /api/admin/users/:id/role` – Update user role
- `GET /api/admin/analytics` – System analytics
- `GET /api/admin/audit-logs` – Audit trail

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

### Environment Variables

**Backend (.env):**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/oedp_md2
JWT_SECRET=<strong-secret-key>
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@oedp.de
SMTP_PASS=<smtp-password>
```

**Frontend (.env):**
```
VITE_API_URL=https://api.oedp-md2.de
```

## 📄 License

Proprietary – © 2025 ÖDP Bundesverband

## 🤝 Contributing

This is an internal ÖDP project. For questions or contributions:
- Contact: it@oedp.de
- Internal Wiki: https://wiki.oedp.de/md2

## 🎓 Training & Documentation

- [User Guide](./docs/user-guide.md)
- [Admin Manual](./docs/admin-manual.md)
- [API Documentation](./docs/api-docs.md)
- [Development Guide](./docs/development.md)

## 📞 Support

- Technical Support: it-support@oedp.de
- User Questions: mitglieder@oedp.de
- Security Issues: security@oedp.de

## 🗺️ Roadmap

### Phase 1 – MVP (Q1 2026) ✅
Mitgliederantrag core functionality

### Phase 2 – Surveys (Q2 2026) 🚧
Mitgliederbefragung module

### Phase 3 – Engagement (Q3 2026)
Comments, notifications, analytics

### Phase 4 – Expansion (Q4 2026)
Mobile app, multilingual, LiquidFeedback integration

---

**Built with ❤️ for direct democracy within the ÖDP**
