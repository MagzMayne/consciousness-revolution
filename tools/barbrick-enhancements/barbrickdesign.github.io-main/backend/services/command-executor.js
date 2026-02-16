// BankSky Command Execution Service
// Handles system command execution for deployment and maintenance
// This is a simplified version for local development

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3005; // Different port from other services

app.use(cors());
app.use(express.json());

// Command execution endpoint
app.post('/api/execute', async (req, res) => {
  try {
    const { command, cwd = '.', timeout = 30000 } = req.body;

    console.log(`Executing: ${command} (cwd: ${cwd})`);

    // For security, only allow specific commands in development
    const allowedCommands = [
      'node --version',
      'npm --version',
      'mkdir',
      'echo',
      'taskkill',
      'rmdir'
    ];

    const isAllowed = allowedCommands.some(allowed =>
      command.includes(allowed) || command.startsWith('"')
    );

    if (!isAllowed) {
      return res.json({
        success: false,
        error: 'Command not allowed',
        output: 'Command blocked for security'
      });
    }

    // Execute command
    exec(command, {
      cwd: path.resolve(cwd),
      timeout: timeout,
      maxBuffer: 1024 * 1024 // 1MB buffer
    }, (error, stdout, stderr) => {
      const success = !error;
      const output = stdout || stderr || '';

      console.log(`Command result: ${success ? 'SUCCESS' : 'FAILED'}`);
      if (output) console.log(`Output: ${output.substring(0, 200)}...`);

      res.json({
        success,
        output: output.trim(),
        error: error ? error.message : null
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'command-executor',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🔧 Command Executor Service running on port ${PORT}`);
  console.log(`📡 Ready to execute deployment commands`);
});
