# Email Authentication Implementation

## Overview

This implementation adds email-based authentication to bCert.html as an alternative to MetaMask wallet authentication. Users can now sign up and sign in using just their email and password, without requiring a crypto wallet.

## Features

- ✅ Email sign-up with password validation
- ✅ Email sign-in with credential verification
- ✅ Session persistence using localStorage
- ✅ Auto-login on page refresh
- ✅ Secure logout functionality
- ✅ User data persistence per authentication method
- ✅ Password reset flow (demo mode)
- ✅ Dual authentication tabs (Email/Wallet)
- ✅ SHA-256 password hashing using Web Crypto API

## Files

- **`email-auth.js`** - Email authentication module
- **`bCert.html`** - Updated to support both email and wallet authentication

## Usage

### Sign Up

1. Click "SIGN IN" button
2. Select "Email" tab
3. Click "Sign Up" toggle
4. Enter email and password (min 6 characters)
5. Click "Create Account"

### Sign In

1. Click "SIGN IN" button
2. Select "Email" tab (default)
3. Enter email and password
4. Click "Sign In"

### Switch Authentication Methods

Users can switch between Email and Wallet authentication methods using the tabs in the authentication modal.

## ⚠️ CRITICAL SECURITY WARNINGS

### This is NOT Production-Ready

This implementation is a **client-side only** solution designed for a static GitHub Pages site. It has significant security limitations and should **NOT be used for production applications** without major modifications.

### Known Security Limitations

1. **Client-Side Storage**
   - All authentication data stored in localStorage
   - Accessible to any JavaScript code on the page
   - Vulnerable to XSS attacks
   - No server-side validation or protection

2. **Password Hashing**
   - Uses SHA-256 (better than plain text, but not ideal)
   - No salt or key derivation function (KDF)
   - Vulnerable to rainbow table attacks
   - Should use PBKDF2, bcrypt, scrypt, or Argon2 in production

3. **No Server-Side Validation**
   - No protection against automated attacks
   - No rate limiting for login attempts
   - No account lockout mechanisms
   - No IP-based security measures

4. **No Email Verification**
   - Accounts created without email confirmation
   - No way to recover accounts or reset passwords securely

5. **Session Management**
   - Sessions stored in localStorage (not secure)
   - No proper session expiration
   - No secure HTTP-only cookies
   - No CSRF protection

6. **Data Persistence**
   - User data never deleted automatically
   - No data encryption at rest
   - Accessible through browser developer tools

## For Production Use

To make this production-ready, you would need to:

### Backend Requirements

1. **Server-Side Authentication**
   ```
   - Node.js/Express, Python/Django, PHP/Laravel, etc.
   - Proper database (PostgreSQL, MySQL, MongoDB)
   - RESTful API or GraphQL
   ```

2. **Proper Password Hashing**
   ```javascript
   // Example with bcrypt (Node.js)
   const bcrypt = require('bcrypt');
   const saltRounds = 10;
   const hashedPassword = await bcrypt.hash(password, saltRounds);
   ```

3. **Session Management**
   ```javascript
   // Use secure HTTP-only cookies
   res.cookie('session', token, {
     httpOnly: true,
     secure: true,
     sameSite: 'strict',
     maxAge: 3600000 // 1 hour
   });
   ```

4. **Rate Limiting**
   ```javascript
   // Example with express-rate-limit
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5 // 5 attempts
   });
   ```

5. **Email Verification**
   ```
   - Send verification email with unique token
   - Verify email before activating account
   - Implement secure password reset flow
   ```

6. **Additional Security**
   ```
   - HTTPS only (SSL/TLS certificates)
   - CSRF protection tokens
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection headers
   - Content Security Policy
   - Two-factor authentication (2FA)
   - Account lockout after failed attempts
   - Logging and monitoring
   ```

## Recommended Authentication Services

Instead of building from scratch, consider using established authentication services:

- **Auth0** - Complete authentication platform
- **Firebase Authentication** - Google's auth service
- **AWS Cognito** - AWS authentication service
- **Supabase Auth** - Open-source auth platform
- **Clerk** - Modern authentication platform
- **NextAuth.js** - Authentication for Next.js apps
- **Passport.js** - Node.js authentication middleware

## Current Use Cases

This implementation is suitable for:

- ✅ Educational demos and tutorials
- ✅ Proof-of-concept prototypes
- ✅ Local development and testing
- ✅ Non-sensitive hobby projects
- ✅ Learning authentication concepts

This implementation is **NOT** suitable for:

- ❌ Production applications
- ❌ Applications handling sensitive data
- ❌ Financial or healthcare applications
- ❌ Applications requiring GDPR/HIPAA compliance
- ❌ Multi-user production systems

## Support

This is a demo implementation for the Barbrick Certification Academy project. For questions or issues, please open an issue on the GitHub repository.

## License

MIT License - See repository LICENSE file for details.

---

**Remember:** Security is not a feature you can add later. Plan for proper authentication from the start of any production project.
