# GroqAI Orchestrator - Quick Reference

## 🚀 Quick Setup

```html
<!-- Add to your HTML -->
<script src="/groq-orchestrator-init.js"></script>
```

That's it! The orchestrator auto-initializes and is ready to use.

## 📝 Basic Usage

### Simple Chat

```javascript
const response = await groqAI.chat([
  { role: 'user', content: 'Hello!' }
]);

console.log(response.choices[0].message.content);
```

### With System Message

```javascript
const response = await groqAI.chat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Explain AI in simple terms.' }
]);
```

### With Options

```javascript
const response = await groqAI.chat([
  { role: 'user', content: 'Write a haiku about coding.' }
], {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.9,
  max_tokens: 100
});
```

## 🎯 Available Models

| Model | Speed | Best For |
|-------|-------|----------|
| `llama-3.3-70b-versatile` | Fast | Default, balanced |
| `llama-3.1-8b-instant` | Fastest | Quick queries |
| `mixtral-8x7b-32768` | Fast | Long context |

## 🔍 Status & Monitoring

```javascript
// Check status
const status = groqAI.getStatus();

// Show dashboard
groqAI.showDashboard();
```

## 🧪 Testing

Test your integration: [test-groq-orchestrator.html](test-groq-orchestrator.html)

## 📚 Full Documentation

See [GROQ_ORCHESTRATOR_GUIDE.md](GROQ_ORCHESTRATOR_GUIDE.md) for complete documentation.

## 🆘 Common Issues

### "GroqAI orchestrator not initialized"
Wait for page load or wrap in:
```javascript
window.addEventListener('load', () => {
  // use groqAI here
});
```

### Rate Limit Exceeded
Daily limit: 14,400 requests. Implement queuing for high-traffic apps.

### Slow Response
Use faster model: `llama-3.1-8b-instant`

## 📧 Support

- **Email**: BarbrickDesign@gmail.com
- **Test Suite**: Run diagnostics at test-groq-orchestrator.html
- **Documentation**: Full guide at GROQ_ORCHESTRATOR_GUIDE.md

## 🔑 API Key

The repo-wide key is configured in:
- `groq-orchestrator-config.json` (committed)
- `.env` (not committed, for local override)

**Key**: `gsk_your-groq-api-key-here`

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-08
