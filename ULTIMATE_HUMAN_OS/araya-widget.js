/**
 * Araya Floating Chat Widget for Ultimate Human OS
 * Self-contained: injects styles, HTML, and behavior.
 * Drop one <script> tag on any page to activate.
 */
(function() {
    var ENDPOINT = '/.netlify/functions/araya-chat';
    var history = [];
    var userId = localStorage.getItem('araya-user-id') || 'user-' + Date.now();
    localStorage.setItem('araya-user-id', userId);
    var isOpen = false;
    var isLoading = false;

    // Inject styles
    var style = document.createElement('style');
    style.textContent = [
        '#araya-fab{position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;',
        'background:linear-gradient(135deg,#9b59b6,#8e44ad);border:2px solid rgba(255,215,0,0.4);',
        'cursor:pointer;z-index:9998;display:flex;align-items:center;justify-content:center;',
        'box-shadow:0 4px 20px rgba(155,89,182,0.5);transition:all 0.3s;}',
        '#araya-fab:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(155,89,182,0.7);}',
        '#araya-fab svg{width:28px;height:28px;fill:#fff;}',
        '#araya-fab .notif{position:absolute;top:-2px;right:-2px;width:14px;height:14px;',
        'border-radius:50%;background:#2ecc71;border:2px solid #1a1a2e;}',

        '#araya-panel{position:fixed;bottom:90px;right:20px;width:360px;height:500px;',
        'background:rgba(20,10,40,0.97);border:1px solid rgba(155,89,182,0.4);',
        'border-radius:16px;z-index:9999;display:none;flex-direction:column;overflow:hidden;',
        'box-shadow:0 10px 40px rgba(0,0,0,0.6);backdrop-filter:blur(10px);}',
        '#araya-panel.open{display:flex;}',

        '.araya-header{padding:12px 16px;border-bottom:1px solid rgba(155,89,182,0.3);',
        'display:flex;align-items:center;justify-content:space-between;}',
        '.araya-header h4{margin:0;color:#d4a0ff;font-size:0.95rem;font-weight:700;letter-spacing:1px;}',
        '.araya-header .araya-status{font-size:0.7rem;color:#2ecc71;}',
        '.araya-close{background:none;border:none;color:#888;font-size:1.2rem;cursor:pointer;padding:0 4px;}',
        '.araya-close:hover{color:#fff;}',

        '.araya-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;}',
        '.araya-messages::-webkit-scrollbar{width:4px;}',
        '.araya-messages::-webkit-scrollbar-thumb{background:rgba(155,89,182,0.3);border-radius:4px;}',

        '.araya-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:0.85rem;line-height:1.5;word-wrap:break-word;}',
        '.araya-msg.user{align-self:flex-end;background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.25);color:#f0e6c0;}',
        '.araya-msg.araya{align-self:flex-start;background:rgba(155,89,182,0.12);border:1px solid rgba(155,89,182,0.25);color:#e0d0f0;}',
        '.araya-msg.system{align-self:center;background:rgba(255,255,255,0.05);color:#888;font-size:0.75rem;font-style:italic;}',
        '.araya-typing{align-self:flex-start;color:#9b59b6;font-size:0.8rem;padding:8px 14px;opacity:0.7;}',

        '.araya-input-area{padding:10px 12px;border-top:1px solid rgba(155,89,182,0.3);display:flex;gap:8px;}',
        '.araya-input-area input{flex:1;padding:10px 14px;border:1px solid rgba(155,89,182,0.3);',
        'background:rgba(0,0,0,0.4);color:#f4f4f4;border-radius:20px;font-size:0.85rem;outline:none;}',
        '.araya-input-area input:focus{border-color:rgba(155,89,182,0.6);}',
        '.araya-input-area input::placeholder{color:#666;}',
        '.araya-send{background:linear-gradient(135deg,#9b59b6,#8e44ad);border:none;color:#fff;',
        'width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;',
        'justify-content:center;transition:all 0.2s;flex-shrink:0;}',
        '.araya-send:hover{transform:scale(1.1);}',
        '.araya-send:disabled{opacity:0.4;cursor:default;transform:none;}',
        '.araya-send svg{width:16px;height:16px;fill:#fff;}',

        '@media(max-width:480px){',
        '#araya-panel{width:calc(100vw - 20px);right:10px;bottom:80px;height:60vh;}',
        '#araya-fab{bottom:14px;right:14px;}',
        '}'
    ].join('\n');
    document.head.appendChild(style);

    // Create FAB (floating action button)
    var fab = document.createElement('div');
    fab.id = 'araya-fab';
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>' +
        '<div class="notif"></div>';
    fab.title = 'Talk to Araya';
    document.body.appendChild(fab);

    // Create chat panel
    var panel = document.createElement('div');
    panel.id = 'araya-panel';
    panel.innerHTML =
        '<div class="araya-header">' +
            '<div><h4>ARAYA</h4><span class="araya-status">online</span></div>' +
            '<button class="araya-close">&times;</button>' +
        '</div>' +
        '<div class="araya-messages" id="araya-messages">' +
            '<div class="araya-msg system">Araya is your AI companion across the OS.</div>' +
        '</div>' +
        '<div class="araya-input-area">' +
            '<input type="text" id="araya-input" placeholder="Ask Araya anything..." autocomplete="off">' +
            '<button class="araya-send" id="araya-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
        '</div>';
    document.body.appendChild(panel);

    // Elements
    var messages = document.getElementById('araya-messages');
    var input = document.getElementById('araya-input');
    var sendBtn = document.getElementById('araya-send');
    var closeBtn = panel.querySelector('.araya-close');
    var notif = fab.querySelector('.notif');

    // Toggle
    fab.addEventListener('click', function() {
        isOpen = !isOpen;
        panel.classList.toggle('open', isOpen);
        notif.style.display = 'none';
        if (isOpen) input.focus();
    });

    closeBtn.addEventListener('click', function() {
        isOpen = false;
        panel.classList.remove('open');
    });

    // Send message
    function sendMessage() {
        var text = input.value.trim();
        if (!text || isLoading) return;

        // Add user message
        addMessage(text, 'user');
        input.value = '';
        history.push({ role: 'user', content: text });

        // Show typing indicator
        isLoading = true;
        sendBtn.disabled = true;
        var typing = document.createElement('div');
        typing.className = 'araya-typing';
        typing.textContent = 'Araya is thinking...';
        messages.appendChild(typing);
        scrollDown();

        // Call API
        fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                conversationHistory: history.slice(-10),
                user_id: userId
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            typing.remove();
            var reply = data.response || 'I hear you. Let me think about that.';
            addMessage(reply, 'araya');
            history.push({ role: 'assistant', content: reply });
        })
        .catch(function(err) {
            typing.remove();
            addMessage('Connection lost. Try again in a moment.', 'system');
            console.error('Araya widget error:', err);
        })
        .finally(function() {
            isLoading = false;
            sendBtn.disabled = false;
        });
    }

    function addMessage(text, type) {
        var msg = document.createElement('div');
        msg.className = 'araya-msg ' + type;
        msg.textContent = text;
        messages.appendChild(msg);
        scrollDown();
    }

    function scrollDown() {
        messages.scrollTop = messages.scrollHeight;
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Escape to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            isOpen = false;
            panel.classList.remove('open');
        }
    });
})();
