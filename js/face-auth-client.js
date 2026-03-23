// RootIB: RB-20260319142113-518F85BD
// RootIB: RB-FACEAUTH-2026
/**
 * face-auth-client.js — Consciousness Revolution
 * ════════════════════════════════════════════════════════════════
 * Client-side facial recognition authentication module.
 *
 * Uses face-api.js (CDN, no server-side ML required) to:
 *   1. Access the device camera
 *   2. Detect a face and extract a 128-float descriptor
 *   3. Either ENROLL (save to server) or VERIFY (match against saved)
 *   4. On successful verify, treat user as logged-in via CRAuth
 *
 * Dependencies loaded dynamically from CDN (no bundler needed):
 *   - face-api.js  https://cdn.jsdelivr.net/npm/face-api.js/dist/face-api.min.js
 *
 * Model weights are fetched from jsDelivr at first use (cached in browser).
 *
 * Public API (window.FaceAuthClient):
 *   init()                             → Promise<void>
 *   enroll(videoEl)                    → Promise<{ enrolled: boolean }>
 *   verify(videoEl, email?)            → Promise<{ matched, user? }>
 *   startCamera(videoEl)               → Promise<MediaStream>
 *   stopCamera(stream)                 → void
 *   isEnrolled()                       → Promise<boolean>
 *   renderModal(containerEl, opts)     → void  — full-page face-auth UI
 *
 * Usage:
 *   <script src="/js/face-auth-client.js"></script>
 *   <script>
 *     FaceAuthClient.init().then(() => {
 *       FaceAuthClient.renderModal(document.body, { mode: 'verify' });
 *     });
 *   </script>
 * ════════════════════════════════════════════════════════════════
 */

