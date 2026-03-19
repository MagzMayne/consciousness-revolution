// RootIB: RB-20260319142113-A0C339E2
/**
 * ARAYA FEEDBACK WIDGET
 * Add to any page: <script src="js/bug-widget.js"></script>
 * Reports feature requests and feedback via Netlify function (araya-feedback)
 * Stores in Supabase with sentiment analysis
 */

(function() {
    // Use Netlify function instead of direct Discord webhook (avoids CORS)
    const FEEDBACK_ENDPOINT = '/.netlify/functions/araya-feedback';

    // Create button
    const btn = document.createElement('button');
    btn.innerHTML = '💡';
    btn.title = 'Request Feature / Give Feedback';
    btn.style.cssText = `
        position: fixed;
        bottom: 180px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: rgba(100,200,255,0.9);
        border: 2px solid #64c8ff;
        font-size: 24px;
        cursor: pointer;
        z-index: 998;
        transition: all 0.3s;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        pointer-events: auto;
    `;
    
    // Add responsive positioning for mobile
    const updatePosition = () => {
        if (window.innerWidth <= 480) {
            // Mobile (very small screens)
            btn.style.bottom = '145px';
            btn.style.right = '10px';
            btn.style.width = '42px';
            btn.style.height = '42px';
            btn.style.fontSize = '20px';
        } else if (window.innerWidth <= 768) {
            // Tablet
            btn.style.bottom = '160px';
            btn.style.right = '15px';
            btn.style.width = '45px';
            btn.style.height = '45px';
            btn.style.fontSize = '24px';
        } else {
            // Desktop
            btn.style.bottom = '180px';
            btn.style.right = '20px';
            btn.style.width = '50px';
            btn.style.height = '50px';
            btn.style.fontSize = '24px';
        }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = openBugModal;
    document.body.appendChild(btn);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'arayaBugModal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 100000;
        align-items: center;
        justify-content: center;
    `;
    modal.innerHTML = `
        <div style="background:#1a0a2e;border:2px solid gold;border-radius:12px;padding:2rem;max-width:400px;width:90%;font-family:sans-serif;">
            <h2 style="color:gold;margin:0 0 1rem 0;">💡 Request Feature / Feedback</h2>
            <textarea id="arayaBugText" placeholder="What feature would you like? Or share feedback..." style="
                width:100%;height:120px;background:rgba(0,0,0,0.5);
                border:1px solid rgba(255,215,0,0.3);border-radius:8px;
                color:#fff;padding:1rem;font-size:1rem;resize:none;
            "></textarea>
            <div style="display:flex;gap:1rem;margin-top:1rem;">
                <button id="arayaBugCancel" style="flex:1;padding:0.75rem;background:transparent;border:2px solid rgba(255,215,0,0.5);color:gold;border-radius:8px;cursor:pointer;">Cancel</button>
                <button id="arayaBugSubmit" style="flex:1;padding:0.75rem;background:gold;border:none;color:#000;border-radius:8px;cursor:pointer;font-weight:bold;">Send</button>
            </div>
            <p id="arayaBugStatus" style="margin-top:1rem;text-align:center;"></p>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#arayaBugCancel').onclick = closeBugModal;
    modal.querySelector('#arayaBugSubmit').onclick = submitBug;
    modal.onclick = (e) => { if(e.target === modal) closeBugModal(); };

    function openBugModal() {
        modal.style.display = 'flex';
    }

    function closeBugModal() {
        modal.style.display = 'none';
        document.getElementById('arayaBugText').value = '';
        document.getElementById('arayaBugStatus').textContent = '';
    }

    async function submitBug() {
        const text = document.getElementById('arayaBugText').value.trim();
        const status = document.getElementById('arayaBugStatus');

        if (!text) {
            status.style.color = '#ff6b6b';
            status.textContent = 'Please describe your request.';
            return;
        }

        const page = window.location.pathname.split('/').pop() || 'index';

        try {
            status.style.color = '#ffcc00';
            status.textContent = 'Sending...';

            const response = await fetch(FEEDBACK_ENDPOINT, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    type: 'feature',
                    message: text,
                    page: page,
                    anonymous: true
                })
            });

            const data = await response.json();

            if (data.success) {
                status.style.color = '#32cd32';
                status.textContent = data.araya_response || 'Sent! ARAYA will learn from this.';
                setTimeout(closeBugModal, 2000);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch(e) {
            console.error('Feedback error:', e);
            status.style.color = '#ff6b6b';
            status.textContent = 'Failed to send. Please try again.';
        }
    }
})();
