/**
 * UNIVERSAL FEEDBACK WIDGET - CONSCIOUSNESS REVOLUTION
 *
 * Position: Bottom-left (opposite of ARAYA)
 * Types: Bug Report / Feature Request / Upgrade Idea
 * Auto-captures: page URL, timestamp, user agent
 *
 * Add to any page: <script src="/components/feedback-widget.js"></script>
 * Backend: /.netlify/functions/araya-feedback
 *
 * Created: 2026-03-14
 */

(function() {
    'use strict';

    const FEEDBACK_ENDPOINT = '/.netlify/functions/araya-feedback';

    // Prevent double-loading
    if (window.__FEEDBACK_WIDGET_LOADED__) return;
    window.__FEEDBACK_WIDGET_LOADED__ = true;

    // Create floating button (BOTTOM-LEFT)
    const btn = document.createElement('button');
    btn.innerHTML = '📝';
    btn.title = 'Submit Feedback, Bug Report, or Upgrade Idea';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 3px solid rgba(255,255,255,0.2);
        font-size: 28px;
        cursor: pointer;
        z-index: 9998;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
    `;

    // Responsive positioning
    const updatePosition = () => {
        if (window.innerWidth <= 480) {
            // Mobile
            btn.style.bottom = '15px';
            btn.style.left = '15px';
            btn.style.width = '48px';
            btn.style.height = '48px';
            btn.style.fontSize = '24px';
        } else if (window.innerWidth <= 768) {
            // Tablet
            btn.style.bottom = '18px';
            btn.style.left = '18px';
            btn.style.width = '52px';
            btn.style.height = '52px';
            btn.style.fontSize = '26px';
        } else {
            // Desktop
            btn.style.bottom = '20px';
            btn.style.left = '20px';
            btn.style.width = '56px';
            btn.style.height = '56px';
            btn.style.fontSize = '28px';
        }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    btn.onmouseover = () => {
        btn.style.transform = 'scale(1.1) rotate(5deg)';
        btn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    };
    btn.onmouseout = () => {
        btn.style.transform = 'scale(1) rotate(0deg)';
        btn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    };
    btn.onclick = openFeedbackModal;

    document.body.appendChild(btn);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'feedbackModal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(4px);
        z-index: 100000;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-in;
    `;

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #667eea;
            border-radius: 16px;
            padding: 2rem;
            max-width: 480px;
            width: 90%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        ">
            <h2 style="
                color: #667eea;
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
                text-align: center;
            ">📝 Share Your Feedback</h2>

            <p style="
                color: #aaa;
                text-align: center;
                margin-bottom: 1.5rem;
                font-size: 0.9rem;
            ">Help us improve the Consciousness Revolution</p>

            <label style="
                display: block;
                color: #888;
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
                font-weight: 600;
            ">Type of Feedback:</label>

            <select id="feedbackType" style="
                width: 100%;
                background: rgba(0,0,0,0.5);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 8px;
                color: #fff;
                padding: 0.75rem;
                font-size: 1rem;
                margin-bottom: 1rem;
                cursor: pointer;
            ">
                <option value="feature">💡 Feature Request</option>
                <option value="bug">🐛 Bug Report</option>
                <option value="suggestion">⚡ Upgrade Idea</option>
                <option value="compliment">❤️ Compliment</option>
                <option value="other">💬 Other</option>
            </select>

            <label style="
                display: block;
                color: #888;
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
                font-weight: 600;
            ">Your Message:</label>

            <textarea id="feedbackText" placeholder="Share your thoughts, report a bug, or suggest an improvement..." style="
                width: 100%;
                height: 140px;
                background: rgba(0,0,0,0.5);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 8px;
                color: #fff;
                padding: 0.75rem;
                font-size: 1rem;
                resize: none;
                margin-bottom: 1rem;
                font-family: inherit;
            "></textarea>

            <div style="
                background: rgba(102, 126, 234, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.2);
                border-radius: 8px;
                padding: 0.75rem;
                margin-bottom: 1rem;
                font-size: 0.8rem;
                color: #888;
            ">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span>🔒</span>
                    <strong style="color: #667eea;">Privacy First</strong>
                </div>
                <div>Feedback is anonymous. Auto-captured: page URL, timestamp</div>
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button id="feedbackCancel" style="
                    flex: 1;
                    padding: 0.875rem;
                    background: transparent;
                    border: 2px solid rgba(255,255,255,0.2);
                    color: #fff;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.2s;
                ">Cancel</button>
                <button id="feedbackSubmit" style="
                    flex: 2;
                    padding: 0.875rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: #fff;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: bold;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                ">Send Feedback</button>
            </div>

            <p id="feedbackStatus" style="
                margin-top: 1rem;
                text-align: center;
                font-size: 0.9rem;
                min-height: 20px;
            "></p>
        </div>
    `;

    document.body.appendChild(modal);

    // Add animation keyframe
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        #feedbackSubmit:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        #feedbackCancel:hover {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.4);
        }
    `;
    document.head.appendChild(style);

    // Event listeners
    modal.querySelector('#feedbackCancel').onclick = closeFeedbackModal;
    modal.querySelector('#feedbackSubmit').onclick = submitFeedback;
    modal.onclick = (e) => {
        if (e.target === modal) closeFeedbackModal();
    };

    function openFeedbackModal() {
        modal.style.display = 'flex';
        document.getElementById('feedbackText').focus();
    }

    function closeFeedbackModal() {
        modal.style.display = 'none';
        document.getElementById('feedbackText').value = '';
        document.getElementById('feedbackType').value = 'feature';
        document.getElementById('feedbackStatus').textContent = '';
    }

    async function submitFeedback() {
        const type = document.getElementById('feedbackType').value;
        const text = document.getElementById('feedbackText').value.trim();
        const status = document.getElementById('feedbackStatus');

        if (!text) {
            status.style.color = '#e74c3c';
            status.textContent = '⚠️ Please enter your feedback';
            return;
        }

        // Auto-capture metadata
        const metadata = {
            type: type,
            message: text,
            page: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            anonymous: true
        };

        try {
            status.style.color = '#f39c12';
            status.textContent = '📤 Sending...';

            const submitBtn = document.getElementById('feedbackSubmit');
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';

            const response = await fetch(FEEDBACK_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata)
            });

            const data = await response.json();

            if (data.success) {
                status.style.color = '#2ecc71';
                status.textContent = '✅ ' + (data.araya_response || 'Feedback sent successfully!');

                // Auto-close after success
                setTimeout(() => {
                    closeFeedbackModal();
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }, 2500);
            } else {
                throw new Error(data.error || 'Failed to send');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            status.style.color = '#e74c3c';
            status.textContent = '❌ Failed to send. Please try again.';

            const submitBtn = document.getElementById('feedbackSubmit');
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }

    // Keyboard shortcut: Ctrl+Shift+F to open feedback
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            openFeedbackModal();
        }
    });

    console.log('✅ Feedback Widget loaded | Shortcut: Ctrl+Shift+F | Position: Bottom-Left');

})();
