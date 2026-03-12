// RootIB: RB-20260312090802-B8E4052A
/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 *
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 *
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * AGENTMAIL CLIENT
 * ================
 * Vanilla JS / Node.js client for the AgentMail.to REST API.
 *
 * Enables autonomous agents to programmatically:
 *  - Create and manage dedicated email inboxes
 *  - Send emails from agent-owned addresses
 *  - Read incoming messages and full conversation threads
 *  - Reply to email threads
 *  - Delete inboxes when no longer needed
 *
 * API Reference: https://www.agentmail.to/docs
 * Base URL:      https://api.agentmail.to/v1
 * Auth:          Bearer token (Authorization: Bearer <api_key>)
 *
 * Usage (browser):
 *   const client = new AgentMailClient('your_api_key');
 *   const inbox  = await client.inboxes.create({ username: 'merlin' });
 *   await client.messages.send(inbox.inbox_id, { to: 'human@example.com', subject: 'Hi!', text: 'Hello.' });
 *
 * Usage (Node.js):
 *   const { AgentMailClient } = require('./js/agentmail-client');
 *   const client = new AgentMailClient(process.env.AGENTMAIL_API_KEY);
 */

'use strict';

const AGENTMAIL_BASE_URL = 'https://api.agentmail.to/v1';

// ─────────────────────────────────────────────────────────────────────────────
// Low-level HTTP helper — works in browser (fetch) and Node.js (https module)
// ─────────────────────────────────────────────────────────────────────────────

function _doRequest(apiKey, method, path, body) {
  const url     = `${AGENTMAIL_BASE_URL}${path}`;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type':  'application/json',
    'Accept':        'application/json',
  };

  // Browser path
  if (typeof fetch !== 'undefined') {
    const init = { method, headers };
    if (body !== undefined && body !== null) {
      init.body = JSON.stringify(body);
    }
    return fetch(url, init).then(async (res) => {
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch (_) { json = { raw: text }; }
      if (!res.ok) {
        const err = new Error(`AgentMail API error ${res.status}: ${JSON.stringify(json)}`);
        err.status = res.status;
        err.data   = json;
        throw err;
      }
      return json;
    });
  }

  // Node.js path
  const https = require('https');
  const urlParsed = new URL(url);
  const bodyStr   = (body !== undefined && body !== null) ? JSON.stringify(body) : '';

  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlParsed.hostname,
      port:     443,
      path:     urlParsed.pathname + (urlParsed.search || ''),
      method,
      headers: {
        ...headers,
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch (_) { json = { raw: data }; }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const err = new Error(`AgentMail API error ${res.statusCode}: ${JSON.stringify(json)}`);
          err.status = res.statusCode;
          err.data   = json;
          return reject(err);
        }
        resolve(json);
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// InboxesAPI
// ─────────────────────────────────────────────────────────────────────────────

class InboxesAPI {
  constructor(apiKey) { this._key = apiKey; }

  /**
   * Create a new inbox for an agent.
   * @param {object} opts
   * @param {string} [opts.username]     - Desired username portion, e.g. "merlin"
   *                                       → results in merlin@agentmail.to
   * @param {string} [opts.domain]       - Custom domain (e.g. "yourdomain.com")
   * @param {string} [opts.display_name] - Human-friendly display name
   * @returns {Promise<object>} Created inbox object { inbox_id, address, username, domain, ... }
   */
  create(opts = {}) {
    return _doRequest(this._key, 'POST', '/inboxes', opts);
  }

  /**
   * List all inboxes in your account.
   * @returns {Promise<object[]>} Array of inbox objects
   */
  list() {
    return _doRequest(this._key, 'GET', '/inboxes', null);
  }

  /**
   * Get a specific inbox by ID.
   * @param {string} inboxId
   * @returns {Promise<object>} Inbox object
   */
  get(inboxId) {
    return _doRequest(this._key, 'GET', `/inboxes/${encodeURIComponent(inboxId)}`, null);
  }

