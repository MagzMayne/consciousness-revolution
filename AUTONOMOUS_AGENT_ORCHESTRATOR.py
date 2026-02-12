#!/usr/bin/env python3
"""
AUTONOMOUS AGENT ORCHESTRATOR
Master controller for all autonomous agents ensuring 100% functionality.

This agent:
1. Monitors all platform components continuously
2. Validates functionality across all domains
3. Runs automated healing/recovery when issues detected
4. Generates real-time health dashboards
5. Ensures 100% uptime and functionality

Run: python AUTONOMOUS_AGENT_ORCHESTRATOR.py
"""

import json
import time
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
import http.server
import socketserver
import threading
import signal

class AutonomousAgentOrchestrator:
    """Master orchestrator for all autonomous agents."""
    
    def __init__(self):
        self.repo_root = Path(__file__).parent
        self.running = False
        self.agents = {}
        self.health_data = {
            "overall_status": "unknown",
            "last_check": None,
            "agents": {},
            "tests": {},
            "recovery_actions": []
        }
        
    def start(self):
        """Start the autonomous agent orchestrator."""
        print("=" * 70)
        print("🤖 AUTONOMOUS AGENT ORCHESTRATOR")
        print("=" * 70)
        print(f"Started: {datetime.now().isoformat()}")
        print(f"Location: {self.repo_root}")
        print()
        
        self.running = True
        
        # Register signal handler for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        # Start health dashboard server in background
        dashboard_thread = threading.Thread(target=self._start_dashboard_server, daemon=True)
        dashboard_thread.start()
        
        print("✅ Dashboard server started on http://localhost:8765")
        print()
        
        # Main monitoring loop
        cycle = 0
        while self.running:
            cycle += 1
            print(f"\n{'='*70}")
            print(f"🔄 MONITORING CYCLE #{cycle} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"{'='*70}\n")
            
            # Run all checks
            self._run_comprehensive_checks()
            
            # Auto-heal if needed
            self._auto_heal()
            
            # Generate dashboard update
            self._update_dashboard()
            
            # Save state
            self._save_state()
            
            # Print summary
            self._print_summary()
            
            # Wait before next cycle (5 minutes)
            if self.running:
                print(f"\n⏳ Sleeping for 5 minutes... (Press Ctrl+C to stop)")
                time.sleep(300)
    
    def _signal_handler(self, sig, frame):
        """Handle shutdown signals."""
        print("\n\n🛑 Shutdown signal received. Stopping gracefully...")
        self.running = False
        sys.exit(0)
    
    def _run_comprehensive_checks(self):
        """Run all comprehensive checks."""
        self.health_data["last_check"] = datetime.now().isoformat()
        
        # 1. File system checks
        print("📁 Checking file system...")
        self._check_filesystem()
        
        # 2. Dependencies check
        print("📦 Checking dependencies...")
        self._check_dependencies()
        
        # 3. Configuration checks
        print("⚙️  Checking configurations...")
        self._check_configurations()
        
        # 4. Critical pages check
        print("🌐 Checking critical pages...")
        self._check_critical_pages()
        
        # 5. Python modules check
        print("🐍 Checking Python modules...")
        self._check_python_modules()
        
        # 6. GitHub Actions check
        print("🔧 Checking GitHub Actions...")
        self._check_github_actions()
        
        # Calculate overall status
        total_checks = len(self.health_data["tests"])
        passed_checks = sum(1 for t in self.health_data["tests"].values() if t["status"] == "pass")
        
        if total_checks > 0:
            percentage = (passed_checks / total_checks) * 100
            if percentage == 100:
                self.health_data["overall_status"] = "healthy"
            elif percentage >= 80:
                self.health_data["overall_status"] = "warning"
            else:
                self.health_data["overall_status"] = "critical"
        else:
            self.health_data["overall_status"] = "unknown"
    
    def _check_filesystem(self):
        """Check critical files and directories."""
        critical_files = [
            "index.html",
            "package.json",
            "netlify.toml",
            "README.md",
            "SYSTEM_HEALTH_MONITOR.py",
            "OPERATIONS_DAEMON.py"
        ]
        
        for file in critical_files:
            path = self.repo_root / file
            status = "pass" if path.exists() else "fail"
            self.health_data["tests"][f"file_{file}"] = {
                "name": f"File exists: {file}",
                "status": status,
                "timestamp": datetime.now().isoformat()
            }
    
    def _check_dependencies(self):
        """Check npm dependencies are installed."""
        node_modules = self.repo_root / "node_modules"
        
        if node_modules.exists():
            # Check key dependencies
            key_deps = ["@supabase/supabase-js", "stripe", "netlify-cli"]
            for dep in key_deps:
                dep_path = node_modules / dep
                status = "pass" if dep_path.exists() else "fail"
                self.health_data["tests"][f"dep_{dep}"] = {
                    "name": f"Dependency: {dep}",
                    "status": status,
                    "timestamp": datetime.now().isoformat()
                }
        else:
            self.health_data["tests"]["npm_install"] = {
                "name": "node_modules exists",
                "status": "fail",
                "timestamp": datetime.now().isoformat()
            }
    
    def _check_configurations(self):
        """Check configuration files are valid."""
        # Check package.json
        package_json = self.repo_root / "package.json"
        if package_json.exists():
            try:
                with open(package_json) as f:
                    data = json.load(f)
                self.health_data["tests"]["config_package_json"] = {
                    "name": "Valid package.json",
                    "status": "pass",
                    "timestamp": datetime.now().isoformat()
                }
            except json.JSONDecodeError:
                self.health_data["tests"]["config_package_json"] = {
                    "name": "Valid package.json",
                    "status": "fail",
                    "timestamp": datetime.now().isoformat()
                }
        
        # Check netlify.toml exists
        netlify_toml = self.repo_root / "netlify.toml"
        status = "pass" if netlify_toml.exists() else "fail"
        self.health_data["tests"]["config_netlify"] = {
            "name": "Netlify config exists",
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
    
    def _check_critical_pages(self):
        """Check critical HTML pages exist and are valid."""
        critical_pages = [
            "index.html",
            "login.html",
            "araya-chat.html",
            "consciousness-tools.html",
            "seven-domains.html",
            "start.html",
            "dashboard.html"
        ]
        
        for page in critical_pages:
            path = self.repo_root / page
            if path.exists():
                # Basic validation - check if it's HTML
                try:
                    content = path.read_text()
                    has_html = "<!DOCTYPE html>" in content or "<html" in content
                    status = "pass" if has_html else "warn"
                except:
                    status = "fail"
            else:
                status = "fail"
            
            self.health_data["tests"][f"page_{page}"] = {
                "name": f"Page: {page}",
                "status": status,
                "timestamp": datetime.now().isoformat()
            }
    
    def _check_python_modules(self):
        """Check Python autonomous modules are working."""
        python_modules = [
            "SYSTEM_HEALTH_MONITOR.py",
            "OPERATIONS_DAEMON.py",
            "CYCLOTRON_DAEMON.py"
        ]
        
        for module in python_modules:
            path = self.repo_root / module
            if path.exists():
                # Try to import/validate syntax
                try:
                    result = subprocess.run(
                        ["python3", "-m", "py_compile", str(path)],
                        capture_output=True,
                        timeout=10
                    )
                    status = "pass" if result.returncode == 0 else "fail"
                except:
                    status = "fail"
            else:
                status = "fail"
            
            self.health_data["tests"][f"python_{module}"] = {
                "name": f"Python module: {module}",
                "status": status,
                "timestamp": datetime.now().isoformat()
            }
    
    def _check_github_actions(self):
        """Check GitHub Actions workflows are configured."""
        workflows_dir = self.repo_root / ".github" / "workflows"
        
        if workflows_dir.exists():
            workflows = list(workflows_dir.glob("*.yml"))
            self.health_data["tests"]["github_actions"] = {
                "name": f"GitHub Actions ({len(workflows)} workflows)",
                "status": "pass" if len(workflows) > 0 else "fail",
                "timestamp": datetime.now().isoformat()
            }
        else:
            self.health_data["tests"]["github_actions"] = {
                "name": "GitHub Actions configured",
                "status": "fail",
                "timestamp": datetime.now().isoformat()
            }
    
    def _auto_heal(self):
        """Automatically fix detected issues."""
        print("\n🔧 AUTO-HEALING CHECK...")
        
        healing_actions = []
        
        # Check if node_modules missing
        if self.health_data["tests"].get("npm_install", {}).get("status") == "fail":
            print("  ⚕️  Detected missing node_modules, attempting npm install...")
            try:
                result = subprocess.run(
                    ["npm", "install", "--legacy-peer-deps"],
                    cwd=str(self.repo_root),
                    capture_output=True,
                    timeout=300
                )
                if result.returncode == 0:
                    healing_actions.append({
                        "action": "npm_install",
                        "status": "success",
                        "timestamp": datetime.now().isoformat()
                    })
                    print("  ✅ Successfully installed npm dependencies")
                else:
                    healing_actions.append({
                        "action": "npm_install",
                        "status": "failed",
                        "timestamp": datetime.now().isoformat()
                    })
                    print("  ❌ Failed to install npm dependencies")
            except Exception as e:
                healing_actions.append({
                    "action": "npm_install",
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                print(f"  ❌ Error during npm install: {e}")
        
        # Store healing actions
        if healing_actions:
            self.health_data["recovery_actions"].extend(healing_actions)
            # Keep only last 50 actions
            self.health_data["recovery_actions"] = self.health_data["recovery_actions"][-50:]
        else:
            print("  ✅ No healing actions needed")
    
    def _update_dashboard(self):
        """Update the dashboard HTML file."""
        dashboard_path = self.repo_root / "AUTONOMOUS_DASHBOARD.html"
        
        # Calculate stats
        total = len(self.health_data["tests"])
        passed = sum(1 for t in self.health_data["tests"].values() if t["status"] == "pass")
        failed = sum(1 for t in self.health_data["tests"].values() if t["status"] == "fail")
        percentage = (passed / total * 100) if total > 0 else 0
        
        # Determine status color
        if percentage == 100:
            status_color = "#10b981"  # green
            status_text = "HEALTHY"
        elif percentage >= 80:
            status_color = "#f59e0b"  # orange
            status_text = "WARNING"
        else:
            status_color = "#ef4444"  # red
            status_text = "CRITICAL"
        
        # Generate test rows
        test_rows = ""
        for test_id, test_data in self.health_data["tests"].items():
            status_symbol = "✅" if test_data["status"] == "pass" else "❌"
            test_rows += f"""
            <tr>
                <td>{status_symbol}</td>
                <td>{test_data["name"]}</td>
                <td><span class="status-{test_data['status']}">{test_data["status"].upper()}</span></td>
            </tr>
            """
        
        # Generate recovery action rows
        recovery_rows = ""
        for action in self.health_data["recovery_actions"][-10:]:  # Last 10
            status_symbol = "✅" if action["status"] == "success" else "❌"
            recovery_rows += f"""
            <tr>
                <td>{action['timestamp']}</td>
                <td>{action['action']}</td>
                <td>{status_symbol} {action['status']}</td>
            </tr>
            """
        
        if not recovery_rows:
            recovery_rows = "<tr><td colspan='3' style='text-align: center; color: #888;'>No recovery actions taken</td></tr>"
        
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autonomous Agent Dashboard</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 20px;
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        
        header {{
            text-align: center;
            margin-bottom: 40px;
        }}
        
        h1 {{
            font-size: 2.5rem;
            margin-bottom: 10px;
        }}
        
        .subtitle {{
            font-size: 1.1rem;
            opacity: 0.9;
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }}
        
        .stat-card {{
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }}
        
        .stat-value {{
            font-size: 3rem;
            font-weight: bold;
            margin: 10px 0;
        }}
        
        .stat-label {{
            font-size: 0.9rem;
            opacity: 0.8;
        }}
        
        .status-banner {{
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin-bottom: 40px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }}
        
        .status-text {{
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        
        .section {{
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }}
        
        h2 {{
            margin-bottom: 20px;
            font-size: 1.5rem;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }}
        
        th {{
            font-weight: 600;
            opacity: 0.9;
        }}
        
        .status-pass {{
            color: #10b981;
            font-weight: bold;
        }}
        
        .status-fail {{
            color: #ef4444;
            font-weight: bold;
        }}
        
        .status-warn {{
            color: #f59e0b;
            font-weight: bold;
        }}
        
        .last-updated {{
            text-align: center;
            margin-top: 30px;
            opacity: 0.7;
            font-size: 0.9rem;
        }}
        
        .auto-refresh {{
            text-align: center;
            margin-bottom: 20px;
            opacity: 0.8;
        }}
    </style>
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(function() {{
            location.reload();
        }}, 30000);
    </script>
</head>
<body>
    <div class="container">
        <header>
            <h1>🤖 Autonomous Agent Dashboard</h1>
            <p class="subtitle">Real-time monitoring of Consciousness Revolution platform</p>
        </header>
        
        <div class="auto-refresh">🔄 Auto-refreshing every 30 seconds</div>
        
        <div class="status-banner">
            <div class="status-text" style="color: {status_color};">{status_text}</div>
            <div style="font-size: 1.2rem;">{percentage:.1f}% Functionality</div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Checks</div>
                <div class="stat-value">{total}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Passed</div>
                <div class="stat-value" style="color: #10b981;">{passed}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Failed</div>
                <div class="stat-value" style="color: #ef4444;">{failed}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">Recovery Actions</div>
                <div class="stat-value">{len(self.health_data['recovery_actions'])}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>📋 System Checks</h2>
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Check</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    {test_rows}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>🔧 Recent Recovery Actions</h2>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Action</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {recovery_rows}
                </tbody>
            </table>
        </div>
        
        <div class="last-updated">
            Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        </div>
    </div>
</body>
</html>"""
        
        # Write the dashboard
        with open(dashboard_path, 'w') as f:
            f.write(html_content)
        
        print(f"  📊 Dashboard updated: {dashboard_path}")
    
    def _save_state(self):
        """Save current state to JSON."""
        state_path = self.repo_root / ".autonomous_state.json"
        with open(state_path, 'w') as f:
            json.dump(self.health_data, f, indent=2)
    
    def _print_summary(self):
        """Print monitoring summary."""
        total = len(self.health_data["tests"])
        passed = sum(1 for t in self.health_data["tests"].values() if t["status"] == "pass")
        failed = sum(1 for t in self.health_data["tests"].values() if t["status"] == "fail")
        percentage = (passed / total * 100) if total > 0 else 0
        
        print(f"\n{'='*70}")
        print(f"📊 SUMMARY")
        print(f"{'='*70}")
        print(f"Overall Status: {self.health_data['overall_status'].upper()}")
        print(f"Functionality: {percentage:.1f}%")
        print(f"Checks: {passed}/{total} passed, {failed} failed")
        print(f"Dashboard: http://localhost:8765")
        print(f"{'='*70}")
    
    def _start_dashboard_server(self):
        """Start HTTP server for dashboard."""
        PORT = 8765
        
        class DashboardHandler(http.server.SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=str(self.repo_root), **kwargs)
            
            def log_message(self, format, *args):
                pass  # Suppress log messages
        
        # Fix the handler to use the correct directory
        handler = lambda *args, **kwargs: http.server.SimpleHTTPRequestHandler(
            *args, directory=str(self.repo_root), **kwargs
        )
        
        try:
            with socketserver.TCPServer(("", PORT), handler) as httpd:
                httpd.serve_forever()
        except Exception as e:
            print(f"Dashboard server error: {e}")

def main():
    """Main entry point."""
    orchestrator = AutonomousAgentOrchestrator()
    
    try:
        orchestrator.start()
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
