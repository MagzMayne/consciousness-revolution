/**
 * Creation Agent
 *
 * Responsibilities:
 *  - Subscribe to `creation.request` events.
 *  - Generate a reply/artifact (text, plan, or content).
 *  - Publish `creation.output` events.
 *
 * The built-in generator is intentionally simple (template-based).
 * Swap `_generate()` with an LLM call for production use.
 */

'use strict';

const { AgentRuntime } = require('@conscious-network/runtime');

class CreationAgent extends AgentRuntime {
  constructor(config = {}) {
    super('creation', config);

    // Optional custom generator function (injectable for testing)
    this._generator = config.generator || this._defaultGenerator.bind(this);
  }

  async _registerSubscriptions() {
    this.subscribe('creation.request', (msg) => this._create(msg));
  }

  async _create(msg) {
    const { text, context, requestType = 'reply' } = msg.payload;

    this.log('info', `creation request received`, {
      requestType,
      correlationId: msg.correlationId,
    });

    let output;
    try {
      output = await this._generator({ text, context, requestType });
    } catch (err) {
      this.log('error', 'generator failed', { error: err.message });
      output = { type: 'error', content: `Generation failed: ${err.message}` };
    }

    const result = {
      requestType,
      originalText: text,
      output,
      generatedAt: new Date().toISOString(),
    };

    this.state.append_event('creation.outputs', {
      correlationId: msg.correlationId,
      result,
    });

    await this.publish('creation.output', 'GeneratedContent', result, {
      correlationId: msg.correlationId,
      traceId: msg.traceId,
    });

    this.log('info', 'creation output published', { correlationId: msg.correlationId });
  }

  /**
   * Default (template-based) generator.
   * Replace with an LLM call for richer output.
   */
  async _defaultGenerator({ text, requestType }) {
    if (requestType === 'reply') {
      return {
        type: 'text',
        content: `[Conscious Network] Acknowledged: "${text}". ` +
          `The network is processing your input and learning from the interaction.`,
      };
    }
    if (requestType === 'plan') {
      return {
        type: 'plan',
        content: `Plan for: "${text}"`,
        steps: [
          'Analyze the request context',
          'Identify relevant knowledge',
          'Generate structured response',
          'Review and refine output',
        ],
      };
    }
    return {
      type: 'generic',
      content: `Generated artifact for: "${text}"`,
    };
  }

  /** Inject a custom generator (e.g., LLM-backed). */
  setGenerator(fn) {
    this._generator = fn;
  }
}

module.exports = { CreationAgent };

if (require.main === module) {
  const agent = new CreationAgent();
  agent.start().catch((err) => {
    console.error(JSON.stringify({ level: 'error', agent: 'creation', error: err.message }));
    process.exit(1);
  });
}