  /**
   * Delete an inbox.
   * @param {string} inboxId
   * @returns {Promise<object>}
   */
  delete(inboxId) {
    return _doRequest(this._key, 'DELETE', `/inboxes/${encodeURIComponent(inboxId)}`, null);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MessagesAPI
// ─────────────────────────────────────────────────────────────────────────────

class MessagesAPI {
  constructor(apiKey) { this._key = apiKey; }

  /**
   * Send an email from an agent's inbox.
   * @param {string} inboxId
   * @param {object} opts
   * @param {string|string[]} opts.to      - Recipient address(es)
   * @param {string} [opts.cc]             - CC addresses
   * @param {string} [opts.bcc]            - BCC addresses
   * @param {string} opts.subject          - Email subject
   * @param {string} [opts.text]           - Plain-text body
   * @param {string} [opts.html]           - HTML body
   * @returns {Promise<object>} Sent message object
   */
  send(inboxId, opts) {
    return _doRequest(this._key, 'POST', `/inboxes/${encodeURIComponent(inboxId)}/messages`, opts);
  }

  /**
   * List messages in an inbox.
   * @param {string} inboxId
   * @param {object} [params]          - Optional query params { limit, offset, thread_id }
   * @returns {Promise<object[]>}
   */
  list(inboxId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const path = `/inboxes/${encodeURIComponent(inboxId)}/messages${qs ? '?' + qs : ''}`;
    return _doRequest(this._key, 'GET', path, null);
  }

  /**
   * Get a single message.
   * @param {string} inboxId
   * @param {string} messageId
   * @returns {Promise<object>}
   */
  get(inboxId, messageId) {
    return _doRequest(
      this._key, 'GET',
      `/inboxes/${encodeURIComponent(inboxId)}/messages/${encodeURIComponent(messageId)}`,
      null
    );
  }

  /**
   * Reply to an existing message / thread.
   * @param {string} inboxId
   * @param {string} messageId
   * @param {object} opts
   * @param {string} [opts.text]  - Plain-text reply body
   * @param {string} [opts.html]  - HTML reply body
   * @returns {Promise<object>}
   */
  reply(inboxId, messageId, opts) {
    return _doRequest(
      this._key, 'POST',
      `/inboxes/${encodeURIComponent(inboxId)}/messages/${encodeURIComponent(messageId)}/reply`,
      opts
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ThreadsAPI
// ─────────────────────────────────────────────────────────────────────────────

class ThreadsAPI {
  constructor(apiKey) { this._key = apiKey; }

  /**
   * List email threads in an inbox.
   * @param {string} inboxId
   * @returns {Promise<object[]>}
   */
  list(inboxId) {
    return _doRequest(this._key, 'GET', `/inboxes/${encodeURIComponent(inboxId)}/threads`, null);
  }

  /**
   * Get a specific thread with all messages.
   * @param {string} inboxId
   * @param {string} threadId
   * @returns {Promise<object>}
   */
  get(inboxId, threadId) {
    return _doRequest(
      this._key, 'GET',
      `/inboxes/${encodeURIComponent(inboxId)}/threads/${encodeURIComponent(threadId)}`,
      null
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AgentMailClient — main entry point
// ─────────────────────────────────────────────────────────────────────────────

class AgentMailClient {
  /**
   * @param {string} apiKey - AgentMail.to API key (get one at https://app.agentmail.to)
   */
  constructor(apiKey) {
    if (!apiKey) throw new Error('AgentMailClient: apiKey is required');
    this._apiKey  = apiKey;
    this.inboxes  = new InboxesAPI(apiKey);
    this.messages = new MessagesAPI(apiKey);
    this.threads  = new ThreadsAPI(apiKey);
  }

  /**
   * Quick helper: create an inbox and send one email in a single call.
   * @param {string} username     - Username for the new inbox
   * @param {object} messageOpts  - Same opts as messages.send()
   * @returns {Promise<{inbox: object, message: object}>}
   */
  async createAndSend(username, messageOpts) {
    const inbox   = await this.inboxes.create({ username });
    const message = await this.messages.send(inbox.inbox_id, messageOpts);
    return { inbox, message };
  }

  /**
   * Poll an inbox for new messages (simple long-poll alternative when webhooks
   * are not available).  Calls onMessage for each new message found.
   *
   * @param {string}   inboxId    - Inbox to watch
   * @param {Function} onMessage  - Callback(message)
   * @param {number}   [interval] - Poll interval in ms (default: 30 000)
   * @returns {{ stop: Function }} - Call .stop() to cancel polling
   */
  pollInbox(inboxId, onMessage, interval = 30_000) {
    let known    = new Set();
    let timerId  = null;
    let stopped  = false;

    const poll = async () => {
      if (stopped) return;
      try {
        const result   = await this.messages.list(inboxId);
        const messages = Array.isArray(result) ? result : (result.messages || []);
        for (const msg of messages) {
          if (!known.has(msg.message_id || msg.id)) {
            known.add(msg.message_id || msg.id);
            try { onMessage(msg); } catch (cbErr) {
              console.warn(`[AgentMailClient:pollInbox] onMessage callback error:`, cbErr);
            }
          }
        }
      } catch (pollErr) {
        console.warn(`[AgentMailClient:pollInbox] polling error for ${inboxId}:`, pollErr);
      }
      if (!stopped) timerId = setTimeout(poll, interval);
    };

    poll();

    return {
      stop() {
        stopped = true;
        if (timerId !== null) clearTimeout(timerId);
      }
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports (Node.js + browser)
// ─────────────────────────────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AgentMailClient, InboxesAPI, MessagesAPI, ThreadsAPI };
} else if (typeof window !== 'undefined') {
  window.AgentMailClient = AgentMailClient;
  window.AgentMailInboxesAPI  = InboxesAPI;
  window.AgentMailMessagesAPI = MessagesAPI;
  window.AgentMailThreadsAPI  = ThreadsAPI;
}
