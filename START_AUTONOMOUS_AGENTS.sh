#!/bin/bash
# START_AUTONOMOUS_AGENTS.sh
# Quick start script for the autonomous agent system

echo "=============================================="
echo "🤖 Autonomous Agent System - Quick Start"
echo "=============================================="
echo ""

# Check Python version
echo "📋 Checking requirements..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python 3 is required but not found"
    exit 1
fi
echo "✅ Python 3 found"

# Check if npm is installed
if command -v npm &> /dev/null; then
    echo "✅ npm found"
else
    echo "⚠️  npm not found - some functionality may be limited"
fi

echo ""
echo "Choose an option:"
echo "1) Run functionality tests only"
echo "2) Start autonomous agent orchestrator (continuous monitoring)"
echo "3) Run tests then start orchestrator"
echo "4) View last test results"
echo "5) Exit"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "🧪 Running functionality tests..."
        python3 FUNCTIONALITY_TEST_SUITE.py
        ;;
    2)
        echo ""
        echo "🚀 Starting autonomous agent orchestrator..."
        echo "Dashboard will be available at: http://localhost:8765/AUTONOMOUS_DASHBOARD.html"
        echo "Press Ctrl+C to stop"
        echo ""
        python3 AUTONOMOUS_AGENT_ORCHESTRATOR.py
        ;;
    3)
        echo ""
        echo "🧪 Running functionality tests first..."
        python3 FUNCTIONALITY_TEST_SUITE.py
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Tests passed! Starting orchestrator..."
            echo "Dashboard: http://localhost:8765/AUTONOMOUS_DASHBOARD.html"
            echo "Press Ctrl+C to stop"
            echo ""
            sleep 2
            python3 AUTONOMOUS_AGENT_ORCHESTRATOR.py
        else
            echo ""
            echo "❌ Tests failed. Fix issues before starting orchestrator."
            exit 1
        fi
        ;;
    4)
        echo ""
        if [ -f "FUNCTIONALITY_TEST_RESULTS.json" ]; then
            echo "📊 Last test results:"
            echo ""
            python3 -c "
import json
with open('FUNCTIONALITY_TEST_RESULTS.json') as f:
    data = json.load(f)
    summary = data['summary']
    print(f\"Timestamp: {data['timestamp']}\")
    print(f\"Total Tests: {summary['total_tests']}\")
    print(f\"Passed: {summary['passed']} ✅\")
    print(f\"Failed: {summary['failed']} ❌\")
    print(f\"Success Rate: {summary['success_rate']:.1f}%\")
    
    if summary['failed'] > 0:
        print(\"\nFailed tests:\")
        for test in data['tests']:
            if not test['passed']:
                print(f\"  ❌ [{test['category']}] {test['name']}\")
                if test['message']:
                    print(f\"     → {test['message']}\")
"
        else
            echo "No test results found. Run tests first (option 1)."
        fi
        ;;
    5)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=============================================="
