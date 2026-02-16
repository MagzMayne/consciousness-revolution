---
applyTo: "*.js"
---

## JavaScript File Requirements

All JavaScript files must follow modern ES6+ standards and best practices to ensure performance, maintainability, and security.

### Code Style Standards

1. **Use modern ES6+ syntax**
```javascript
// Good - Arrow functions, const/let, destructuring
const fetchData = async (url) => {
  const response = await fetch(url);
  const { data, error } = await response.json();
  return { data, error };
};

// Avoid - var, old function syntax
var getData = function(url) {
  return fetch(url).then(function(res) {
    return res.json();
  });
};
```

2. **Async/await over promise chains**
```javascript
// Good
async function processPayment(amount) {
  try {
    const order = await createOrder(amount);
    const result = await capturePayment(order.id);
    return result;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

// Avoid - Promise chains
function processPayment(amount) {
  return createOrder(amount)
    .then(order => capturePayment(order.id))
    .catch(error => console.error(error));
}
```

3. **Destructuring for cleaner code**
```javascript
// Good
const { email, tier, isStudent } = formData;
const [firstName, lastName] = fullName.split(' ');

// Avoid
const email = formData.email;
const tier = formData.tier;
const isStudent = formData.isStudent;
```

### Error Handling

1. **Always use try-catch for async operations**
```javascript
async function fetchProjectData(projectId) {
  try {
    const response = await fetch(`/api/projects/${projectId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch project:', error);
    // Show user-friendly error
    showNotification('Failed to load project. Please try again.', 'error');
    return null;
  }
}
```

2. **Provide user-friendly error messages**
```javascript
// Good - User understands what happened
catch (error) {
  if (error.message.includes('network')) {
    showError('Please check your internet connection');
  } else if (error.message.includes('timeout')) {
    showError('Request took too long. Please try again');
  } else {
    showError('Something went wrong. Please contact support');
  }
}

// Avoid - Technical jargon
catch (error) {
  alert(error.stack); // Don't show stack traces to users
}
```

### Payment Integration (PayPal)

For all payment-related JavaScript:

1. **Load PayPal SDK correctly**
```javascript
// Wait for PayPal SDK to load
function initPayPalButtons() {
  if (typeof paypal === 'undefined') {
    console.error('PayPal SDK not loaded');
    return;
  }
  
  paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: calculateAmount()
          }
        }]
      });
    },
    onApprove: async (data, actions) => {
      const order = await actions.order.capture();
      await handlePaymentSuccess(order);
    },
    onError: (err) => {
      console.error('PayPal error:', err);
      showNotification('Payment failed. Please try again.', 'error');
    }
  }).render('#paypal-button-container');
}
```

2. **Calculate amounts correctly (including discounts)**
```javascript
function calculateAmount() {
  const tierSelect = document.getElementById('tier-select');
  const studentDiscount = document.getElementById('student-discount');
  
  let amount = parseFloat(tierSelect.value) || 0;
  
  // Apply 50% student discount
  if (studentDiscount && studentDiscount.checked) {
    amount *= 0.5;
  }
  
  return amount.toFixed(2);
}
```

3. **Send payment confirmation**
```javascript
async function handlePaymentSuccess(order) {
  try {
    const email = document.getElementById('email').value;
    const tier = document.getElementById('tier-select').value;
    
    // Send to backend for processing
    const response = await fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        email,
        tier,
        amount: order.purchase_units[0].amount.value
      })
    });
    
    if (response.ok) {
      showNotification('Payment successful! Check your email for details.', 'success');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = 'contributor-dashboard-hub.html';
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to process payment:', error);
    showNotification('Payment received but confirmation failed. Contact support.', 'warning');
  }
}

