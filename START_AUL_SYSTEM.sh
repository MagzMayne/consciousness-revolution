#!/bin/bash
# START_AUL_SYSTEM.sh
# Quick start script for AUL-enhanced autonomous agents

echo "============================================================="
echo "🚀 Starting AUL-Enhanced Autonomous Agent System"
echo "============================================================="
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

# Check if required files exist
if [ ! -f "aul_orchestrator.py" ]; then
    echo "❌ Error: aul_orchestrator.py not found"
    echo "   Make sure you're in the repository root directory"
    exit 1
fi

echo "✅ Python 3 found"
echo "✅ AUL files verified"
echo ""

# Run tests first
echo "🧪 Running AUL test suite..."
python3 aul_test_suite.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo ""
else
    echo ""
    echo "⚠️  Some tests failed, but continuing..."
    echo ""
fi

# Start the orchestrator
echo "🤖 Starting AUL Orchestrator..."
echo ""
echo "📊 Dashboard will be available at: http://localhost:8765/AUL_DASHBOARD.html"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 aul_orchestrator.py
