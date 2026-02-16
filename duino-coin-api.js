/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: duino-coin-api.js
 * Declaration ID: IP-32CF7245-MLL28ZUR
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Duino-Coin API Client
 * Based on official documentation: https://github.com/duino-coin/duino-coin/tree/useful-tools
 * © 2025 Barbrick Design - Duino-Coin Integration
 */

class DuinoCoinAPI {
    constructor() {
        this.serverIP = '51.15.127.80';
        this.serverPorts = [2811, 2812, 2813, 2814, 2815];
        this.wsServers = [
            'wss://server.duinocoin.com:14808', // Mining only
            'wss://server.duinocoin.com:15808'
        ];
        this.restAPI = 'https://server.duinocoin.com';
        this.socket = null;
        this.isConnected = false;
        this.isLoggedIn = false;
        this.username = null;
        this.serverVersion = null;
        this.miningJob = null;
        this.onMessage = null;
        this.connectionType = 'websocket'; // 'tcp' or 'websocket'
    }

    /**
     * Connect to Duino-Coin server via WebSocket
     */
    async connect(miningOnly = false) {
        return new Promise((resolve, reject) => {
            const serverURL = miningOnly ? this.wsServers[0] : this.wsServers[1];
            
            try {
                this.socket = new WebSocket(serverURL);

                this.socket.onopen = () => {
                    console.log('✅ Connected to Duino-Coin server:', serverURL);
                    this.isConnected = true;
                };

                this.socket.onmessage = (event) => {
                    const message = event.data;
                    console.log('📨 Server message:', message);

                    // First message is server version
                    if (!this.serverVersion) {
                        this.serverVersion = message;
                        console.log('🔧 Server version:', this.serverVersion);
                        resolve(this.serverVersion);
                    } else if (this.onMessage) {
                        this.onMessage(message);
                    }
                };

                this.socket.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    reject(error);
                };

                this.socket.onclose = () => {
                    console.log('🔌 Disconnected from server');
                    this.isConnected = false;
                    this.isLoggedIn = false;
                };
            } catch (error) {
                console.error('❌ Connection error:', error);
                reject(error);
            }
        });
    }

    /**
     * Send command to server
     */
    send(command) {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }
        console.log('📤 Sending:', command);
        this.socket.send(command);
    }

    /**
     * Wait for response from server
     */
    waitForResponse() {
        return new Promise((resolve) => {
            const handler = (message) => {
                this.onMessage = null;
                resolve(message);
            };
            this.onMessage = handler;
        });
    }

    /**
     * Login to Duino-Coin account
     */
    async login(username, password) {
        this.send(`LOGI,${username},${password}`);
        const response = await this.waitForResponse();
        
        if (response === 'OK') {
            this.isLoggedIn = true;
            this.username = username;
            console.log('✅ Logged in as:', username);
            return { success: true, message: 'Login successful' };
        } else {
            const reason = response.replace('NO,', '');
            console.error('❌ Login failed:', reason);
            return { success: false, message: reason };
        }
    }

    /**
     * Register new Duino-Coin account
     */
    async register(username, password, email) {
        this.send(`REGI,${username},${password},${email}`);
        const response = await this.waitForResponse();
        
        if (response === 'OK') {
            console.log('✅ Registration successful');
            return { success: true, message: 'Registration successful' };
        } else {
            const reason = response.replace('NO,', '');
            console.error('❌ Registration failed:', reason);
            return { success: false, message: reason };
        }
    }

    /**
     * Ping server
     */
    async ping() {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        this.send('PING');
        const response = await this.waitForResponse();
        return response === 'Pong!';
    }

    /**
     * Get user balance
     */
    async getBalance() {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        this.send('BALA');
        const response = await this.waitForResponse();
        return parseFloat(response);
    }

    /**
     * Check if user exists
     */
    async userExists(username) {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        this.send(`UEXI,${username}`);
        const response = await this.waitForResponse();
        return response.startsWith('OK');
    }

    /**
     * Request mining job
     * @param {string} algorithm - 'DUCO-S1' or 'XXHASH'
     * @param {string} difficulty - 'LOW', 'MEDIUM', 'NET', or 'EXTREME'
     */
    async getJob(algorithm = 'DUCO-S1', difficulty = 'LOW') {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        
        const command = algorithm === 'XXHASH' 
            ? `JOBXX,${this.username}` 
            : `JOB,${this.username},${difficulty}`;
        
        this.send(command);
        const response = await this.waitForResponse();
        
        // Parse job: "lastBlockHash,expectedHash,difficulty"
        const [lastBlockHash, expectedHash, diff] = response.split(',');
        
        this.miningJob = {
            lastBlockHash,
            expectedHash: parseInt(expectedHash),
            difficulty: parseInt(diff),
            algorithm,
            startTime: Date.now()
        };
        
        return this.miningJob;
    }

    /**
     * Submit mining result
     */
    async submitShare(result, hashrate, minerName = 'Barbrick Miner', rigName = 'Web') {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        
        this.send(`${result},${hashrate},${minerName},${rigName}`);
        const response = await this.waitForResponse();
        
        // Response can be "GOOD", "BAD", or "BLOCK"
        const isGood = response.startsWith('GOOD') || response.startsWith('BLOCK');
        
        return {
            accepted: isGood,
            message: response,
            isBlock: response.startsWith('BLOCK')
        };
    }

    /**
     * Transfer funds to another user
     */
    async transfer(recipient, amount, message = '') {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        
        this.send(`SEND,${message},${recipient},${amount}`);
        const response = await this.waitForResponse();
        
        if (response.startsWith('OK')) {
            const [, msg, txHash] = response.split(',');
            return { success: true, message: msg, transactionHash: txHash };
        } else {
            return { success: false, message: response.replace('NO,', '') };
        }
    }

    /**
     * Get last transactions
     */
    async getTransactions(count = 10) {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        
        this.send(`GTXL,${this.username},${count}`);
        const response = await this.waitForResponse();
        
        try {
            return JSON.parse(response);
        } catch (error) {
            console.error('Failed to parse transactions:', error);
            return [];
        }
    }

    /**
     * Change password
     */
    async changePassword(oldPassword, newPassword) {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        
        this.send(`CHGP,${oldPassword},${newPassword}`);
        const response = await this.waitForResponse();
        
        return response === 'OK';
    }

    /**
     * Wrap DUCO to wDUCO on Tron network
     */
    async wrapDUCO(amount, tronAddress) {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        
        this.send(`WRAP,${amount},${tronAddress}`);
        const response = await this.waitForResponse();
        
        return response === 'OK';
    }

    /**
     * Unwrap wDUCO to DUCO
     */
    async unwrapDUCO(amount, tronAddress) {
        if (!this.isLoggedIn) throw new Error('Not logged in');
        
        this.send(`UNWRAP,${amount},${tronAddress}`);
        const response = await this.waitForResponse();
        
        return response === 'OK';
    }

    /**
     * Get pool server details
     */
    async getPoolServer() {
        try {
            const response = await fetch(`${this.restAPI}/getPool`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get pool server:', error);
            return null;
        }
    }

    /**
     * Get general statistics
     */
    async getStatistics() {
        try {
            const response = await fetch(`${this.restAPI}/api.json`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get statistics:', error);
            return null;
        }
    }

    /**
     * Get all user balances
     */
    async getAllBalances() {
        try {
            const response = await fetch(`${this.restAPI}/balances.json`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get balances:', error);
            return null;
        }
    }

    /**
     * Get all transactions
     */
    async getAllTransactions() {
        try {
            const response = await fetch(`${this.restAPI}/transactions.json`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get transactions:', error);
            return null;
        }
    }

    /**
     * Get found blocks
     */
    async getFoundBlocks() {
        try {
            const response = await fetch(`${this.restAPI}/foundBlocks.json`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get found blocks:', error);
            return null;
        }
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
        this.isLoggedIn = false;
        this.username = null;
        console.log('🔌 Disconnected from Duino-Coin server');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuinoCoinAPI;
}