// Note: Always validate order structure before accessing nested properties
function getOrderAmount(order) {
  if (!order || !order.purchase_units || !Array.isArray(order.purchase_units) || order.purchase_units.length === 0) {
    throw new Error('Invalid order structure');
  }
  return order.purchase_units[0].amount.value;
}
```

### Agent System Integration

For AI agent and automation scripts:

1. **Agent initialization pattern**
```javascript
class AgentSystem {
  constructor(config) {
    this.config = config;
    this.isActive = false;
    this.logs = [];
  }
  
  async init() {
    try {
      await this.loadConfig();
      await this.connectToHive();
      this.isActive = true;
      this.log('Agent initialized successfully');
    } catch (error) {
      this.log('Failed to initialize agent', 'error');
      throw error;
    }
  }
  
  log(message, level = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    this.logs.push(entry);
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
  
  async stop() {
    this.isActive = false;
    await this.cleanup();
    this.log('Agent stopped');
  }
}
```

2. **Health monitoring**
```javascript
class HealthMonitor {
  constructor() {
    this.checks = [];
    this.lastCheck = null;
  }
  
  async runHealthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: []
    };
    
    for (const check of this.checks) {
      try {
        const result = await check.run();
        results.checks.push({
          name: check.name,
          status: result ? 'pass' : 'fail',
          message: result ? 'OK' : check.failMessage
        });
        
        if (!result) {
          results.status = 'unhealthy';
        }
      } catch (error) {
        results.checks.push({
          name: check.name,
          status: 'error',
          message: error.message
        });
        results.status = 'unhealthy';
      }
    }
    
