/**
 * Send RepoPilot Welcome Email to Customer
 * 
 * Sends welcome and onboarding email to customers after purchase
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

// Plan-specific content
const getPlanContent = (plan) => {
    const content = {
        'Free': {
            features: [
                'Basic AI assistance for code reviews',
                'Limited monthly usage (100 requests)',
                'Community support via GitHub Discussions',
                'Access to public repository features',
                'Basic code quality checks'
            ],
            nextSteps: [
                'Install the RepoPilot GitHub App on your repositories',
                'Connect your first repository to start getting AI assistance',
                'Try the basic code review features',
                'Join our community Discord for tips and tricks',
                'Upgrade to Pro anytime for unlimited features'
            ],
            setupUrl: 'https://github.com/apps/repopilot-free'
        },
        'Pro': {
            features: [
                'Unlimited AI assistance and code reviews',
                'Advanced automation and CI/CD integration',
                'Priority support with 24-hour response time',
                'Private repository access',
                'Custom AI models trained on your codebase',
                'Advanced analytics and insights',
                'Team collaboration tools',
                'Automated testing and quality assurance'
            ],
            nextSteps: [
                'Install the RepoPilot GitHub App (Pro version)',
                'Configure your organization settings',
                'Set up team access and permissions',
                'Schedule your onboarding call (link will be sent within 24 hours)',
                'Explore advanced features in the dashboard'
            ],
            setupUrl: 'https://github.com/apps/repopilot-pro'
        },
        'Enterprise': {
            features: [
                'Everything in Pro plan',
                'Custom AI models tailored to your needs',
                'Dedicated support team with SLA guarantees',
                'On-premise deployment options',
                'Advanced security and compliance features',
                'White-label options',
                'Custom integrations with your tools',
                'Priority feature requests'
            ],
            nextSteps: [
                'Schedule your Enterprise onboarding call',
                'Discuss custom requirements with our team',
                'Review security and compliance documentation',
                'Plan your deployment strategy',
                'Set up dedicated support channels'
            ],
            setupUrl: 'https://barbrickdesign.github.io/repopilot-enterprise-setup.html'
        }
    };

    return content[plan] || content['Free'];
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
        const { email, plan, orderId, timestamp } = JSON.parse(event.body);

        if (!email) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Missing email address' })
            };
        }

        console.log('Sending RepoPilot welcome email to:', email, 'Plan:', plan);

        const planContent = getPlanContent(plan);
        const transporter = createTransporter();

        // Build the welcome email
        const mailOptions = {
            from: '"RepoPilot Team" <darrick.preble@gmail.com>',
            to: email,
            bcc: 'BarbrickDesign@gmail.com', // Notify owner
            subject: `Welcome to RepoPilot ${plan}! 🚀`,
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
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
            padding: 50px 30px; 
            text-align: center;
        }
        .header h1 { 
            color: white; 
            margin: 0; 
            font-size: 36px;
        }
        .header .emoji {
            font-size: 64px;
            margin-bottom: 15px;
        }
        .content { 
            padding: 40px 30px; 
        }
        .welcome-message {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .features-box {
            background: #f0f9ff;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .features-box h3 {
            color: #1e40af;
            margin-top: 0;
        }
        .features-box ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        .features-box li {
            margin: 10px 0;
            color: #1f2937;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 25px 0;
            font-size: 16px;
        }
        .steps-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 25px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .steps-box h3 {
            color: #d97706;
            margin-top: 0;
        }
        .steps-box ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        .steps-box li {
            margin: 12px 0;
            color: #1f2937;
        }
        .support-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .support-box a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
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
        .plan-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">🚀</div>
            <h1>Welcome to RepoPilot!</h1>
            <div class="plan-badge">${plan} Plan</div>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <p>Thank you for choosing RepoPilot! You've just joined thousands of developers who are accelerating their development with AI-powered automation.</p>
                
                <p><strong>Your payment has been confirmed and your account is now active.</strong></p>
            </div>

            <div class="features-box">
                <h3>✨ What You Get</h3>
                <ul>
                    ${planContent.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="${planContent.setupUrl}" class="cta-button">
                    🔧 Start Setup Now
                </a>
            </p>

            <div class="steps-box">
                <h3>🎯 Next Steps</h3>
                <ol>
                    ${planContent.nextSteps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>

            <div class="support-box">
                <p><strong>Need Help?</strong></p>
                <p style="margin: 15px 0;">
                    <a href="mailto:BarbrickDesign@gmail.com">📧 Email Support</a> |
                    <a href="https://barbrickdesign.github.io/repopilot-landing.html">📚 Documentation</a> |
                    <a href="https://github.com/overkor-tek/consciousness-revolution/discussions">💬 Community</a>
                </p>
                <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
                    ${plan === 'Pro' ? 'Priority support - 24 hour response time' : 'Community support via GitHub Discussions'}
                </p>
            </div>

            <p style="margin-top: 30px; color: #6b7280;">
                We're excited to have you on board! If you have any questions or need assistance getting started, just reply to this email.
            </p>

            <p style="margin-top: 20px;">
                <strong>The RepoPilot Team</strong><br>
                Barbrick Design
            </p>
        </div>

        <div class="footer">
            <p><strong>Order Confirmation</strong></p>
            <p>Order ID: ${orderId || 'N/A'}</p>
            <p>Date: ${new Date(timestamp).toLocaleString()}</p>
            <p style="margin-top: 20px;">
                <a href="https://barbrickdesign.github.io/repopilot-landing.html">RepoPilot Home</a> |
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
Welcome to RepoPilot ${plan}!

Thank you for choosing RepoPilot! You've just joined thousands of developers who are accelerating their development with AI-powered automation.

Your payment has been confirmed and your account is now active.

WHAT YOU GET:
${planContent.features.map(feature => `• ${feature}`).join('\n')}

START SETUP: ${planContent.setupUrl}

NEXT STEPS:
${planContent.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

NEED HELP?
Email: BarbrickDesign@gmail.com
Documentation: https://barbrickdesign.github.io/repopilot-landing.html
Community: https://github.com/overkor-tek/consciousness-revolution/discussions

${plan === 'Pro' ? 'Priority support - 24 hour response time' : 'Community support via GitHub Discussions'}

We're excited to have you on board! If you have any questions or need assistance getting started, just reply to this email.

The RepoPilot Team
Barbrick Design

---
Order ID: ${orderId || 'N/A'}
Date: ${new Date(timestamp).toLocaleString()}
            `
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        console.log('Welcome email sent:', info.messageId);
        console.log('Recipient:', email);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                messageId: info.messageId,
                recipient: email
            })
        };

    } catch (error) {
        console.error('Welcome email send error:', error);

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: error.message || 'Failed to send welcome email',
                details: error.code || 'Unknown error'
            })
        };
    }
}
