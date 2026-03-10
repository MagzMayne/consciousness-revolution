'use strict';

/**
 * sdk-js/index.js
 *
 * AgentFinanceClient - JavaScript SDK for the Agentic Finance system.
 *
 * Uses only Node.js built-in modules (http/https) so the SDK has zero
 * external dependencies and can be embedded in any Node.js environment.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * Make an HTTP/HTTPS request using Node's built-in modules.
 *
 * @param {object} options
 * @param {string} options.method
 * @param {string} options.url
 * @param {object} [options.headers]
 * @param {string|null} [options.body]
 * @returns {Promise<{ statusCode: number, data: any }>}
 */
function request({ method, url, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const transport = isHttps ? https : http;

    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + (parsed.search || ''),
      method: method.toUpperCase(),
      headers: { 'Content-Type': 'application/json', ...headers },
    };

    if (body) {
      reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = transport.request(reqOptions, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let data;
        try {
          data = JSON.parse(raw);
        } catch (_) {
          data = raw;
        }
        if (res.statusCode >= 400) {
          const err = new Error(
            `AgentFinanceClient: HTTP ${res.statusCode} — ${
              typeof data === 'object' ? JSON.stringify(data) : data
            }`
          );
          err.statusCode = res.statusCode;
          err.response = data;
          return reject(err);
        }
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', reject);

    if (body) req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// AgentFinanceClient
// ---------------------------------------------------------------------------

/**
 * Client for the Agentic Finance HTTP API gateway.
 *
 * @example
 * const client = new AgentFinanceClient({
 *   baseUrl: 'http://localhost:3000',
 *   apiKey: 'my-api-key',
 * });
 *
 * const result = await client.simulate({
 *   agentId: 'agent-1',
 *   intentType: 'trade.swap',
 *   parameters: { fromAsset: 'ETH', toAsset: 'USDC', amount: '0.1' },
 * });
 */
class AgentFinanceClient {
  /**
   * @param {object} options
   * @param {string} options.baseUrl - Base URL of the API gateway
   * @param {string} [options.apiKey] - API key for authentication
   */
  constructor({ baseUrl, apiKey } = {}) {
    if (!baseUrl) throw new Error('AgentFinanceClient: baseUrl is required');
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey || null;
  }

  /** Build auth headers */
  _authHeaders() {
    return this.apiKey ? { 'x-api-key': this.apiKey } : {};
  }

  /**
   * Submit an intent to the API gateway.
   *
   * @param {object} params
   * @param {string} params.agentId
   * @param {string} params.intentType
   * @param {object} params.parameters
   * @param {object} [params.context]
   * @param {string} [params.mode]    - "simulate" | "simulate_and_execute"
   * @returns {Promise<object>} API response data
   */
  async intent(params) {
    const { agentId, intentType, parameters, context, mode } = params;
    const body = JSON.stringify({
      agent_id: agentId,
      intent_type: intentType,
      parameters,
      context: context || {},
      mode: mode || 'simulate_and_execute',
    });

    const { data } = await request({
      method: 'POST',
      url: `${this.baseUrl}/v1/intent`,
      headers: this._authHeaders(),
      body,
    });

    return data;
  }

  /**
   * Simulate an intent (read-only, never executes on-chain).
   *
   * @param {object} params - Same as intent() but mode is forced to "simulate"
   * @returns {Promise<object>}
   */
  async simulate(params) {
    return this.intent({ ...params, mode: 'simulate' });
  }

  /**
   * Retrieve a lineage record by ID.
   *
   * @param {string} lineageId
   * @returns {Promise<object>}
   */
  async getLineage(lineageId) {
    const { data } = await request({
      method: 'GET',
      url: `${this.baseUrl}/v1/lineage/${encodeURIComponent(lineageId)}`,
      headers: this._authHeaders(),
    });
    return data;
  }
}

module.exports = { AgentFinanceClient };
module.exports.default = AgentFinanceClient;
