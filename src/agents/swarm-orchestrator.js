/**
 * SWARM ORCHESTRATOR
 * ==================
 * Implements the 7-layer AgentSwarm architecture for Barbrick Design.
 *
 * Layer Map
 * ---------
 * 1. Human Strategy     — Agent R / Ryan Barbrick (external)
 * 2. Meta-Agent         — This orchestrator (agentR role)
 * 3. Automation Assist  — AutomationAssistanceAgent
 * 4. Execution          — ProposalGeneratorAgent, DeploymentAgent,
 *                         ContractSeekerAgent, MarketingAgent,
 *                         ReportGeneratorAgent, ManagementAgent
 * 5. Delivery & Ops     — DeliveryOperationsAgent
 * 6. Product Surfaces   — Static product registry
 * 7. Control Bridge     — control-bridge.html (GUI) + event bus below
 *
 * Payments: All end-product/service payments → BarbrickDesign@gmail.com
 */

'use strict';

// ─── Optional lazy-load helpers (Node vs browser) ────────────────────────────

function _tryRequire(modulePath) {
    if (typeof require === 'undefined') return null;
    try { return require(modulePath); } catch (_) { return null; }
}

// ─── SwarmOrchestrator ───────────────────────────────────────────────────────

class SwarmOrchestrator {
    constructor(config = {}) {
        this.config = {
            paymentEmail: 'BarbrickDesign@gmail.com',
            autoStart: false,
            heartbeatInterval: 30 * 1000, // 30 s
            maxLogEntries: 5000,
            killSwitchEnabled: true,
            ...config
        };

        // Registry of all layer-agents
        this.registry = {
            layer2: null,  // meta-agent (this orchestrator itself)
            layer3: null,  // AutomationAssistanceAgent
            layer4: {},    // execution agents keyed by role
            layer5: null,  // DeliveryOperationsAgent
            layer6: null,  // product surface registry
            layer7: null   // Control Bridge event emitter
        };

        this.isRunning = false;
        this.killed = false;
        this.logs = [];
        this.eventListeners = {};
        this._timers = [];

        this.metrics = {
            startedAt: null,
            uptime: 0,
            layersActive: 0,
            totalEvents: 0,
            lastHeartbeat: null
        };
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    async init() {
        if (this.killed) {
            this._log('Kill switch is active – orchestrator cannot restart', 'error');
            return this;
        }

        this._log('SwarmOrchestrator: initialising all layers…', 'info');
        this.metrics.startedAt = new Date().toISOString();

        await this._initLayer3();
        await this._initLayer4();
        await this._initLayer5();
        this._initLayer6();

        this.isRunning = true;
        this.metrics.layersActive = this._countActiveLayers();

        // Heartbeat
        if (this.config.heartbeatInterval > 0) {
            this._timers.push(setInterval(() => this._heartbeat(), this.config.heartbeatInterval));
        }

        this._emit('swarm:started', { timestamp: new Date().toISOString() });
        this._log('SwarmOrchestrator: all layers online', 'success');
        return this;
    }

    async stop() {
        this._log('SwarmOrchestrator: stopping all layers…', 'info');
        this.isRunning = false;

        this._timers.forEach(t => clearInterval(t));
        this._timers = [];

        // Stop each layer agent
        for (const agent of Object.values(this.registry.layer4)) {
            if (agent && typeof agent.stop === 'function') await agent.stop().catch(() => {});
        }
        if (this.registry.layer3 && typeof this.registry.layer3.stop === 'function') {
            await this.registry.layer3.stop().catch(() => {});
        }
        if (this.registry.layer5 && typeof this.registry.layer5.stop === 'function') {
            await this.registry.layer5.stop().catch(() => {});
        }

        this.metrics.layersActive = 0;
        this._emit('swarm:stopped', { timestamp: new Date().toISOString() });
        this._log('SwarmOrchestrator: all layers stopped', 'success');
    }

    /** Hard kill – cannot be restarted without a page reload or process restart */
    kill() {
        if (!this.config.killSwitchEnabled) {
            this._log('Kill switch is disabled in config', 'warning');
            return false;
        }
        this._log('⚠️  KILL SWITCH ACTIVATED – shutting down all agents', 'error');
        this.killed = true;
        this.stop().catch(() => {});
        this._emit('swarm:killed', { timestamp: new Date().toISOString() });
        return true;
    }

    // ─── Layer 3: Automation Assistance ──────────────────────────────────────

    async _initLayer3() {
        const AutomationAssistanceAgent = _tryRequire('./automation-assistance-agent') ||
            (typeof AutomationAssistanceAgent !== 'undefined' ? AutomationAssistanceAgent : null); // eslint-disable-line no-undef

        if (!AutomationAssistanceAgent) {
            this._log('Layer 3 (AutomationAssistanceAgent) not available – skipping', 'warning');
            return;
        }

        this.registry.layer3 = new AutomationAssistanceAgent({
            alertEmail: this.config.paymentEmail,
            // Disable internal timers – orchestrator schedules them
            monitorInterval: 0,
            scanInterval: 0,
            researchInterval: 0
        });
        await this.registry.layer3.init();
        this._log('Layer 3 (AutomationAssistanceAgent) online', 'success');
    }

    // ─── Layer 4: Execution Agents ────────────────────────────────────────────

    async _initLayer4() {
        const agentClasses = {
            proposal: _tryRequire('./proposal-generator-agent'),
            deployment: _tryRequire('./deployment-agent'),
            contractSeeker: _tryRequire('./contract-seeker-agent'),
            marketing: _tryRequire('./marketing-agent'),
            report: _tryRequire('./report-generator-agent'),
            management: _tryRequire('./management-agent')
        };

        for (const [role, AgentClass] of Object.entries(agentClasses)) {
            if (!AgentClass) {
                this._log(`Layer 4 [${role}] module not available – skipping`, 'warning');
                continue;
            }
            try {
                const agent = new AgentClass();
                if (typeof agent.init === 'function') await agent.init().catch(() => {});
                this.registry.layer4[role] = agent;
                this._log(`Layer 4 [${role}] online`, 'success');
            } catch (err) {
                this._log(`Layer 4 [${role}] init error: ${err.message}`, 'error');
            }
        }
    }

    // ─── Layer 5: Delivery & Operations ──────────────────────────────────────

    async _initLayer5() {
        const DeliveryOperationsAgent = _tryRequire('./delivery-operations-agent') ||
            (typeof DeliveryOperationsAgent !== 'undefined' ? DeliveryOperationsAgent : null); // eslint-disable-line no-undef

        if (!DeliveryOperationsAgent) {
            this._log('Layer 5 (DeliveryOperationsAgent) not available – skipping', 'warning');
            return;
        }

        this.registry.layer5 = new DeliveryOperationsAgent({
            billingEmail: this.config.paymentEmail,
            reportSchedule: 0  // orchestrator drives reporting
        });
        await this.registry.layer5.init();
        this._log('Layer 5 (DeliveryOperationsAgent) online', 'success');
    }

    // ─── Layer 6: Product Surfaces ────────────────────────────────────────────

    _initLayer6() {
        this.registry.layer6 = {
            products: [
                { id: 'automation-agency', name: 'Automation Agency', url: '/aFactory.html', status: 'active' },
                { id: 'vertical-saas', name: 'Vertical SaaS (RepoPilot)', url: '/repopilot-landing.html', status: 'active' },
                { id: 'template-marketplace', name: 'Template Marketplace', url: '/template-marketplace.html', status: 'active' },
                { id: 'deal-flow-engine', name: 'Deal-Flow Engine', url: '/FuturesByAgentR.html', status: 'active' },
                { id: 'bounty-harvester', name: 'Bounty Harvester', url: '/bounty-harvester.html', status: 'active' }
            ],
            getProduct: (id) => this.registry.layer6.products.find(p => p.id === id) || null
        };
        this._log('Layer 6 (Product Surfaces) registry loaded', 'success');
    }

    // ─── Heartbeat ────────────────────────────────────────────────────────────

    _heartbeat() {
        this.metrics.lastHeartbeat = new Date().toISOString();
        this.metrics.uptime = Date.now() - new Date(this.metrics.startedAt).getTime();
        this._emit('swarm:heartbeat', this.getStatus());
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    /**
     * Get full status snapshot across all layers.
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            killed: this.killed,
            metrics: this.metrics,
            layers: {
                1: { name: 'Human Strategy', status: 'external', actor: 'Agent R / Ryan Barbrick' },
                2: { name: 'Meta-Agent (agentR)', status: this.isRunning ? 'active' : 'stopped', module: 'swarm-orchestrator.js' },
                3: { name: 'Automation Assistance', status: this._layerStatus(this.registry.layer3), health: this.registry.layer3?.getHealth?.() },
                4: { name: 'Execution Agents', status: this._layer4Status(), agents: Object.keys(this.registry.layer4) },
                5: { name: 'Delivery & Operations', status: this._layerStatus(this.registry.layer5), health: this.registry.layer5?.getHealth?.() },
                6: { name: 'Product Surfaces', status: 'active', products: this.registry.layer6?.products },
                7: { name: 'Control Bridge (GUI)', status: 'active', url: '/control-bridge.html' }
            },
            paymentRoute: this.config.paymentEmail
        };
    }

    /**
     * Execute a named action routed to the appropriate layer agent.
     * agentR (Layer 2) approves actions based on impact level.
     */
    async execute(action, payload = {}, impactLevel = 'low') {
        if (!this.isRunning) return { error: 'Orchestrator is not running' };
        if (this.killed)    return { error: 'Kill switch is active' };

        this.metrics.totalEvents++;

        // Layer 2 gate – high-impact actions require explicit approval flag
        if (impactLevel === 'high' && !payload._approved) {
            this._log(`High-impact action "${action}" blocked – awaiting agentR approval`, 'warning');
            return { error: 'High-impact action requires agentR approval', action, payload };
        }

        this._log(`Executing action: ${action} (impact=${impactLevel})`, 'info');
        this._emit('swarm:execute', { action, impactLevel, timestamp: new Date().toISOString() });

        try {
            switch (action) {
                // Layer 3
                case 'research':        return await this.registry.layer3?.aggregateResearch(payload.topics);
                case 'generateDraft':   return await this.registry.layer3?.generateDraft(payload.type, payload.context);
                case 'monitor':         return await this.registry.layer3?.runMonitoring();
                case 'scan':            return await this.registry.layer3?.scanOpportunities();

                // Layer 4
                case 'generateProposal':  return await this.registry.layer4.proposal?.generateProposal?.(payload);
                case 'deploy':            return await this.registry.layer4.deployment?.run?.(payload);
                case 'seekContracts':     return await this.registry.layer4.contractSeeker?.run?.(payload);
                case 'market':            return await this.registry.layer4.marketing?.run?.(payload);
                case 'report':            return await this.registry.layer4.report?.generateReport?.(payload);
                case 'crawl':             return await this.registry.layer4.management?.startCrawl?.();

                // Layer 5
                case 'registerContractor':  return this.registry.layer5?.registerContractor(payload);
                case 'registerClient':      return this.registry.layer5?.registerClient(payload);
                case 'generateInvoice':     return this.registry.layer5?.generateInvoice(payload);
                case 'markInvoicePaid':     return this.registry.layer5?.markInvoicePaid(payload.invoiceId);
                case 'deliveryReport':      return await this.registry.layer5?.generateReport(payload.clientId);

                default:
                    this._log(`Unknown action: ${action}`, 'warning');
                    return { error: `Unknown action: ${action}` };
            }
        } catch (err) {
            this._log(`Action "${action}" failed: ${err.message}`, 'error');
            return { error: err.message };
        }
    }

    /**
     * Route a pipeline through multiple actions in sequence.
     */
    async runPipeline(stages = []) {
        this._log(`Running pipeline: ${stages.map(s => s.action).join(' → ')}`, 'info');
        const results = [];

        for (const stage of stages) {
            const result = await this.execute(stage.action, stage.payload || {}, stage.impactLevel || 'low');
            results.push({ stage: stage.action, result });

            if (result && result.error && stage.abortOnError) {
                this._log(`Pipeline aborted at stage: ${stage.action}`, 'error');
                break;
            }
        }

        this._emit('swarm:pipeline:complete', { stages: results, timestamp: new Date().toISOString() });
        return results;
    }

    // ─── Event Bus (Layer 7 bridge) ───────────────────────────────────────────

    on(event, handler) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(handler);
        return this;
    }

    off(event, handler) {
        if (!this.eventListeners[event]) return this;
        this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
        return this;
    }

    _emit(event, data) {
        (this.eventListeners[event] || []).forEach(h => { try { h(data); } catch (_) {} });
        // Also propagate to wildcard listeners
        (this.eventListeners['*'] || []).forEach(h => { try { h(event, data); } catch (_) {} });

        // Mirror to browser CustomEvent if available
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent(event, { detail: data }));
        }
    }

    // ─── Utilities ────────────────────────────────────────────────────────────

    _layerStatus(agent) {
        if (!agent) return 'unavailable';
        return agent.isActive ? 'active' : 'stopped';
    }

    _layer4Status() {
        const total = Object.keys(this.registry.layer4).length;
        const active = Object.values(this.registry.layer4).filter(a => a && a.isActive !== false).length;
        return total === 0 ? 'unavailable' : `${active}/${total} active`;
    }

    _countActiveLayers() {
        let count = 1; // Layer 2 is always this orchestrator
        if (this.registry.layer3) count++;
        if (Object.keys(this.registry.layer4).length) count++;
        if (this.registry.layer5) count++;
        if (this.registry.layer6) count++;
        count++; // Layer 7 GUI always available
        return count;
    }

    _log(message, level = 'info') {
        const entry = { timestamp: new Date().toISOString(), level, message };
        this.logs.push(entry);
        if (this.logs.length > this.config.maxLogEntries) {
            this.logs = this.logs.slice(-this.config.maxLogEntries);
        }
        const prefix = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' }[level] || '•';
        console.log(`${prefix} [SwarmOrchestrator] ${message}`);
    }

    exportLogs(format = 'json') {
        if (format === 'csv') {
            const header = 'timestamp,level,message\n';
            return header + this.logs.map(l => `${l.timestamp},${l.level},"${l.message}"`).join('\n');
        }
        return JSON.stringify(this.logs, null, 2);
    }
}

// ─── Bootstrap when running as a Node.js entry point ────────────────────────

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwarmOrchestrator;
}

// ─── Browser auto-init ───────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.SwarmOrchestrator = SwarmOrchestrator;
    window.swarm = new SwarmOrchestrator({ autoStart: false });
}
