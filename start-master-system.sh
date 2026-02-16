#!/bin/bash

##############################################################################
# Master System Startup Script
# Starts the email service and opens the dashboard interfaces
##############################################################################

echo "╔════════════════════════════════════════════════════╗"
echo "║   🎯 Master System Startup                         ║"
echo "║   Revenue Generation Platform                      ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd backend && npm install && cd ..
    echo "✅ Dependencies installed"
    echo ""
fi

# Start email service in background
echo "🚀 Starting email service..."
node backend/services/email-service.js > logs/email-service.log 2>&1 &
EMAIL_PID=$!
echo "✅ Email service started (PID: $EMAIL_PID)"
echo "   Log: logs/email-service.log"
echo ""

# Wait for service to be ready
sleep 3

# Test health endpoint
echo "🔍 Checking email service health..."
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Email service is healthy"
else
    echo "❌ Email service failed to start"
    kill $EMAIL_PID 2>/dev/null
    exit 1
fi
echo ""

echo "╔════════════════════════════════════════════════════╗"
echo "║   🎉 Master System is Ready!                       ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "📊 Dashboards:"
echo "   • Email Dashboard:  emailDashboard.html"
echo "   • Master System:    masterSystem.html"
echo ""
echo "🔧 Services:"
echo "   • Email API:        http://localhost:4000"
echo "   • Health Check:     http://localhost:4000/health"
echo "   • Stats:            http://localhost:4000/stats"
echo ""
echo "💡 Quick Commands:"
echo "   • Test Integration:  node test-master-system-integration.js"
echo "   • View Logs:         tail -f logs/email-service.log"
echo "   • Stop Service:      kill $EMAIL_PID"
echo ""
echo "💰 Revenue Collection:"
echo "   • PayPal:           BarbrickDesign@gmail.com"
echo "   • Payment Buttons:  Available in masterSystem.html"
echo ""
echo "📝 To stop the email service:"
echo "   kill $EMAIL_PID"
echo ""
echo "Press Ctrl+C to exit this script (service will continue running)"
echo ""

# Keep script running
trap "echo ''; echo 'Script terminated. Email service is still running.'; echo 'To stop it: kill $EMAIL_PID'; exit 0" INT

# Show live logs
echo "📋 Live Logs (Ctrl+C to stop viewing):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -f logs/email-service.log 2>/dev/null || echo "No logs yet..."
