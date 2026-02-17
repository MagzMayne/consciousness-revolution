/**
 * RepoPilot Delivery Notification Handler
 * 
 * Sends notification to barbrickdesign@gmail.com when a RepoPilot purchase is made
 * Provides autonomous delivery confirmation via email
 * 
 * Author: Agent R (Barbrick Design)
 * Date: 2026-02-17
 */

import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS
        auth: {
            user: process.env.GMAIL_USER || 'darrick.preble@gmail.com',
            pass: process.env.GMAIL_APP_PASSWORD || 'gzzvemuxppfnjsup'
        }
    });
};

/**
 * Main handler
 */
export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const orderData = JSON.parse(event.body);
        const { plan, email, amount, orderId, timestamp } = orderData;

        console.log('RepoPilot delivery notification:', orderData);

        // Create email content
        const mailOptions = {
            from: '"RepoPilot Notifications" <darrick.preble@gmail.com>',
            to: 'BarbrickDesign@gmail.com',
            cc: 'darrick.preble@gmail.com', // Backup notification
            subject: `🚀 RepoPilot ${plan} Purchase - Immediate Action Required`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container { 
            max-width: 700px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
            padding: 40px 30px; 
            text-align: center;
        }
        .header h1 { 
            color: white; 
            margin: 0; 
            font-size: 32px;
        }
        .header .emoji {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content { 
            padding: 40px 30px; 
        }
        .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .alert-box strong {
            color: #d97706;
            font-size: 18px;
        }
        .order-details {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .order-details h3 {
            margin-top: 0;
            color: #1f2937;
            font-size: 20px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #6b7280;
        }
        .detail-value {
            color: #1f2937;
            font-weight: 500;
        }
        .action-steps {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .action-steps h3 {
            margin-top: 0;
            color: #1e40af;
        }
        .action-steps ol {
            margin: 15px 0;
            padding-left: 20px;
        }
        .action-steps li {
            margin: 10px 0;
            color: #1f2937;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .priority-badge {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">🚀</div>
            <h1>RepoPilot Purchase Alert</h1>
            <div class="priority-badge">⚡ IMMEDIATE ACTION REQUIRED</div>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <strong>⚠️ New Customer Awaiting Access</strong>
                <p style="margin: 10px 0 0 0;">A customer has just purchased RepoPilot and is waiting for their access credentials and setup instructions.</p>
            </div>

            <div class="order-details">
                <h3>📋 Order Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Plan:</span>
                    <span class="detail-value"><strong>${plan}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Customer Email:</span>
                    <span class="detail-value">${email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">$${amount.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    <span class="detail-value">${orderId || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Timestamp:</span>
                    <span class="detail-value">${new Date(timestamp).toLocaleString()}</span>
                </div>
            </div>

            <div class="action-steps">
                <h3>🎯 Required Actions</h3>
                <ol>
                    <li><strong>Send Access Credentials:</strong> Email the customer their RepoPilot GitHub App installation link and API keys</li>
                    <li><strong>Provide Setup Guide:</strong> Send the quick-start documentation for ${plan} plan features</li>
                    <li><strong>Activate Subscription:</strong> Enable their ${plan} plan features in the RepoPilot admin dashboard</li>
                    <li><strong>Schedule Onboarding:</strong> For Pro/Enterprise, schedule an onboarding call within 24 hours</li>
                    <li><strong>Add to CRM:</strong> Record customer in the database and set up billing cycle</li>
                </ol>
            </div>

            <p style="margin: 30px 0; text-align: center;">
                <a href="mailto:${email}?subject=Welcome%20to%20RepoPilot%20${plan}&body=Thank%20you%20for%20subscribing%20to%20RepoPilot!" 
                   class="cta-button">
                    📧 Email Customer Now
                </a>
            </p>

            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
                <strong>Response Time Goal:</strong> Within 1 hour<br>
                <strong>Customer Expectation:</strong> Immediate access to purchased features
            </p>
        </div>

        <div class="footer">
            <p><strong>RepoPilot Autonomous Delivery System</strong></p>
            <p>This is an automated notification from RepoPilot</p>
            <p style="margin-top: 15px;">
                <a href="https://barbrickdesign.github.io/repopilot-landing.html">View Product Page</a> | 
                <a href="mailto:BarbrickDesign@gmail.com">Support</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px;">
                Barbrick Design © 2024-2025 | All Rights Reserved
            </p>
        </div>
    </div>
</body>
</html>
            `,
            text: `
RepoPilot ${plan} Purchase - Immediate Action Required

⚠️ NEW CUSTOMER AWAITING ACCESS

Order Details:
- Plan: ${plan}
- Customer Email: ${email}
- Amount: $${amount.toFixed(2)}
- Order ID: ${orderId || 'N/A'}
- Timestamp: ${new Date(timestamp).toLocaleString()}

REQUIRED ACTIONS:
1. Send Access Credentials: Email the customer their RepoPilot GitHub App installation link and API keys
2. Provide Setup Guide: Send the quick-start documentation for ${plan} plan features
3. Activate Subscription: Enable their ${plan} plan features in the RepoPilot admin dashboard
4. Schedule Onboarding: For Pro/Enterprise, schedule an onboarding call within 24 hours
5. Add to CRM: Record customer in the database and set up billing cycle

Response Time Goal: Within 1 hour
Customer Expectation: Immediate access to purchased features

---
RepoPilot Autonomous Delivery System
Barbrick Design © 2024-2025
            `
        };

        // Send the notification email
        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);

        console.log('Delivery notification sent:', info.messageId);
        console.log('Recipient: BarbrickDesign@gmail.com');

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                messageId: info.messageId,
                recipient: 'BarbrickDesign@gmail.com',
                customerEmail: email
            })
        };

    } catch (error) {
        console.error('Delivery notification error:', error);

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: error.message || 'Failed to send delivery notification',
                details: error.code || 'Unknown error'
            })
        };
    }
}
