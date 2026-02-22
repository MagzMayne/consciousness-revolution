/**
 * DELIVERY & OPERATIONS AGENT - Layer 5
 * =======================================
 * Swarm Layer 5: Delivery & Operations
 *
 * Responsibilities:
 *  - Contractor network management
 *  - Client dashboard coordination
 *  - Automated reporting
 *  - Billing + invoicing (routed to BarbrickDesign@gmail.com)
 *
 * Part of the 7-layer AgentSwarm architecture.
 */

'use strict';

class DeliveryOperationsAgent {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            billingEmail: 'BarbrickDesign@gmail.com',
            reportSchedule: 24 * 60 * 60 * 1000, // daily
            invoicePrefix: 'INV',
            ...config
        };

        this.isActive = false;
        this.logs = [];
        this.contractors = [];
        this.clients = [];
        this.invoices = [];
        this.reports = [];
        this._timers = [];

        this.metrics = {
            contractorsOnboarded: 0,
            invoicesGenerated: 0,
            reportsGenerated: 0,
            totalBilled: 0,
            lastActivity: null
        };
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────

    async init() {
        this._log('DeliveryOperationsAgent initialising…', 'info');
        this.isActive = true;
        if (this.config.reportSchedule > 0) {
            this._timers.push(setInterval(() => this.generateReport(), this.config.reportSchedule));
        }
        this._log('DeliveryOperationsAgent ready', 'success');
        return this;
    }

    async stop() {
        this._log('DeliveryOperationsAgent stopping…', 'info');
        this.isActive = false;
        this._timers.forEach(t => clearInterval(t));
        this._timers = [];
        this._log('DeliveryOperationsAgent stopped', 'success');
    }

    // ─── Contractor Network ──────────────────────────────────────────────────

    registerContractor(contractor) {
        if (!contractor || !contractor.name) {
            this._log('registerContractor: invalid contractor object', 'error');
            return null;
        }

        const record = {
            id: `contractor-${Date.now()}`,
            name: contractor.name,
            email: contractor.email || '',
            skills: contractor.skills || [],
            tier: contractor.tier || 'standard',
            status: 'active',
            joinedAt: new Date().toISOString(),
            completedJobs: 0,
            earnings: 0
        };

        this.contractors.push(record);
        this.metrics.contractorsOnboarded++;
        this.metrics.lastActivity = new Date().toISOString();
        this._log(`Contractor registered: ${record.name}`, 'success');
        return record;
    }

    getContractors(status = null) {
        return status ? this.contractors.filter(c => c.status === status) : this.contractors;
    }

    assignJob(contractorId, job) {
        const contractor = this.contractors.find(c => c.id === contractorId);
        if (!contractor) {
            this._log(`assignJob: contractor not found: ${contractorId}`, 'error');
            return null;
        }

        const assignment = {
            id: `job-${Date.now()}`,
            contractorId,
            contractorName: contractor.name,
            ...job,
            status: 'assigned',
            assignedAt: new Date().toISOString()
        };

        this.metrics.lastActivity = new Date().toISOString();
        this._log(`Job assigned to ${contractor.name}: ${assignment.id}`, 'info');
        return assignment;
    }

    // ─── Client Dashboards ───────────────────────────────────────────────────

    registerClient(client) {
        if (!client || !client.name) {
            this._log('registerClient: invalid client object', 'error');
            return null;
        }

        const record = {
            id: `client-${Date.now()}`,
            name: client.name,
            email: client.email || '',
            plan: client.plan || 'standard',
            status: 'active',
            joinedAt: new Date().toISOString(),
            totalSpend: 0,
            dashboardUrl: `/client-dashboard.html?id=${Date.now()}`
        };

        this.clients.push(record);
        this.metrics.lastActivity = new Date().toISOString();
        this._log(`Client registered: ${record.name}`, 'success');
        return record;
    }

    getClientDashboard(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return null;

        return {
            client,
            overview: {
                activeProjects: 0,
                pendingInvoices: this.invoices.filter(i => i.clientId === clientId && i.status === 'pending').length,
                totalSpend: client.totalSpend
            },
            recentActivity: this.reports
                .filter(r => r.clientId === clientId)
                .slice(-10)
        };
    }

    getClients(status = null) {
        return status ? this.clients.filter(c => c.status === status) : this.clients;
    }

    // ─── Billing + Invoicing ─────────────────────────────────────────────────

    generateInvoice(invoiceData) {
        if (!invoiceData || !invoiceData.amount) {
            this._log('generateInvoice: amount is required', 'error');
            return null;
        }

        const invoiceNumber = `${this.config.invoicePrefix}-${Date.now()}`;
        const invoice = {
            id: `invoice-${Date.now()}`,
            invoiceNumber,
            clientId: invoiceData.clientId || null,
            clientName: invoiceData.clientName || 'Unknown',
            amount: invoiceData.amount,
            currency: invoiceData.currency || 'USD',
            description: invoiceData.description || 'Services rendered',
            status: 'pending',
            issuedAt: new Date().toISOString(),
            dueAt: invoiceData.dueAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            paymentRoute: this.config.billingEmail,
            paymentMethod: 'PayPal donation',
            lineItems: invoiceData.lineItems || [
                { description: invoiceData.description || 'Service', quantity: 1, unitPrice: invoiceData.amount }
            ]
        };

        this.invoices.push(invoice);
        this.metrics.invoicesGenerated++;
        this.metrics.totalBilled += invoice.amount;
        this.metrics.lastActivity = new Date().toISOString();

        this._log(`Invoice generated: ${invoiceNumber} — $${invoice.amount} → ${this.config.billingEmail}`, 'success');
        return invoice;
    }

    markInvoicePaid(invoiceId) {
        const invoice = this.invoices.find(i => i.id === invoiceId);
        if (!invoice) {
            this._log(`markInvoicePaid: invoice not found: ${invoiceId}`, 'error');
            return null;
        }
        invoice.status = 'paid';
        invoice.paidAt = new Date().toISOString();

        // Update client spend
        if (invoice.clientId) {
            const client = this.clients.find(c => c.id === invoice.clientId);
            if (client) client.totalSpend += invoice.amount;
        }

        this._log(`Invoice paid: ${invoice.invoiceNumber}`, 'success');
        return invoice;
    }

    getInvoices(status = null) {
        return status ? this.invoices.filter(i => i.status === status) : this.invoices;
    }

    getBillingSummary() {
        const pending = this.invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
        const paid = this.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
        return {
            totalBilled: this.metrics.totalBilled,
            pendingAmount: pending,
            paidAmount: paid,
            invoiceCount: this.invoices.length,
            paymentRoute: this.config.billingEmail
        };
    }

    // ─── Automated Reporting ─────────────────────────────────────────────────

    async generateReport(clientId = null) {
        if (!this.isActive) return null;
        this.metrics.reportsGenerated++;
        this.metrics.lastActivity = new Date().toISOString();

        const billing = this.getBillingSummary();
        const report = {
            id: `report-${Date.now()}`,
            clientId,
            generatedAt: new Date().toISOString(),
            period: 'daily',
            summary: {
                contractors: this.contractors.length,
                clients: this.clients.length,
                billing,
                activeContracts: this.contractors.filter(c => c.status === 'active').length
            },
            details: {
                newContractors: this.contractors.filter(
                    c => Date.now() - new Date(c.joinedAt).getTime() < 24 * 60 * 60 * 1000
                ).length,
                pendingInvoices: this.invoices.filter(i => i.status === 'pending').length
            }
        };

        this.reports.push(report);
        this._log(`Report generated: ${report.id}`, 'info');
        return report;
    }

    getReports(limit = 30) {
        return this.reports.slice(-limit);
    }

    // ─── Health ──────────────────────────────────────────────────────────────

    getHealth() {
        return {
            layer: 5,
            name: 'DeliveryOperationsAgent',
            isActive: this.isActive,
            metrics: this.metrics,
            contractorCount: this.contractors.length,
            clientCount: this.clients.length,
            invoiceCount: this.invoices.length,
            billingSummary: this.getBillingSummary()
        };
    }

    // ─── Internal Logging ────────────────────────────────────────────────────

    _log(message, level = 'info') {
        const entry = { timestamp: new Date().toISOString(), level, message };
        this.logs.push(entry);
        if (this.logs.length > 2000) this.logs = this.logs.slice(-2000);
        console.log(`[DeliveryOperationsAgent][${level.toUpperCase()}] ${message}`);
    }

    exportLogs(format = 'json') {
        if (format === 'csv') {
            const header = 'timestamp,level,message\n';
            return header + this.logs.map(l => `${l.timestamp},${l.level},"${l.message}"`).join('\n');
        }
        return JSON.stringify(this.logs, null, 2);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeliveryOperationsAgent;
}
