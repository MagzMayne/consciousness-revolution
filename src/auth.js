/**
 * auth.js - Consciousness Revolution Authentication
 * Provides global login, signUp, and logout functions
 */

// API base URL
const AUTH_API_BASE = '/.netlify/functions';

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} User data on success
 */
async function login(email, password) {
    try {
        const response = await fetch(`${AUTH_API_BASE}/auth-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important for cookies
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store user info in localStorage (non-sensitive data only)
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');

            console.log('Login successful:', data.user.email);
            return data.user;
        } else {
            console.error('Login failed:', data.error);
            alert(data.error || 'Login failed. Please check your credentials.');
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
        throw error;
    }
}

/**
 * Sign up with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<object>} User data on success
 */
async function signUp(email, password, displayName) {
    try {
        const response = await fetch(`${AUTH_API_BASE}/auth-signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password, display_name: displayName })
        });

        const data = await response.json();

        if (data.success) {
            // Store user info
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');

            console.log('Signup successful:', data.user.email);
            alert('Account created successfully! Welcome to the Consciousness Revolution.');
            return data.user;
        } else {
            console.error('Signup failed:', data.error);
            alert(data.error || 'Signup failed. Please try again.');
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
        throw error;
    }
}

/**
 * Logout current user
 * @returns {Promise<void>}
 */
async function logout() {
    try {
        await fetch(`${AUTH_API_BASE}/auth-logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout API error:', error);
    }

    // Clear local storage regardless of API response
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');

    // Redirect to login page
    window.location.href = '/login.html';
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Get current user data
 * @returns {object|null}
 */
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Require authentication - redirect to login if not authenticated
 * @param {string} redirectUrl - URL to redirect back to after login
 */
function requireAuth(redirectUrl) {
    if (!isLoggedIn()) {
        localStorage.setItem('authRedirect', redirectUrl || window.location.href);
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { login, signUp, logout, isLoggedIn, getCurrentUser, requireAuth };
}

console.log('Auth module loaded');
