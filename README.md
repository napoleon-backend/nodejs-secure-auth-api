# Production-Ready Node.js & Express Authentication API

An enterprise-grade, secure, and fully scalable Authentication API built using Node.js, Express, and Mongoose. This project demonstrates strict **Clean Architecture** patterns, robust input sanitization, automated transactional email workflows, and production-level security checkpoints.

## 🚀 Key Architectural Features

- **Clean Architecture Layering:** Strict separation of concerns across Routing, Request Validation Shields (Express-Validator), Business Logic (Services), Request Orchestration (Controllers), and Data Models (Mongoose).
- **Secure Session Lifecycles:** Hybrid authentication approach featuring Stateful Http-Only cookie transmissions coupled with stateless JWT authorization blocks.
- **Dual-Token Email Verification:** Automated transactional confirmation dispatches on registration utilizing encrypted SHA-256 database token verification via Nodemailer.
- **Password Reset Lifecycle:** Time-sensitive, 10-minute token-based recovery system with automatic pre-save schema hashing (`bcrypt`).
- **Input Defense Layer:** Complete shielding against parameter injection and malformed payloads using `express-validator` whitelisting and sanitization.
- **Global Fault Tolerance:** Centralized JSON error handling middleware using a functional `catchAsync` wrapper to prevent server crashes and obscure raw operational stack traces in production.
- **Fail-Fast Configuration:** Integrated environment variable validator to ensure infrastructure readiness (SMTP, Database, JWT Secrets) before server boot.

## 🛠️ Tech Stack & Infrastructure

- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Framework:** Express.js
- **Database:** MongoDB / Mongoose ODM
- **Security:** JWT (jsonwebtoken), bcrypt, Crypto (Node.js native)
- **Email:** Nodemailer (SMTP Integration)
- **Validation:** Express-Validator

---

## 📂 Project Structure

```text
src/
 ├── config/             # Database connection & global configs
 ├── controllers/        # Request handling & sequence orchestration
 ├── middleware/         # Security guards (Auth, RBAC, Error Handling)
 ├── model/              # Mongoose schemas & business logic hooks
 ├── routes/             # API endpoint definitions
 ├── services/           # Business logic & Validation logic
 ├── utils/              # Reusable utilities (Email, Async Wrappers)
 └── validation/         # Input schema definitions
```

---

## 🛣️ API Endpoints Reference

### 🔓 Public Authentication Routes

- `POST /api/v1/users/` - **Signup**: Registers a new profile and dispatches a 24-hour verification link.
- `POST /api/v1/users/login` - **Login**: Verifies credentials and issues session tokens.
- `GET  /api/v1/users/verify-email/:token` - **Verify**: Validates incoming hashes and activates account.
- `POST /api/v1/users/forgotPassword` - **Recovery**: Issues a 10-minute recovery token via SMTP.
- `PATCH /api/v1/users/resetPassword/:token` - **Reset**: Validates parameters and updates credentials.

### Respond structure

```
{
"success": true,
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhM2QzMDY0YTk5NWI3NThmZGRmZWE3ZiIsImlhdCI6MTc4MjM5NDk5MCwiZXhwIjoxNzgyMzk0OTkwfQ.F_C_Mz9ce_zjyOkfyEJ4qIe-Fa_4nmXdt3PVx62x8oA",
    "data": {
    "name": "Test User",
    "email": "test@napoleon-backend.com",
    "role": "user",
    "isVerified": false,
    "\_id": "6a3d3064a995b758fddfea7f",
    "createdAt": "2026-06-25T13:43:01.006Z",
    "updatedAt": "2026-06-25T13:43:01.152Z",
    "\_\_v": 0,
    "emailVerificationToken": "23bd9dea7ebcb66c73f1a0f9b01f9320e7075c0bfca57817804c0f0a4f0080aa",
    "emailVerificationExpires": "2026-06-26T13:43:01.151Z"
    }
}
```

### 🔐 Protected Operations (Requires Auth Token)

- `GET    /api/v1/users/me` - Resolves the current authenticated profile.
- `PATCH  /api/v1/users/update-me` - Safely modifies explicit profile properties.
- `DELETE /api/v1/users/delete-me` - Removes the authenticated user profile instance.
- `GET    /api/v1/users/` - (Admin) Retrieves all registered users.
- `GET    /api/v1/users/:id` - (Admin) Retrieves a specific user profile by ID.

---

## ⚙️ Quick Start Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/napoleon-backend/nodejs-secure-auth-api.git
    cd nodejs-secure-auth-api
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:

    ```env
    PORT=5000
    NODE_ENV=development
    DATABASE_URL=your_mongodb_connection_string

    JWT_SECRET=your_long_random_secret_string
    JWT_EXPIRES_IN=90d
    JWT_COOKIE_EXPIRES_IN=90

    EMAIL_HOST=sandbox.smtp.mailtrap.io
    EMAIL_PORT=2525
    EMAIL_USERNAME=your_mailtrap_username
    EMAIL_PASSWORD=your_mailtrap_password
    ```

4.  **Run in development mode:**
    ```bash
    npm run dev
    ```

---

## 🛡️ Security Implementation Details

- **HttpOnly Cookies:** Mitigates XSS (Cross-Site Scripting) by preventing client-side scripts from accessing session tokens.
- **Verification Shield:** The `protect` middleware strictly enforces `isVerified` status before granting access to sensitive data.
- **Password Hashing:** Implements one-way salt hashing using `bcrypt` via Mongoose middleware, ensuring passwords are never stored in plain text.
- **Token Hashing:** Email and Password reset tokens are hashed using SHA-256 before storage, adhering to the principle of least privilege even in the event of a database compromise.

---

Developed with ❤️ by Napoleon
