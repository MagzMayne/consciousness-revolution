# Araya Chat Testing Checklist

Use this checklist to verify Araya Chat is working correctly after deployment.

## Pre-Deployment Checks

- [ ] Domain `consciousnessrevolution.io` configured in Netlify
- [ ] DNS records pointing to Netlify
- [ ] All environment variables configured (see ARAYA_QUICK_SETUP.md)
- [ ] Supabase database tables created
- [ ] Netlify site deployed successfully

## Environment Variables Verification

Check in Netlify Dashboard > Site settings > Environment variables:

- [ ] `DEEPSEEK_API_KEY` - Set and not empty
- [ ] `ANTHROPIC_API_KEY` - Set and not empty
- [ ] `SUPABASE_URL` - Set and valid URL
- [ ] `SUPABASE_KEY` - Set and not empty
- [ ] `SUPABASE_SERVICE_ROLE_SECRET` - Set and not empty
- [ ] `GITHUB_TOKEN` - Set and starts with `ghp_`
- [ ] `GITHUB_OWNER` - Set to `overkor-tek`
- [ ] `GITHUB_REPO` - Set to `consciousness-revolution`
- [ ] `GITHUB_BRANCH` - Set to `master`

## Basic Functionality Tests

### 1. Page Load Test
- [ ] Navigate to https://consciousnessrevolution.io/araya-chat
- [ ] Page loads without errors
- [ ] No console errors (F12 > Console)
- [ ] Chat interface displays correctly
- [ ] Status indicator shows connection state

### 2. Health Check Test
- [ ] Status indicator shows "AI ONLINE" (green dot)
- [ ] OR shows clear error message if misconfigured
- [ ] No "OFFLINE MODE" on fresh deployment with correct config

### 3. Simple Message Test
- [ ] Type: "Hello Araya"
- [ ] Press Enter or click TRANSMIT
- [ ] Message appears in chat
- [ ] Typing indicator shows
- [ ] Response received within 5-10 seconds
- [ ] Response is coherent and on-topic

### 4. Conversation Test
- [ ] Send: "What is consciousness?"
- [ ] Receive meaningful response
- [ ] Send follow-up: "Tell me more"
- [ ] Araya references previous message (context working)

### 5. Memory Test
- [ ] Send: "My name is [YourName]"
- [ ] Araya confirms name saved
- [ ] Refresh page
- [ ] Send: "What's my name?"
- [ ] Araya recalls your name correctly

### 6. Pattern Recognition Test
- [ ] Send: "Someone is love bombing me with constant compliments"
- [ ] Araya identifies manipulation pattern
- [ ] Response includes educational content about love bombing
- [ ] Suggestions for handling the situation

## Advanced Feature Tests

### 7. Image Analysis Test (if Anthropic key configured)
- [ ] Click attachment button
- [ ] Upload an image
- [ ] Send with message: "What do you see?"
- [ ] Araya analyzes image content
- [ ] Description is accurate

### 8. File Operations Test (if GitHub token configured)
- [ ] Send: "Show me files"
- [ ] File panel opens
- [ ] Files from repository display
- [ ] Click a file to preview
- [ ] File content loads correctly

### 9. Case Builder Test (if Supabase configured)
- [ ] Send: "Create a new case about workplace harassment"
- [ ] Araya creates case
- [ ] Case details saved
- [ ] Can retrieve case later

## Error Handling Tests

### 10. Rate Limit Test
- [ ] Send 20+ messages quickly (as free user)
- [ ] After 20 messages, see rate limit message
- [ ] Message includes upgrade link
- [ ] Wait until next day - limit resets

### 11. Invalid Input Test
- [ ] Send empty message (should not send)
- [ ] Send very long message (2000+ chars) - should work
- [ ] Send message with special characters - should work

### 12. Network Error Test
- [ ] Disconnect internet
- [ ] Try to send message
- [ ] See offline mode fallback
- [ ] Reconnect internet
- [ ] Message sends successfully

## Performance Tests

### 13. Response Time Test
- [ ] Simple question: < 5 seconds
- [ ] Complex question: < 10 seconds
- [ ] Image analysis: < 15 seconds
- [ ] File operation: < 20 seconds

### 14. Concurrent Users Test (if possible)
- [ ] Open 3+ browser windows
- [ ] Different users (incognito/different browsers)
- [ ] All get responses
- [ ] No cross-contamination of conversations

## Mobile Tests

### 15. Mobile Responsive Test
- [ ] Open on mobile device or emulator
- [ ] Interface scales correctly
- [ ] Input field accessible
- [ ] Send button works
- [ ] Messages display properly
- [ ] No horizontal scrolling

### 16. Mobile Interaction Test
- [ ] Touch scrolling works
- [ ] Keyboard doesn't obscure input
- [ ] Attachment button accessible
- [ ] All features work on touch

## Monitoring & Logs

### 17. Function Logs Check
- [ ] Go to Netlify Dashboard > Functions
- [ ] Click on `araya-chat`
- [ ] View recent logs
- [ ] No error messages
- [ ] Successful API calls logged
- [ ] Response times reasonable

### 18. Supabase Dashboard Check
- [ ] Go to Supabase dashboard
- [ ] Check `araya_memory` table
- [ ] User entries created
- [ ] Memory fragments saved
- [ ] Daily interaction counter updating

## Security Tests

### 19. Environment Variable Exposure
- [ ] View page source
- [ ] Check Network tab (F12)
- [ ] Verify no API keys visible
- [ ] No sensitive data in console logs

### 20. Authentication Test
- [ ] Each user gets unique ID
- [ ] Cannot access other users' data
- [ ] Memory isolated per user

## Deployment Verification

### 21. Production Deployment
- [ ] Latest commit deployed
- [ ] CNAME file correct: `consciousnessrevolution.io`
- [ ] No 404 errors
- [ ] HTTPS working
- [ ] Certificate valid

### 22. GitHub Actions Check
- [ ] Workflow runs successfully
- [ ] No failed deployments
- [ ] Environment variables accessible in workflow
- [ ] Netlify auth token valid

## Troubleshooting Reference

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| CONFIG ERROR | Missing env variables | Check Netlify environment variables |
| OFFLINE MODE | Function not deployed | Wait for deployment, check logs |
| No response | API key invalid | Verify API keys are correct |
| 503 error | Missing Supabase config | Add Supabase variables |
| Slow responses | API rate limit | Check API usage dashboard |
| Memory not working | Supabase table missing | Create tables from guide |
| Image upload fails | No Anthropic key | Add ANTHROPIC_API_KEY |
| File operations fail | No GitHub token | Add GITHUB_TOKEN |

## Post-Deployment Actions

After all tests pass:

- [ ] Document any issues encountered
- [ ] Update troubleshooting guide if needed
- [ ] Monitor for 24 hours
- [ ] Check error rates in Netlify
- [ ] Review API costs
- [ ] Set up alerts for failures
- [ ] Share working URL with team
- [ ] Update documentation with any gotchas

## Success Criteria

✅ Deployment is successful when:
- All basic functionality tests pass
- Response time < 10 seconds
- No configuration errors
- Memory persists across sessions
- Mobile interface works
- Function logs show no errors

## Notes

Date tested: _______________
Tested by: _______________
Issues found: _______________
Resolution: _______________
