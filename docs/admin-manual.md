# ÖDP-MD² Administrator Manual

This manual is for system administrators, BGSt staff, BAntrK members, and BuVo members managing the ÖDP-MD² platform.

## Table of Contents
1. [User Roles & Permissions](#user-roles--permissions)
2. [User Management](#user-management)
3. [Motion Management](#motion-management)
4. [Analytics & Reporting](#analytics--reporting)
5. [System Maintenance](#system-maintenance)
6. [Security & Compliance](#security--compliance)
7. [Troubleshooting](#troubleshooting)

## User Roles & Permissions

### Role Hierarchy

| Role | Level | Capabilities |
|------|-------|--------------|
| **Admin** | 5 | Full system access |
| **BuVo** | 4 | View analytics, reports |
| **BAntrK** | 3 | Schedule motions, record outcomes |
| **BGSt** | 3 | Validate motions, manage surveys |
| **Delegate** | 2 | Same as Member + formal voting |
| **Member** | 1 | Create motions, sign, vote |

### Permission Matrix

| Action | Member | BGSt | BAntrK | BuVo | Admin |
|--------|--------|------|--------|------|-------|
| Create motion | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sign motion | ✓ | ✓ | ✓ | ✓ | ✓ |
| Validate motion | - | ✓ | - | - | ✓ |
| Schedule motion | - | - | ✓ | - | ✓ |
| Record outcome | - | - | ✓ | - | ✓ |
| View analytics | - | ✓ | ✓ | ✓ | ✓ |
| Manage users | - | - | - | - | ✓ |
| View audit logs | - | ✓ | ✓ | ✓ | ✓ |

## User Management

### Accessing Admin Panel

1. Log in with admin credentials
2. Click **"Admin"** in navigation
3. Select **"User Management"**

### Creating Users

**Manual Creation:**
1. Navigate to Admin → Users
2. Click **"Add User"**
3. Fill in required fields:
   - Email
   - Name
   - Membership ID
   - Role
4. System generates temporary password
5. User receives welcome email

**Bulk Import (CSV):**
```csv
email,firstName,lastName,memberId,role,landesverband
user1@oedp.de,John,Doe,MEM-001,member,Bayern
user2@oedp.de,Jane,Smith,MEM-002,member,NRW
```

Import process:
```bash
cd backend
npm run import:users -- --file users.csv
```

### Modifying User Roles

1. Navigate to Admin → Users
2. Search for user
3. Click **"Edit"**
4. Select new role from dropdown
5. Click **"Save"**
6. User receives notification

**Available Roles:**
- `member` - Regular member
- `delegate` - Delegate (for BPT voting)
- `bgst` - Bundesgeschäftsstelle staff
- `bantrk` - Antragskommission member
- `buvo` - Bundesvorstand member
- `admin` - System administrator

### Deactivating Users

**Temporarily:**
1. Find user
2. Click **"Deactivate"**
3. User cannot log in but data preserved

**Permanently (GDPR Right to Erasure):**
1. Navigate to Admin → Users → User Profile
2. Click **"Delete User Data"**
3. Confirm deletion
4. All personal data anonymized
5. Audit trail preserved (anonymized)

### Password Reset

**Admin-Initiated:**
1. Find user
2. Click **"Reset Password"**
3. System generates new temporary password
4. User receives reset email

**User Self-Service:**
- Users can use "Forgot Password" on login page
- Email verification required

## Motion Management

### Motion Workflow States

```
Draft → Collecting → Submitted → Approved → Scheduled → Accepted/Declined
         ↓              ↓           ↓
    Withdrawn      Rejected    Withdrawn
```

### BGSt: Validating Motions

When motion reaches 80 signatures:

1. **Navigate to:** Admin → Motions → Pending Validation
2. **Review motion:**
   - Check signature authenticity
   - Verify completeness
   - Ensure formal compliance
3. **Validate:**
   - Click **"Validate Motion"**
   - Select: **Approve** or **Reject**
   - Add validation notes (required if rejecting)
   - Submit

**Approval Checklist:**
- [ ] 80 valid signatures from active members
- [ ] Vertrauensperson designated
- [ ] Motion text complete and clear
- [ ] Proper categorization (Satzung/Programm/etc.)
- [ ] No duplicate submissions

**Rejection Reasons:**
- Invalid signatures (non-members, duplicates)
- Incomplete information
- Violates party statutes
- Duplicate of existing motion

### BAntrK: Scheduling Motions

1. **Navigate to:** Admin → Motions → Approved
2. **Select motion**
3. **Click "Schedule for BPT"**
4. **Fill in:**
   - Agenda item (e.g., "TOP 5.2")
   - Date and time
   - Venue (if different)
5. **Submit**
6. Creator and trust person notified

### BAntrK: Recording Outcomes

After BPT voting:

1. **Navigate to:** Admin → Motions → Scheduled
2. **Select motion**
3. **Click "Record Outcome"**
4. **Enter:**
   - Final status (Accepted/Declined/Withdrawn)
   - Votes for
   - Votes against
   - Abstentions
   - Notes (optional)
5. **Submit**

Motion is now archived with full history.

### Exporting Motions

**Single Motion PDF:**
- View motion → Click "Export PDF"

**Batch Export (BPT Booklet):**
```bash
cd backend
npm run export:bpt-motions -- --agenda-date 2025-06-15
```

Generates:
- Full BPT agenda PDF
- Individual motion PDFs
- Signature verification lists

### Motion Moderation

**Inappropriate Content:**
1. Admin can edit or archive any motion
2. Add moderation note
3. Notify creator
4. Log action in audit trail

## Analytics & Reporting

### Dashboard Overview

Access: Admin → Analytics

**Key Metrics:**
- Total users (active/inactive)
- Total motions (by status)
- Signature activity
- Geographic distribution (Landesverband)
- Trend charts (30/90 days)

### Generating Reports

**User Activity Report:**
```bash
cd backend
npm run report:users -- --from 2025-01-01 --to 2025-03-31
```

**Motion Statistics:**
```bash
npm run report:motions -- --year 2025
```

**Signature Analysis:**
```bash
npm run report:signatures -- --motion-id <uuid>
```

**Export Formats:**
- PDF (formatted)
- CSV (data analysis)
- JSON (API integration)

### Audit Logs

**Viewing Logs:**
1. Navigate to Admin → Audit Logs
2. Filter by:
   - Date range
   - User
   - Action type
   - Entity (Motion, User, etc.)
3. Export as CSV

**Log Retention:**
- Logs kept for 3 years (configurable)
- Cannot be deleted or modified
- Anonymized after user deletion (GDPR)

## System Maintenance

### Database Backups

**Automated (Daily):**
```bash
# Configured in cron
0 2 * * * /opt/oedp-md2/scripts/backup-db.sh
```

**Manual Backup:**
```bash
cd /opt/oedp-md2
pg_dump oedp_md2 > backup-$(date +%Y%m%d).sql
```

**Restore:**
```bash
psql oedp_md2 < backup-20250619.sql
```

### System Updates

**Backend Update:**
```bash
cd backend
git pull origin main
npm install
npm run build
npm run migration:run
pm2 restart oedp-md2-backend
```

**Frontend Update:**
```bash
cd frontend
git pull origin main
npm install
npm run build
# Deploy dist/ to web server
```

**Docker Update:**
```bash
docker-compose pull
docker-compose up -d --build
```

### Monitoring

**Health Checks:**
- Backend: `curl http://localhost:3000/health`
- Database: `pg_isready -h localhost -U oedp_user`

**Log Locations:**
- Backend: `backend/logs/`
- Nginx: `/var/log/nginx/`
- PostgreSQL: `/var/log/postgresql/`

**Monitoring Tools:**
- Application logs: Winston
- Server metrics: Optional (Prometheus/Grafana)
- Uptime: Optional (UptimeRobot)

### Database Maintenance

**Vacuum (Weekly):**
```sql
VACUUM ANALYZE;
```

**Reindex (Monthly):**
```sql
REINDEX DATABASE oedp_md2;
```

**Check Database Size:**
```sql
SELECT pg_size_pretty(pg_database_size('oedp_md2'));
```

## Security & Compliance

### User Access Review

**Quarterly Review:**
1. Export user list with roles
2. Verify active users still need access
3. Remove inactive accounts (>6 months)
4. Audit admin/staff role assignments

### Password Policy

**Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Optional: Special character

**Enforcement:**
- Validated on registration
- Enforced on password change
- Bcrypt hashing (cost factor 12)

### GDPR Compliance

**Data Processing:**
- Legal basis: Consent + Legitimate Interest
- Purpose: Member participation
- Retention: 3 years after inactivity
- Data minimization: Only necessary data

**User Rights:**
- Right to access (Profile page)
- Right to rectification (Edit profile)
- Right to erasure (Admin → Delete user)
- Right to data portability (Export feature)

**Breach Response:**
1. Identify and contain breach
2. Assess impact
3. Notify data protection officer
4. Notify affected users (if required)
5. Document incident
6. Report to authorities (72 hours)

### Security Audits

**Monthly:**
- Review audit logs for suspicious activity
- Check failed login attempts
- Verify SSL certificate validity
- Update dependencies

**Quarterly:**
- Full security scan
- Penetration testing (optional)
- Review access controls
- Update security documentation

### Incident Response

**Security Incident:**
1. **Detect:** Monitor logs, alerts
2. **Contain:** Isolate affected systems
3. **Investigate:** Determine scope
4. **Remediate:** Fix vulnerability
5. **Document:** Record incident
6. **Review:** Update procedures

**Emergency Contacts:**
- IT Support: it-support@oedp.de
- Security: security@oedp.de
- Data Protection Officer: datenschutz@oedp.de

## Troubleshooting

### Common Issues

**Users Can't Login:**
1. Check user is active: Admin → Users
2. Verify email is correct
3. Check password hasn't expired
4. Test with "Reset Password"

**Motion Not Appearing:**
1. Check motion status (must be "collecting" for public)
2. Verify `isPublic` flag is true
3. Clear application cache
4. Check database: `SELECT * FROM motions WHERE id='<uuid>'`

**Signatures Not Counting:**
1. Check signature is valid (`isValid = true`)
2. Verify no duplicate signatures
3. Check motion status allows signatures
4. Review audit logs for errors

**Email Not Sending:**
1. Check SMTP configuration in .env
2. Test SMTP connection: `telnet smtp.host.com 587`
3. Review email logs: `backend/logs/`
4. Check email queue if using one

**Database Connection Failed:**
1. Verify PostgreSQL is running: `systemctl status postgresql`
2. Check DATABASE_URL in .env
3. Test connection: `psql $DATABASE_URL`
4. Review PostgreSQL logs

### Performance Issues

**Slow Queries:**
```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**High Memory Usage:**
```bash
# Check Node.js memory
pm2 monit

# Restart if needed
pm2 restart oedp-md2-backend
```

**Database Optimization:**
```sql
-- Analyze tables
ANALYZE motions;
ANALYZE signatures;
ANALYZE users;

-- Update statistics
VACUUM ANALYZE;
```

### Emergency Procedures

**System Down:**
1. Check all services: `docker-compose ps`
2. Review logs: `docker-compose logs`
3. Restart services: `docker-compose restart`
4. Notify users if extended outage

**Data Corruption:**
1. Stop write operations
2. Restore from last known good backup
3. Investigate cause
4. Update backup procedures

**Security Breach:**
1. Isolate affected systems
2. Change all passwords
3. Review audit logs
4. Contact security team
5. Notify affected users

## Best Practices

### Regular Tasks

**Daily:**
- [ ] Check system health
- [ ] Review error logs
- [ ] Monitor disk space

**Weekly:**
- [ ] Review pending motions
- [ ] Check backup integrity
- [ ] Update security patches

**Monthly:**
- [ ] User access review
- [ ] Database maintenance
- [ ] Performance review
- [ ] Security audit

**Quarterly:**
- [ ] Full system backup test
- [ ] Disaster recovery drill
- [ ] Documentation review
- [ ] Staff training

### Communication

**User Announcements:**
- Planned maintenance: 48 hours notice
- System updates: Email + banner
- Security alerts: Immediate notification

**Channels:**
- Email: announcements@oedp.de
- In-app: Banner notifications
- Wiki: https://wiki.oedp.de/md2

## Support

**Internal Support:**
- IT Team: it-support@oedp.de
- Escalation: +49 (0) 9391 504 61

**External Resources:**
- Technical Documentation: `/docs`
- API Documentation: `/docs/api-docs.md`
- User Guide: `/docs/user-guide.md`

---

**Document Version:** 1.0  
**Last Updated:** October 2025  
**Next Review:** January 2026
