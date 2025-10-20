# API Documentation - ÖDP-MD²

Base URL: `http://localhost:3000/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register
**POST** `/api/auth/register`

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "memberId": "MEM-001",
  "landesverband": "Bayern",
  "kreisverband": "München",
  "postalCode": "80331",
  "city": "München"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registrierung erfolgreich",
  "data": {
    "user": { ... }
  }
}
```

### Login
**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Anmeldung erfolgreich",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Logout
**POST** `/api/auth/logout` 🔒

Logout current user.

**Response:** `200 OK`

### Get Current User
**GET** `/api/auth/me` 🔒

Get authenticated user's profile.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "member",
      "membershipStatus": "active"
    }
  }
}
```

## Motions

### List Motions
**GET** `/api/motions`

Get all public motions.

**Query Parameters:**
- `status` - Filter by status
- `type` - Filter by motion type
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search in title
- `sortBy` - Sort field (createdAt, signatureCount, etc.)
- `sortOrder` - ASC or DESC

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "motions": [ ... ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### Get Motion by ID
**GET** `/api/motions/:id`

Get motion details with signatures.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "motion": {
      "id": "uuid",
      "title": "Motion Title",
      "description": "...",
      "fullText": "...",
      "type": "sachantrag",
      "status": "collecting",
      "signatureCount": 45,
      "signatureThreshold": 80,
      "creator": { ... },
      "trustPerson": { ... },
      "signatures": [ ... ]
    }
  }
}
```

### Create Motion
**POST** `/api/motions` 🔒

Create a new motion (draft).

**Request Body:**
```json
{
  "title": "Motion Title",
  "description": "Short description",
  "fullText": "Full text of the motion",
  "type": "sachantrag",
  "targetParagraph": "§10.1",
  "tags": ["Environment", "Energy"]
}
```

**Response:** `201 Created`

### Update Motion
**PUT** `/api/motions/:id` 🔒

Update motion (only creator or admin, only drafts).

**Request Body:** Same as create (partial update)

**Response:** `200 OK`

### Publish for Signatures
**POST** `/api/motions/:id/publish` 🔒

Publish motion for signature collection.

**Response:** `200 OK`

### Sign Motion
**POST** `/api/motions/:id/sign` 🔒

Add signature to a motion.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Unterschrift erfolgreich hinzugefügt",
  "data": {
    "motion": { ... },
    "signature": {
      "id": "uuid",
      "signerId": "uuid",
      "signedAt": "2025-01-01T10:00:00Z"
    }
  }
}
```

### Remove Signature
**DELETE** `/api/motions/:id/sign` 🔒

Remove own signature from motion.

**Response:** `200 OK`

### Validate Motion
**POST** `/api/motions/:id/validate` 🔒 (BGSt only)

Approve or reject a submitted motion.

**Request Body:**
```json
{
  "isApproved": true,
  "validationNotes": "Optional notes"
}
```

**Response:** `200 OK`

### Schedule Motion
**POST** `/api/motions/:id/schedule` 🔒 (BAntrK only)

Schedule motion for BPT.

**Request Body:**
```json
{
  "bptAgendaItem": "TOP 5.2",
  "scheduledFor": "2025-06-15T09:00:00Z",
  "bptVenue": "München"
}
```

**Response:** `200 OK`

### Record Outcome
**POST** `/api/motions/:id/outcome` 🔒 (BAntrK only)

Record voting results.

**Request Body:**
```json
{
  "status": "accepted",
  "votesFor": 150,
  "votesAgainst": 30,
  "votesAbstain": 20,
  "outcomeNotes": "Motion passed"
}
```

**Response:** `200 OK`

### Export PDF
**GET** `/api/motions/:id/pdf`

Download motion as PDF.

**Response:** `200 OK` (application/pdf)

### My Motions
**GET** `/api/motions/my/motions` 🔒

Get motions created by current user.

**Response:** `200 OK`

### My Signatures
**GET** `/api/motions/my/signatures` 🔒

Get motions signed by current user.

**Response:** `200 OK`

## Users

### List Users
**GET** `/api/users` 🔒

Get all users (paginated).

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search query

**Response:** `200 OK`

### Get User by ID
**GET** `/api/users/:id` 🔒

Get user details.

**Response:** `200 OK`

## Admin

### Get Analytics
**GET** `/api/admin/analytics` 🔒 (Staff only)

Get system statistics.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1000,
      "activeUsers": 850,
      "totalMotions": 50,
      "totalSignatures": 2500
    },
    "motionsByStatus": [
      { "status": "collecting", "count": 10 },
      { "status": "submitted", "count": 5 }
    ]
  }
}
```

### List All Users
**GET** `/api/admin/users` 🔒 (Admin only)

Get all users with full details.

**Response:** `200 OK`

### Update User Role
**PUT** `/api/admin/users/:id/role` 🔒 (Admin only)

Change user role.

**Request Body:**
```json
{
  "role": "bgst"
}
```

**Response:** `200 OK`

### Toggle User Status
**PATCH** `/api/admin/users/:id/status` 🔒 (Admin only)

Activate or deactivate user.

**Response:** `200 OK`

### Get Audit Logs
**GET** `/api/admin/audit-logs` 🔒 (Staff only)

Get system audit logs.

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `userId` - Filter by user
- `entityType` - Filter by entity
- `action` - Filter by action

**Response:** `200 OK`

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- **Auth endpoints:** 5 requests per 15 minutes
- **Signature endpoints:** 10 signatures per minute
- **Other endpoints:** 100 requests per 15 minutes

## Data Types

### Motion Types
- `satzungsaenderung` - Charter Amendment
- `programmaenderung` - Program Amendment
- `grundsatzantrag` - Fundamental Motion
- `sachantrag` - Factual Motion
- `dringlichkeitsantrag` - Urgent Motion

### Motion Status
- `draft` - Draft
- `collecting` - Collecting Signatures
- `submitted` - Submitted to BGSt
- `under_review` - Under Review
- `approved` - Approved
- `rejected` - Rejected
- `scheduled` - Scheduled for BPT
- `accepted` - Accepted at BPT
- `declined` - Declined at BPT
- `withdrawn` - Withdrawn

### User Roles
- `member` - Regular Member
- `delegate` - Delegate
- `bgst` - Bundesgeschäftsstelle Staff
- `bantrk` - Antragskommission Member
- `buvo` - Bundesvorstand Member
- `admin` - Administrator

🔒 = Requires Authentication
