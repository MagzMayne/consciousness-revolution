// auth-security-notify.mjs — Consciousness Revolution
// ════════════════════════════════════════════════════════════════
// Webhook handler for Supabase Auth security events.
// Configure this URL in your Supabase project under:
//   Authentication → Webhooks
//
// Endpoint: POST /api/auth-security-notify
//
// Sends users a plain-text email notification whenever a
// security-sensitive action occurs on their account:
//   • Password changed
//   • Email address changed
//   • Phone number changed
//   • Identity (OAuth provider) linked
//   • Identity (OAuth provider) unlinked
//   • MFA method added
//   • MFA method removed
//
// Environment variables:
//   SUPABASE_WEBHOOK_SECRET  — shared secret for HMAC verification
//   GMAIL_USER               — sending address
//   GMAIL_APP_PASSWORD        — Gmail App Password
// ════════════════════════════════════════════════════════════════

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import {
    getSecureCORSHeaders,
    handlePreflight,
    secureLog,
    errorResponse
} from './utils/security.mjs';

// ── Email transport ──────────────────────────────────────────────
function createTransporter() {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER || 'darrick.preble@gmail.com',
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
}

// ── Webhook signature verification ──────────────────────────────
function verifyWebhookSignature(rawBody, signatureHeader) {
    const secret = process.env.SUPABASE_WEBHOOK_SECRET;
    if (!secret) {
        // If no secret is configured, log a warning and allow through
        // (useful during initial setup / development)
        secureLog('SUPABASE_WEBHOOK_SECRET not set — skipping signature check');
        return true;
    }
    if (!signatureHeader) return false;

    // Supabase sends: "sha256=<hex>"
    const [algo, receivedSig] = signatureHeader.split('=');
    if (algo !== 'sha256' || !receivedSig) return false;

    const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(receivedSig, 'hex'),
        Buffer.from(expectedSig, 'hex')
    );
}

// ── Event-to-notification mapping ───────────────────────────────
const SECURITY_EVENTS = {
    'user.password_changed': {
        subject: '🔐 Your password was changed',
        body: (email) => `Hi,

Your Consciousness Revolution account password was just changed.

If you made this change, you can safely ignore this message.

If you did NOT change your password, your account may be compromised.
Please reset your password immediately at:
https://conciousnessrevolution.io/forgot-password.html

Stay safe,
The Consciousness Revolution Team`
    },
    'user.email_changed': {
        subject: '📧 Your email address was changed',
        body: (email, meta) => `Hi,

The email address on your Consciousness Revolution account has been changed.
${meta?.new_email ? `\nNew email: ${meta.new_email}` : ''}

If you made this change, you can safely ignore this message.

If you did NOT make this change, please contact support immediately at:
https://conciousnessrevolution.io/auth.html

The Consciousness Revolution Team`
    },
    'user.phone_changed': {
        subject: '📱 Your phone number was changed',
        body: (email) => `Hi,

The phone number on your Consciousness Revolution account has been updated.

If you did not make this change, please contact support immediately:
https://conciousnessrevolution.io/auth.html

The Consciousness Revolution Team`
    },
    'user.identity.linked': {
        subject: '🔗 A new sign-in method was added to your account',
        body: (email, meta) => `Hi,

A new sign-in method (${meta?.provider || 'external provider'}) has been linked to your Consciousness Revolution account.

If you added this connection, no action is needed.

If you did NOT do this, please secure your account immediately:
https://conciousnessrevolution.io/auth.html

The Consciousness Revolution Team`
    },
    'user.identity.unlinked': {
        subject: '🔓 A sign-in method was removed from your account',
        body: (email, meta) => `Hi,

A sign-in method (${meta?.provider || 'external provider'}) has been removed from your Consciousness Revolution account.

If you made this change, no action is needed.

If you did NOT do this, please secure your account immediately:
https://conciousnessrevolution.io/auth.html

The Consciousness Revolution Team`
    },
    'user.mfa.added': {
        subject: '🛡️ Multi-factor authentication was added to your account',
        body: (email) => `Hi,

Multi-factor authentication (MFA) has been enabled on your Consciousness Revolution account.

This is a great security step! If you made this change, no action is needed.

If you did NOT enable MFA, please secure your account immediately:
https://conciousnessrevolution.io/auth.html

The Consciousness Revolution Team`
    },
    'user.mfa.removed': {
        subject: '⚠️ Multi-factor authentication was removed from your account',
        body: (email) => `Hi,

Multi-factor authentication (MFA) has been disabled on your Consciousness Revolution account.

Without MFA your account is less secure. If you made this change intentionally, no action is needed.

If you did NOT remove MFA, please secure your account immediately:
https://conciousnessrevolution.io/auth.html

The Consciousness Revolution Team`
    }
};

export async function handler(event) {
    const origin = event.headers?.origin || event.headers?.Origin || '';

    if (event.httpMethod === 'OPTIONS') return handlePreflight(origin);

    if (event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    const rawBody = event.body || '';

    // Verify Supabase webhook signature
    const signatureHeader = event.headers['x-supabase-signature'] || event.headers['x-webhook-signature'] || '';
    if (!verifyWebhookSignature(rawBody, signatureHeader)) {
        secureLog('Security notify: invalid webhook signature');
        return errorResponse('Forbidden', origin, 403);
    }

    let payload;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return errorResponse('Invalid JSON payload', origin, 400);
    }

    const eventType = payload?.type || payload?.event || '';
    const userEmail  = payload?.record?.email || payload?.user?.email || payload?.email || '';
    const meta       = payload?.record || payload?.metadata || {};

    secureLog('Security notify: received event', { type: eventType });

    const notification = SECURITY_EVENTS[eventType];
    if (!notification) {
        // Not a security event we handle — acknowledge without sending email
        return {
            statusCode: 200,
            headers: getSecureCORSHeaders(origin),
            body: JSON.stringify({ ok: true, skipped: true, reason: 'unhandled event type' })
        };
    }

    if (!userEmail) {
        secureLog('Security notify: no email address in payload', { type: eventType });
        return {
            statusCode: 200,
            headers: getSecureCORSHeaders(origin),
            body: JSON.stringify({ ok: true, skipped: true, reason: 'no email address' })
        };
    }

    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: `"Consciousness Revolution" <${process.env.GMAIL_USER || 'darrick.preble@gmail.com'}>`,
            to: userEmail,
            subject: notification.subject,
            text: notification.body(userEmail, meta)
        });

        secureLog('Security notify: email sent', { type: eventType });

        return {
            statusCode: 200,
            headers: getSecureCORSHeaders(origin),
            body: JSON.stringify({ ok: true })
        };
    } catch (err) {
        secureLog('Security notify: email send failed', { error: err.message, type: eventType });
        // Return 200 so Supabase doesn't keep retrying — we log the failure internally
        return {
            statusCode: 200,
            headers: getSecureCORSHeaders(origin),
            body: JSON.stringify({ ok: false, error: 'Email delivery failed' })
        };
    }
}