    this.lastCheck = results;
    return results;
  }
}
```

3. **Self-healing capabilities**
```javascript
async function selfHeal(issue) {
  console.log(`Attempting to heal: ${issue.type}`);
  
  const healers = {
    'broken-link': async () => {
      // Attempt to fix broken links
      return await fixBrokenLinks();
    },
    'api-timeout': async () => {
      // Retry with exponential backoff
      return await retryWithBackoff();
    },
    'memory-leak': async () => {
      // Clear caches and garbage collect
      return await clearMemoryCaches();
    }
  };
  
  const healer = healers[issue.type];
  if (healer) {
    try {
      await healer();
      return { success: true, message: 'Issue resolved' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  return { success: false, message: 'No healer available' };
}
```

### Blockchain Integration

For wallet and blockchain operations:

1. **Wallet connection pattern**
```javascript
async function connectWallet(network = 'solana') {
  try {
    const wallets = {
      solana: window.solana,
      ethereum: window.ethereum,
      tron: window.tronWeb
    };
    
    const wallet = wallets[network];
    if (!wallet) {
      throw new Error(`${network} wallet not found. Please install the wallet extension.`);
    }
    
    await wallet.connect();
    
    const address = await getWalletAddress(wallet, network);
    
    // Store connection
    sessionStorage.setItem('connectedWallet', network);
    sessionStorage.setItem('walletAddress', address);
    
    updateWalletUI(address, network);
    
    return { address, network };
  } catch (error) {
    console.error('Wallet connection failed:', error);
    showNotification('Failed to connect wallet: ' + error.message, 'error');
    throw error;
  }
}
```

2. **Transaction handling**
```javascript
async function sendTransaction(to, amount, network) {
  try {
    const wallet = getConnectedWallet(network);
    
    // Show confirmation dialog
    const confirmed = await showTransactionConfirmation({ to, amount, network });
    if (!confirmed) {
      return { cancelled: true };
    }
    
    // Execute transaction
    const tx = await wallet.sendTransaction({ to, amount });
    
    // Wait for confirmation
    showNotification('Transaction submitted. Waiting for confirmation...', 'info');
    const receipt = await waitForTransaction(tx, network);
    
    if (receipt.success) {
      showNotification('Transaction successful!', 'success');
      return { success: true, txHash: receipt.hash };
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error('Transaction error:', error);
    showNotification('Transaction failed: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}
```

### Performance Best Practices

1. **Debounce expensive operations**
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce((e) => {
  performSearch(e.target.value);
}, 300));
```

2. **Lazy load heavy resources**
```javascript
// Load 3D libraries only when needed
async function load3DLibrary() {
  if (window.BABYLON) return;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.babylonjs.com/babylon.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

3. **Use event delegation**
```javascript
// Good - Single listener
document.getElementById('project-list').addEventListener('click', (e) => {
  if (e.target.matches('.project-link')) {
    handleProjectClick(e.target.dataset.projectId);
  }
});

// Avoid - Multiple listeners
document.querySelectorAll('.project-link').forEach(link => {
  link.addEventListener('click', () => {
    handleProjectClick(link.dataset.projectId);
  });
});
```

### Security Requirements

1. **Never commit secrets**
```javascript
// Good - Use environment variables
const API_KEY = process.env.API_KEY || window.ENV?.API_KEY;

// Bad - Hard-coded secrets
const API_KEY = 'sk_live_12345'; // NEVER DO THIS
```

2. **Sanitize user input**
```javascript
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Usage
const userMessage = sanitizeInput(userInput.value);
messageElement.textContent = userMessage; // Not innerHTML
```

3. **Validate data before processing**
```javascript
function validatePaymentData(data) {
  const errors = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Invalid email address');
  }
  
  if (!data.tier || ![50, 200, 500, 1500].includes(Number(data.tier))) {
    errors.push('Invalid tier selected');
  }
  
  if (data.amount && data.amount <= 0) {
    errors.push('Invalid amount');
  }
  
  return { valid: errors.length === 0, errors };
}
```

### Documentation Standards

1. **JSDoc comments for functions**
```javascript
/**
 * Calculate contribution amount with optional student discount
 * @param {number} tier - Base tier amount (50, 200, 500, or 1500)
 * @param {boolean} isStudent - Whether student discount applies
 * @returns {number} Final amount after discount
 */
function calculateContributionAmount(tier, isStudent) {
  return isStudent ? tier * 0.5 : tier;
}
```

2. **Document complex algorithms**
```javascript
// Revenue sharing calculation algorithm:
// 1. Get total grant amount awarded
// 2. Calculate contributor's tier percentage (10-20%)
// 3. Multiply by contributor's participation score (0-1)
// 4. Subtract platform fee (5%)
// 5. Add any bonus multipliers (early contributor, high quality, etc.)
function calculateRevenueShare(grantAmount, contributor) {
  const tierPercentages = { bronze: 0.10, silver: 0.12, gold: 0.15, platinum: 0.20 };
  const baseShare = grantAmount * tierPercentages[contributor.tier];
  const participationShare = baseShare * contributor.participationScore;
  const afterFees = participationShare * 0.95; // 5% platform fee
  const bonusMultiplier = calculateBonusMultiplier(contributor);
  return afterFees * bonusMultiplier;
}
```

### Testing Requirements

Before submitting:

- [ ] Test all code paths (success and error cases)
- [ ] Verify no console errors in browser
- [ ] Test with different user inputs
- [ ] Check memory leaks (for long-running scripts)
- [ ] Verify mobile compatibility
- [ ] Test API integrations with sandbox/dev endpoints
- [ ] Confirm payment flows work (use PayPal sandbox)
- [ ] Test with network throttling (slow 3G)

### Common Mistakes to Avoid

1. ❌ Using `var` instead of `const`/`let`
2. ❌ Not handling promise rejections
3. ❌ Hard-coding API keys or secrets
4. ❌ Missing error handling for API calls
5. ❌ Not sanitizing user input
6. ❌ Blocking the main thread with heavy operations
7. ❌ Memory leaks from event listeners
8. ❌ Not validating payment data
9. ❌ Poor variable naming (use descriptive names)
10. ❌ Mixing sync and async patterns

### Remember

- **Performance matters** - This affects user engagement and revenue
- **Security is critical** - Protect user data and payment information
- **Error handling is mandatory** - Always expect things to fail
- **Mobile first** - Test on mobile, optimize for mobile
- **Document complex logic** - Help future developers (including yourself)