(function (window) {
    'use strict';

    // ── Constants ─────────────────────────────────────────────────────
    const FACE_API_URL  = 'https://cdn.jsdelivr.net/npm/face-api.js/dist/face-api.min.js';
    const MODEL_BASE    = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    const API_BASE      = '/api/face-auth';
    const SSO_API_BASE  = '/api/sso-token';

    // ── State ─────────────────────────────────────────────────────────
    let _faceApiLoaded  = false;
    let _modelsLoaded   = false;
    let _loading        = false;

    // ─────────────────────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────────────────────

    /** Dynamically load face-api.js from CDN */
    function loadFaceApiScript() {
        return new Promise((resolve, reject) => {
            if (typeof faceapi !== 'undefined') { resolve(); return; }
            const s = document.createElement('script');
            s.src = FACE_API_URL;
            s.onload  = resolve;
            s.onerror = () => reject(new Error('Failed to load face-api.js from CDN'));
            document.head.appendChild(s);
        });
    }

    /** Load the three models needed: SSD, landmarks, recognition */
    async function loadModels() {
        if (_modelsLoaded) return;
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_BASE),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_BASE)
        ]);
        _modelsLoaded = true;
    }

    /**
     * Detect a single face and return its 128-float descriptor.
     * @param {HTMLVideoElement|HTMLCanvasElement|HTMLImageElement} el
     * @returns {Promise<Float32Array|null>}
     */
    async function detectDescriptor(el) {
        const result = await faceapi
            .detectSingleFace(el, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 }))
            .withFaceLandmarks()
            .withFaceDescriptor();
        return result ? result.descriptor : null;
    }

    /** POST to a face-auth API endpoint */
    async function apiPost(action, payload = {}) {
        const res = await fetch(`${API_BASE}?action=${action}`, {
            method:      'POST',
            credentials: 'include',
            headers:     { 'Content-Type': 'application/json' },
            body:        JSON.stringify({ action, ...payload })
        });
        return res.json();
    }

    /** GET from face-auth API */
    async function apiGet(action, params = {}) {
        const qs = new URLSearchParams({ action, ...params }).toString();
        const res = await fetch(`${API_BASE}?${qs}`, {
            method:      'GET',
            credentials: 'include'
        });
        return res.json();
    }

    // ─────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────

    const FaceAuthClient = {

        /**
         * Load face-api.js from CDN and warm up models.
         * Safe to call multiple times.
         */
        async init() {
            if (_faceApiLoaded && _modelsLoaded) return;
            if (_loading) {
                // Wait for ongoing init
                await new Promise(res => {
                    const check = setInterval(() => {
                        if (!_loading) { clearInterval(check); res(); }
                    }, 100);
                });
                return;
            }
            _loading = true;
            try {
                await loadFaceApiScript();
                await loadModels();
                _faceApiLoaded = true;
                console.log('[FaceAuth] Models loaded ✓');
            } finally {
                _loading = false;
            }
        },

        /**
         * Open the device camera and attach the stream to a <video> element.
         * @param {HTMLVideoElement} videoEl
         * @returns {Promise<MediaStream>}
         */
        async startCamera(videoEl) {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            videoEl.srcObject = stream;
            await videoEl.play();
            return stream;
        },

        /** Stop all tracks from a camera stream */
        stopCamera(stream) {
            if (stream) stream.getTracks().forEach(t => t.stop());
        },

        /**
         * Capture a face from the video element and enroll it.
         * Requires the user to already be logged in (session cookie).
         * @param {HTMLVideoElement} videoEl
         * @returns {Promise<{ enrolled: boolean, error?: string }>}
         */
        async enroll(videoEl) {
            await this.init();
            const descriptor = await detectDescriptor(videoEl);
            if (!descriptor) {
                return { enrolled: false, error: 'No face detected. Please look directly at the camera.' };
            }
            const data = await apiPost('enroll', {
                descriptor: Array.from(descriptor),
                model_version: 'ssd_mobilenetv1'
            });
            return data;
        },

        /**
         * Capture a face from the video element and verify against enrolled ones.
         * @param {HTMLVideoElement} videoEl
         * @param {string} [email]  Optional: narrow search to a specific account
         * @returns {Promise<{ matched: boolean, user?: object, error?: string }>}
         */
        async verify(videoEl, email) {
            await this.init();
            const descriptor = await detectDescriptor(videoEl);
            if (!descriptor) {
                return { matched: false, error: 'No face detected. Please look directly at the camera.' };
            }
            const payload = { descriptor: Array.from(descriptor) };
            if (email) payload.email = email;
            const data = await apiPost('verify', payload);
            return data;
        },

        /**
         * Check if the current user has an enrolled face.
         * @returns {Promise<boolean>}
         */
        async isEnrolled() {
            const data = await apiGet('status');
            return !!data?.enrolled;
        },

        // ── SSO ───────────────────────────────────────────────────────────

        /**
         * Issue a cross-site SSO token and redirect to the target site.
         * Call this from the *source* site where the user is logged in.
         * @param {string} targetSite  e.g. 'https://barbrickdesign.github.io'
         */
        async ssoRedirect(targetSite) {
            const res = await fetch(`${SSO_API_BASE}?action=issue`, {
                method:      'POST',
                credentials: 'include',
                headers:     { 'Content-Type': 'application/json' },
                body:        JSON.stringify({ action: 'issue', target_site: targetSite })
            });
            const data = await res.json();
            if (data.success && data.redirect_url) {
                window.location.href = data.redirect_url;
            } else {
                throw new Error(data.error || 'Failed to issue SSO token');
            }
        },

        /**
         * Consume an SSO token from the URL hash on the *target* site.
         * Called by auth-state.js on page load.
         * @param {string} token  64-hex token from URL hash
         * @returns {Promise<{ success: boolean, user?: object }>}
         */
        async ssoConsume(token) {
            const res = await fetch(`${SSO_API_BASE}?action=verify`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                // No credentials: include — this is a cross-site call without cookies
                body:    JSON.stringify({ action: 'verify', token })
            });
            return res.json();
        },

        // ── UI ────────────────────────────────────────────────────────────

        /**
         * Render a self-contained face-auth modal inside containerEl.
         * @param {HTMLElement} containerEl
         * @param {{ mode: 'verify'|'enroll', email?: string, onSuccess?: fn, onCancel?: fn }} opts
         */
        renderModal(containerEl, opts = {}) {
            const { mode = 'verify', email = '', onSuccess, onCancel } = opts;
            const title = mode === 'enroll' ? 'Enroll Your Face' : 'Sign In With Your Face';
            const btnLabel = mode === 'enroll' ? 'Save My Face' : 'Verify My Face';

            const modal = document.createElement('div');
            modal.id = 'fa-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', title);
            modal.innerHTML = `
<div id="fa-backdrop"></div>
<div id="fa-box" role="document">
  <button id="fa-close" aria-label="Cancel face authentication">✕</button>
  <h2 id="fa-title">${esc(title)}</h2>
  <p id="fa-hint">Allow camera access and look directly at the camera.</p>
  <div id="fa-video-wrap">
    <video id="fa-video" autoplay muted playsinline width="320" height="240"
           aria-label="Camera preview" style="border-radius:8px;background:#000;display:block;"></video>
    <canvas id="fa-overlay" width="320" height="240"
            style="position:absolute;top:0;left:0;pointer-events:none;"></canvas>
  </div>
  <button id="fa-btn" class="fa-primary-btn">${esc(btnLabel)}</button>
  <div id="fa-status" aria-live="polite" aria-atomic="true"></div>
</div>`;

            // Scoped styles
            const style = document.createElement('style');
            style.textContent = `
#fa-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99998;}
#fa-box{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
  background:#0e1117;border:1px solid rgba(15,245,224,.35);border-radius:16px;
  padding:28px 24px;z-index:99999;width:min(380px,95vw);color:#e0e0e0;
  font-family:'Share Tech Mono','Courier New',monospace;text-align:center;}
#fa-title{color:#0ff5e0;margin:0 0 8px;font-size:1.2rem;}
#fa-hint{color:#9ca3af;font-size:.8rem;margin:0 0 16px;}
#fa-video-wrap{position:relative;display:inline-block;margin-bottom:16px;}
#fa-close{position:absolute;top:12px;right:14px;background:none;border:none;
  color:#9ca3af;font-size:1.2rem;cursor:pointer;line-height:1;}
#fa-close:hover{color:#fff;}
.fa-primary-btn{background:linear-gradient(135deg,#0ff5e0,#39ff14);color:#0a0a0c;
  border:none;border-radius:24px;padding:10px 28px;font-size:1rem;font-weight:700;
  cursor:pointer;letter-spacing:.04em;transition:all .2s;width:100%;}
.fa-primary-btn:disabled{opacity:.4;cursor:not-allowed;}
#fa-status{margin-top:12px;font-size:.85rem;min-height:1.4em;}
.fa-success{color:#39ff14;} .fa-error{color:#ff6464;}`;
            document.head.appendChild(style);
            containerEl.appendChild(modal);

            const videoEl  = document.getElementById('fa-video');
            const btn      = document.getElementById('fa-btn');
            const statusEl = document.getElementById('fa-status');
            let stream     = null;

            const setStatus = (msg, cls = '') => {
                statusEl.textContent = msg;
                statusEl.className = cls;
            };

            const cleanup = () => {
                this.stopCamera(stream);
                modal.remove();
                style.remove();
            };

            document.getElementById('fa-close').addEventListener('click', () => {
                cleanup();
                if (onCancel) onCancel();
            });

            // Start camera
            this.init()
                .then(() => this.startCamera(videoEl))
                .then(s => {
                    stream = s;
                    setStatus('Camera ready. Look straight at the camera.');
                })
                .catch(err => {
                    setStatus('Camera error: ' + err.message, 'fa-error');
                    btn.disabled = true;
                });

            // Action button
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                setStatus('Processing…');
                try {
                    let result;
                    if (mode === 'enroll') {
                        result = await this.enroll(videoEl);
                        if (result.enrolled) {
                            setStatus('Face enrolled! ✓', 'fa-success');
                            setTimeout(() => { cleanup(); if (onSuccess) onSuccess(result); }, 1500);
                        } else {
                            setStatus(result.error || 'Enrollment failed.', 'fa-error');
                            btn.disabled = false;
                        }
                    } else {
                        result = await this.verify(videoEl, email);
                        if (result.matched || result.success) {
                            setStatus('Face recognized! Signing in… ✓', 'fa-success');
                            setTimeout(() => { cleanup(); if (onSuccess) onSuccess(result); }, 1200);
                        } else {
                            setStatus(result.error || 'Face not recognized. Try again.', 'fa-error');
                            btn.disabled = false;
                        }
                    }
                } catch (err) {
                    setStatus('Error: ' + err.message, 'fa-error');
                    btn.disabled = false;
                }
            });
        }
    };

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = String(str || '');
        return d.innerHTML;
    }

    window.FaceAuthClient = FaceAuthClient;
    console.log('[FaceAuth] Client module loaded — call FaceAuthClient.init() to warm up models');

})(window);
