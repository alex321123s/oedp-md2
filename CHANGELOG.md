# Changelog

All notable changes to the ÖDP-MD² project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-19

### Added - Phase 1 MVP

#### Backend
- **Authentication System**
  - User registration with email and password
  - JWT-based authentication
  - Role-based access control (Member, BGSt, BAntrK, BuVo, Admin)
  - Password hashing with bcrypt
  - Session management with httpOnly cookies

- **Mitgliederantrag Module (§10.1)**
  - Create, read, update motions
  - Motion types: Satzungsänderung, Programmänderung, Grundsatzantrag, Sachantrag, Dringlichkeitsantrag
  - Motion status workflow: Draft → Collecting → Submitted → Approved → Scheduled → Accepted/Declined
  - Digital signature collection (80 signatures required)
  - Vertrauensperson and Ersatzperson assignment
  - Automated submission when threshold reached
  - BGSt validation workflow
  - BAntrK scheduling for BPT
  - Outcome recording (votes for/against/abstain)
  - PDF export for official documentation

- **User Management**
  - User profiles with membership information
  - Landesverband and Kreisverband assignment
  - Admin user management (activate/deactivate, role changes)
  - Password change functionality

- **Analytics & Admin Dashboard**
  - System statistics (users, motions, signatures)
  - Motions by status breakdown
  - User activity tracking
  - Audit logging for all critical actions

- **Audit System**
  - Immutable audit logs
  - Tracks all user actions (login, motion creation, signatures, etc.)
  - IP address and user agent logging
  - Exportable for compliance

- **Email Notifications**
  - Welcome emails
  - Motion signed notifications
  - Motion validated notifications
  - Survey invitations (Phase 2 ready)

- **Security**
  - TLS encryption
  - Rate limiting on authentication endpoints
  - SQL injection protection
  - XSS protection with CSP headers
  - GDPR-compliant data handling

#### Frontend
- **User Interface**
  - Modern, responsive design with TailwindCSS
  - Mobile-friendly navigation
  - Accessible (WCAG 2.1 AA ready)

- **Pages**
  - Home page with platform overview
  - User registration and login
  - Motion listing with filters and search
  - Motion detail page with signature collection
  - Motion creation form
  - User profile page
  - Admin dashboard with analytics
  - "My Motions" page for tracking user's submissions

- **Features**
  - Real-time signature progress tracking
  - Motion status badges with color coding
  - Inline motion signing
  - PDF export links
  - Toast notifications for user feedback

#### Database
- **Entities**
  - Users (with roles and membership data)
  - Motions (with full workflow support)
  - Signatures (digital support tracking)
  - Audit Logs (immutable history)
  - Surveys (Phase 2 ready)
  - Votes (Phase 2 ready)

- **Indexes**
  - Optimized for search and filtering
  - Foreign key constraints
  - Unique constraints for data integrity

#### Infrastructure
- Docker Compose setup for development
- PostgreSQL 15 database
- Node.js 18+ backend
- React 18 frontend with Vite
- MailHog for development email testing
- Adminer for database management

#### Documentation
- Comprehensive README
- Quick setup guide (SETUP.md)
- Development guide
- API documentation
- User guide in German
- Inline code documentation

#### Development Tools
- TypeScript for type safety
- ESLint for code quality
- Prettier-ready (optional)
- Hot reload for development
- Database migrations with TypeORM
- Seed data for testing

### Legal & Compliance
- GDPR-compliant data processing
- Implements §10.1 Satzung (Mitgliederantrag)
- Prepared for §15 Satzung (Mitgliederbefragungen - Phase 2)
- Based on 65. Bundesparteitag resolutions 65-S-04 and 65-S-06

---

## [Upcoming] - Phase 2 (Q2 2026)

### Planned Features

#### Mitgliederbefragung Module (§15)
- [ ] Survey creation by 20 members or authorized bodies
- [ ] BGSt approval workflow for surveys
- [ ] Survey types: single choice, multiple choice, ranked choice, free text
- [ ] Duration control (2-14 days, default 7)
- [ ] Anonymous voting option
- [ ] Real-time participation tracking
- [ ] Results visualization with charts
- [ ] Automatic reporting to Bundesvorstand
- [ ] Export anonymized results

#### Enhanced Features
- [ ] Comment system for motions
- [ ] In-app notification center
- [ ] Email notification preferences
- [ ] Enhanced analytics dashboard
- [ ] Motion similarity detection
- [ ] Advanced search with filters
- [ ] Export data to CSV/Excel
- [ ] Motion templates

---

## [Upcoming] - Phase 3 (Q3 2026)

### Planned Features
- [ ] Mobile native app (iOS/Android)
- [ ] Push notifications
- [ ] Offline support
- [ ] Multi-language support (EN)
- [ ] Enhanced accessibility features
- [ ] Integration with LiquidFeedback
- [ ] Public transparency portal
- [ ] Advanced reporting tools

---

## [Upcoming] - Phase 4 (Q4 2026)

### Planned Features
- [ ] Blockchain-based vote verification
- [ ] Delegated voting system
- [ ] Idea incubator for pre-motion brainstorming
- [ ] AI-powered motion categorization
- [ ] Automated translation
- [ ] Video conferencing integration
- [ ] Live streaming of BPT sessions

---

## Development Notes

### Breaking Changes
None yet - this is the initial release.

### Deprecations
None yet.

### Security Updates
- Initial security implementation with bcrypt and JWT

### Performance Improvements
- Database indexes for optimized queries
- React code splitting (ready for implementation)
- Image optimization (ready for implementation)

---

## Contributors

- ÖDP IT Team
- Community contributors (to be listed)

---

## Support

For questions or issues:
- Email: it-support@oedp.de
- Wiki: https://wiki.oedp.de/md2

---

**Note:** Version numbers follow Semantic Versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)
