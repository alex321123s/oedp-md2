# Development Guide - ÖDP-MD²

## Table of Contents
1. [Project Setup](#project-setup)
2. [Architecture](#architecture)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Deployment](#deployment)

## Project Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Docker & Docker Compose (optional)
- Git

### Initial Setup

```bash
# Clone repository
cd /home/alex/Projects/Portfolio/OEDP/Bash

# Install dependencies
npm install

# Setup backend
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install

# Setup frontend
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
npm install
```

### Database Setup

**Option 1: Local PostgreSQL**
```bash
# Create database
createdb oedp_md2

# Run migrations
cd backend
npm run migration:run

# Seed development data
npm run seed:dev
```

**Option 2: Docker**
```bash
# Start all services
docker-compose up -d

# Backend will auto-run migrations
# Seed data manually if needed:
docker-compose exec backend npm run seed:dev
```

### Running Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**Or use root command:**
```bash
npm run dev
```

## Architecture

### Technology Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- PostgreSQL + TypeORM
- JWT Authentication
- Bcrypt (password hashing)
- Zod (validation)
- Winston (logging)
- PDFKit (PDF generation)

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router v6
- Zustand (state management)
- Axios
- React Hook Form

### Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Database & app config
│   │   ├── controllers/     # Request handlers
│   │   ├── entities/        # TypeORM entities
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   ├── validators/      # Zod schemas
│   │   └── server.ts        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── main.tsx         # Entry point
│   └── package.json
├── database/
│   └── init.sql             # Database initialization
├── docs/                    # Documentation
└── docker-compose.yml
```

## Development Workflow

### Feature Development

1. **Create feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Implement changes**
   - Backend: Add controller, route, validation
   - Frontend: Add page, component, API call
   - Test locally

3. **Commit changes**
```bash
git add .
git commit -m "feat: description of feature"
```

4. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

### Database Migrations

**Generate migration:**
```bash
cd backend
npm run migration:generate -- -n MigrationName
```

**Run migrations:**
```bash
npm run migration:run
```

**Revert migration:**
```bash
npm run migration:revert
```

### Adding New API Endpoint

1. **Create validator** (`backend/src/validators/`)
```typescript
export const mySchema = z.object({
  field: z.string(),
});
```

2. **Add controller method** (`backend/src/controllers/`)
```typescript
async myMethod(req: Request, res: Response): Promise<void> {
  const data = mySchema.parse(req.body);
  // Implementation
  res.json({ success: true, data });
}
```

3. **Add route** (`backend/src/routes/`)
```typescript
router.post('/my-endpoint', authenticate, asyncHandler(controller.myMethod.bind(controller)));
```

4. **Update frontend API** (`frontend/src/lib/api.ts` or component)
```typescript
const response = await api.post('/api/my-endpoint', data);
```

### Adding New Page

1. **Create page component** (`frontend/src/pages/`)
```tsx
export default function MyPage() {
  return <div>Content</div>;
}
```

2. **Add route** (`frontend/src/App.tsx`)
```tsx
<Route path="/my-page" element={<MyPage />} />
```

3. **Add navigation link** (if needed)

## Code Standards

### TypeScript
- Use strict mode
- Define types for all props and function parameters
- Avoid `any` type unless absolutely necessary
- Use interfaces for object shapes

### Backend
- Use async/await for asynchronous operations
- Always wrap async route handlers with `asyncHandler`
- Validate all inputs with Zod schemas
- Create audit logs for important actions
- Use transactions for multi-step database operations

### Frontend
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use Zustand for global state
- Use React Hook Form for forms

### Naming Conventions
- **Files**: kebab-case (e.g., `auth.controller.ts`)
- **Components**: PascalCase (e.g., `MotionCard.tsx`)
- **Functions**: camelCase (e.g., `fetchMotions`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`)
- **Types/Interfaces**: PascalCase (e.g., `Motion`, `User`)

### Git Commit Messages
```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semi colons, etc
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

## Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist

**Authentication:**
- [ ] User registration
- [ ] User login
- [ ] JWT token validation
- [ ] Logout

**Motions:**
- [ ] Create motion
- [ ] List motions
- [ ] View motion details
- [ ] Sign motion
- [ ] Remove signature
- [ ] Validate motion (BGSt)
- [ ] Schedule motion (BAntrK)
- [ ] Export PDF

**Admin:**
- [ ] View analytics
- [ ] Manage users
- [ ] View audit logs

## Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve dist/ folder with nginx
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/oedp_md2
JWT_SECRET=<strong-secret>
SMTP_HOST=smtp.example.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.oedp-md2.de
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks

- Backend: `GET /health`
- Database: `SELECT 1`

### Monitoring

- Check logs in `backend/logs/`
- Monitor database connections
- Track API response times
- Review audit logs regularly

## Troubleshooting

### Common Issues

**Database connection failed:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check firewall rules

**Migration errors:**
- Revert failed migration
- Fix entity definition
- Re-generate migration

**Frontend build fails:**
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify all imports

**CORS errors:**
- Check FRONTEND_URL in backend .env
- Verify cors configuration in server.ts

## Resources

- [TypeORM Documentation](https://typeorm.io)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com)
