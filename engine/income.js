const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'income.log');

function logIncome(source, amount, metadata = {}) {
  const entry = {
    timestamp: Date.now(),
    source,
    amount,
    metadata
  };

  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
  console.log('💰 Income logged:', entry);
}

module.exports = { logIncome };
