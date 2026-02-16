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
 * File: profile.js
 * Declaration ID: IP-41B99C52-MLL28ZVL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

// Show profile section if user is logged in
function showProfileSection() {
    document.getElementById('profile-section').style.display = 'block';
    updateProfileUI();
}

// Uptime reward config
const UPTIME_REWARD_USD_PER_SEC = 0.01; // $0.01 per second
const MGC_PER_USD = 100; // Example: 100 MGC = $1 (update as needed)

function getMgcPerUsd() {
    // This could be dynamic if you fetch from server or oracle
    return MGC_PER_USD;
}

function getUptimeRewardMgc() {
    return UPTIME_REWARD_USD_PER_SEC * getMgcPerUsd();
}

// Track and reward uptime every second
function startUptimeRewards() {
    setInterval(() => {
        let profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
        if (!profile) return;
        // Add reward
        profile.inGameMGC = (profile.inGameMGC || 0) + getUptimeRewardMgc();
        localStorage.setItem('userProfile', JSON.stringify(profile));
        // Optionally, log the reward
        let txLog = JSON.parse(localStorage.getItem('transactionLog') || '[]');
        txLog.push({
            type: 'Uptime Reward',
            details: { amount: getUptimeRewardMgc().toFixed(2), currency: 'MGC' },
            timestamp: new Date().toLocaleString()
        });
        // Keep log size reasonable
        if (txLog.length > 1000) txLog = txLog.slice(-1000);
        localStorage.setItem('transactionLog', JSON.stringify(txLog));
    }, 1000);
}

async function updateProfileUI() {
    let user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    let profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    const walletBtn = document.getElementById('connect-wallet-btn');
    // Show/hide connect wallet button and display wallet address
    if (!user || !user.walletAddress) {
        document.getElementById('profile-wallet-address').textContent = '-';
        walletBtn.style.display = 'inline-block';
    } else {
        document.getElementById('profile-wallet-address').textContent = user.walletAddress;
        walletBtn.style.display = 'none';
    }
    if (!user || !profile) return;
    document.getElementById('profile-display-name').textContent = profile.displayName || user.displayName || '-';
    document.getElementById('profile-email').textContent = user.email || '-';
    // Wallet MGC balance (async)
    if (window.getMGCBalance && user.walletAddress) {
        document.getElementById('profile-wallet-mgc').textContent = 'Loading...';
        let bal = await window.getMGCBalance(user.walletAddress);
        document.getElementById('profile-wallet-mgc').textContent = bal;
    } else {
        document.getElementById('profile-wallet-mgc').textContent = profile.mgcBalance || 0;
    }
    document.getElementById('profile-ingame-mgc').textContent = profile.inGameMGC || 0;
    // Transaction log (show wallet address if present)
    let txLog = JSON.parse(localStorage.getItem('transactionLog') || '[]');
    let logHtml = txLog.slice(-10).reverse().map(tx => {
        let walletInfo = tx.details.walletAddress ? ` (${tx.details.walletAddress})` : '';
        let reason = tx.details.reason ? ` - ${tx.details.reason}` : '';
        return `<li><b>${tx.type}</b>${walletInfo}: ${tx.details.status || ''}${reason} <span style='font-size:10px;color:#aaa;'>${tx.timestamp}</span></li>`;
    }).join('');
    document.getElementById('profile-transaction-log').innerHTML = logHtml;
}

