#!/bin/bash
# START_AUL_DASHBOARD.sh
# Launch the AUL Dashboard with API backend

echo "============================================================="
echo "🚀 Starting AUL Dashboard System"
echo "============================================================="
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

# Check if required files exist
if [ ! -f "aul_dashboard_api.py" ]; then
    echo "❌ Error: aul_dashboard_api.py not found"
    echo "   Make sure you're in the repository root directory"
    exit 1
fi

if [ ! -f "AUL_DASHBOARD.html" ]; then
    echo "❌ Error: AUL_DASHBOARD.html not found"
    exit 1
fi

echo "✅ Python 3 found"
echo "✅ Required files verified"
echo ""

# Start the dashboard API in background
echo "🤖 Starting AUL Dashboard API..."
python3 aul_dashboard_api.py &
API_PID=$!
echo "   API running on PID: $API_PID"
echo ""

# Start simple HTTP server for dashboard
echo "🌐 Starting web server for dashboard..."
python3 -m http.server 8080 &
WEB_PID=$!
echo "   Web server running on PID: $WEB_PID"
echo ""

echo "✅ Dashboard system is running!"
echo ""
echo "📊 Access the dashboard at:"
echo "   http://localhost:8080/AUL_DASHBOARD.html"
echo ""
echo "🔌 API endpoints available at:"
echo "   http://localhost:8766/api/agents"
echo "   http://localhost:8766/api/stats"
echo "   http://localhost:8766/api/messages"
echo "   http://localhost:8766/api/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Register cleanup function
trap cleanup INT TERM

# Wait for user interrupt
wait