// Handle connect wallet button click
async function handleConnectWallet() {
    let walletAddress = null;
    let txLog = JSON.parse(localStorage.getItem('transactionLog') || '[]');
    let connectionStatus = 'fail';
    if (window.location.protocol !== 'https:') {
        alert('Phantom wallet requires HTTPS. Please use https:// to access this site.');
        txLog.push({
            type: 'Wallet Connect',
            details: { status: 'fail', reason: 'Not HTTPS' },
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('transactionLog', JSON.stringify(txLog));
        return;
    }
    if (window.solana && window.solana.isPhantom) {
        console.log('Phantom detected:', window.solana);
        try {
            const resp = await window.solana.connect();
            walletAddress = resp.publicKey.toString();
            const message = `Sign in to Gem Bot Portal: ${new Date().toISOString()}`;
            const encodedMessage = new TextEncoder().encode(message);
            let signed = false;
            try {
                await window.solana.signMessage(encodedMessage, { display: 'utf8' });
                signed = true;
                console.log('Signed with display:utf8');
            } catch (e1) {
                console.warn('signMessage with utf8 failed:', e1);
                try {
                    await window.solana.signMessage(encodedMessage, { display: 'hex' });
                    signed = true;
                    console.log('Signed with display:hex');
                } catch (e2) {
                    console.warn('signMessage with hex failed:', e2);
                    try {
                        await window.solana.signMessage(encodedMessage);
                        signed = true;
                        console.log('Signed with no display option');
                    } catch (e3) {
                        console.error('Phantom signMessage error (all attempts failed):', e3);
                        throw e3;
                    }
                }
            }
            if (!signed) throw new Error('Signature failed in all attempts');
            connectionStatus = 'success';
        } catch (e) {
            console.error('Phantom wallet error:', e);
            if (e && e.code === 4001) {
                alert('Signature request was rejected.');
            } else {
                alert('Wallet connection or signature failed. Please try again.');
            }
            txLog.push({
                type: 'Wallet Connect',
                details: { status: 'fail', reason: e && e.message ? e.message : 'Unknown error' },
                timestamp: new Date().toLocaleString()
            });
            localStorage.setItem('transactionLog', JSON.stringify(txLog));
            return;
        }
    } else {
        alert('Phantom wallet not detected. Please install Phantom and refresh.');
        txLog.push({
            type: 'Wallet Connect',
            details: { status: 'fail', reason: 'Phantom not detected' },
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('transactionLog', JSON.stringify(txLog));
        return;
    }
    let displayName = prompt('Enter your display name:');
    let email = prompt('Enter your email:');
    let user = {
        walletAddress,
        displayName,
        email
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    let profile = {
        displayName,
        inGameMGC: 0,
        mgcBalance: 0
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    // Log successful wallet connection
    txLog.push({
        type: 'Wallet Connect',
        details: { status: 'success', walletAddress },
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('transactionLog', JSON.stringify(txLog));
    updateProfileUI();
}

// Log GPS location every second for uptime verification
function startGpsLogging() {
    if (!navigator.geolocation) return;
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                let gpsLog = JSON.parse(localStorage.getItem('gpsLog') || '[]');
                gpsLog.push({
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString()
                });
                // Keep only the last 3600 entries (1 hour at 1/sec)
                if (gpsLog.length > 3600) gpsLog = gpsLog.slice(-3600);
                localStorage.setItem('gpsLog', JSON.stringify(gpsLog));
            },
            (err) => {
                // Optionally log errors or permission denials
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
    }, 1000);
}

// Update Travel & Leaderboard Stats UI
function updateLeaderboardStatsUI() {
    // Get last leaderboard stats from last sync or local calculation
    const gpsLog = JSON.parse(localStorage.getItem('gpsLog') || '[]');
    const leaderboardStats = {
        distance: gpsLog.length > 1 ? calcTotalDistance(gpsLog) : 0,
        uptime: gpsLog.length,
        lastSync: localStorage.getItem('lastLeaderboardSync') || '-'
    };
    document.getElementById('stat-distance').textContent = leaderboardStats.distance.toFixed(1);
    document.getElementById('stat-uptime').textContent = leaderboardStats.uptime;
    document.getElementById('stat-last-sync').textContent = leaderboardStats.lastSync;
    // Show last 5 locations
    const log = gpsLog.slice(-5).reverse();
    document.getElementById('stat-travel-log').innerHTML = log.map(l => `<li>${l.latitude.toFixed(5)}, ${l.longitude.toFixed(5)} <span style='color:#aaa;font-size:10px;'>${new Date(l.timestamp).toLocaleTimeString()}</span></li>`).join('');
    // Show MGC per $1
    let mgcPerUsd = getMgcPerUsd();
    let mgcPerUsdDiv = document.getElementById('stat-mgc-per-usd');
    if (!mgcPerUsdDiv) {
        mgcPerUsdDiv = document.createElement('div');
        mgcPerUsdDiv.id = 'stat-mgc-per-usd';
        document.getElementById('leaderboard-stats').appendChild(mgcPerUsdDiv);
    }
    mgcPerUsdDiv.textContent = `MGC per $1: ${mgcPerUsd}`;
}

// Send GPS log and leaderboard stats to server every minute
async function syncTravelAndLeaderboard() {
    const gpsLog = JSON.parse(localStorage.getItem('gpsLog') || '[]');
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user || !user.walletAddress) return;
    // Example leaderboard stats (replace with real stats as needed)
    const leaderboardStats = {
        distance: gpsLog.length > 1 ? calcTotalDistance(gpsLog) : 0,
        uptime: gpsLog.length,
        lastSync: new Date().toISOString()
    };
    try {
        await fetch('/api/user/travel-leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress: user.walletAddress,
                gpsLog,
                leaderboardStats
            })
        });
        localStorage.setItem('lastLeaderboardSync', leaderboardStats.lastSync);
    } catch (e) {
        // Optionally handle sync errors
    }
    updateLeaderboardStatsUI();
}

// Calculate total distance from GPS log
function calcTotalDistance(log) {
    let dist = 0;
    for (let i = 1; i < log.length; i++) {
        dist += haversine(log[i-1], log[i]);
    }
    return dist;
}

// Haversine formula for distance between two lat/lon points (in meters)
function haversine(a, b) {
    const R = 6371000;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const x = dLon * Math.cos((lat1 + lat2) / 2);
    return Math.sqrt(dLat * dLat + x * x) * R;
}

// Start syncing every minute
setInterval(syncTravelAndLeaderboard, 60000);

// Update leaderboard stats UI every 1 second
setInterval(updateLeaderboardStatsUI, 1000);

document.addEventListener('DOMContentLoaded', () => {
    let user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (user && user.walletAddress) {
        showProfileSection();
    }
    document.getElementById('profile-deposit-btn').addEventListener('click', async () => {
        let amt = parseFloat(document.getElementById('profile-deposit-amount').value);
        if (window.depositMGC && amt > 0) {
            await window.depositMGC(amt);
            updateProfileUI();
        }
    });
    document.getElementById('profile-withdraw-btn').addEventListener('click', async () => {
        let amt = parseFloat(document.getElementById('profile-withdraw-amount').value);
        if (window.withdrawMGC && amt > 0) {
            await window.withdrawMGC(amt);
            updateProfileUI();
        }
    });
    // Real-time profile UI update every 1 second
    setInterval(updateProfileUI, 1000);
    document.getElementById('connect-wallet-btn').addEventListener('click', handleConnectWallet);
    startGpsLogging();
    startUptimeRewards();
});
