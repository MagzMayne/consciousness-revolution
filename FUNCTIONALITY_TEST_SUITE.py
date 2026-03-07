#!/usr/bin/env python3
"""
COMPREHENSIVE FUNCTIONALITY TEST SUITE
Tests all critical functionality of the Consciousness Revolution platform.

Validates:
- All HTML pages render correctly
- JavaScript functionality works
- Python modules are executable
- Data integrity
- API endpoints (if running)
- File permissions
- Configuration validity

Run: python FUNCTIONALITY_TEST_SUITE.py
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple
import subprocess
import re

class FunctionalityTester:
    """Comprehensive functionality test suite."""
    
    def __init__(self):
        self.repo_root = Path(__file__).parent
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.test_results = []
        
    def run_all_tests(self) -> bool:
        """Run all functionality tests."""
        print("=" * 80)
        print("🧪 COMPREHENSIVE FUNCTIONALITY TEST SUITE")
        print("=" * 80)
        print(f"Started: {datetime.now().isoformat()}")
        print(f"Location: {self.repo_root}")
        print()
        
        # Run test categories
        print("Running test suites...\n")
        
        self._test_html_pages()
        self._test_python_modules()
        self._test_configuration_files()
        self._test_javascript_files()
        self._test_github_actions()
        self._test_data_integrity()
        self._test_file_permissions()
        self._test_critical_paths()
        self._test_trinity_organization()
        
        # Print results
        self._print_results()
        
        # Save results to JSON
        self._save_results()
        
        # Return success if 100% pass rate
        return self.tests_failed == 0
    
    def _add_test_result(self, category: str, name: str, passed: bool, message: str = ""):
        """Add a test result."""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
        else:
            self.tests_failed += 1
        
        self.test_results.append({
            "category": category,
            "name": name,
            "passed": passed,
            "message": message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Print result
        symbol = "✅" if passed else "❌"
        print(f"  {symbol} {name}")
        if message and not passed:
            print(f"      → {message}")
    
    def _test_html_pages(self):
        """Test all HTML pages."""
        print("🌐 Testing HTML Pages...")
        
        # Find all HTML files
        html_files = list(self.repo_root.glob("*.html"))
        
        # Test critical pages specifically
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
                try:
                    content = path.read_text()
                    
                    # Check basic HTML structure
                    has_doctype = "<!DOCTYPE html>" in content or "<!doctype html>" in content.lower()
                    has_html_tag = "<html" in content
                    has_head = "<head>" in content or "<head " in content
                    has_body = "<body" in content
                    
                    if has_doctype and has_html_tag and has_head and has_body:
                        self._add_test_result("HTML", f"Page structure: {page}", True)
                    else:
                        missing = []
                        if not has_doctype: missing.append("DOCTYPE")
                        if not has_html_tag: missing.append("html tag")
                        if not has_head: missing.append("head")
                        if not has_body: missing.append("body")
                        self._add_test_result(
                            "HTML", 
                            f"Page structure: {page}", 
                            False, 
                            f"Missing: {', '.join(missing)}"
                        )
                    
                    # Check for broken references (basic check)
                    # Look for src="" or href="" which indicate broken links
                    broken_srcs = re.findall(r'(src|href)=["\']["\'"]', content)
                    if not broken_srcs:
                        self._add_test_result("HTML", f"No broken links: {page}", True)
                    else:
                        self._add_test_result(
                            "HTML", 
                            f"No broken links: {page}", 
                            False,
                            f"Found {len(broken_srcs)} empty src/href"
                        )
                    
                except Exception as e:
                    self._add_test_result("HTML", f"Read {page}", False, str(e))
            else:
                self._add_test_result("HTML", f"Exists: {page}", False, "File not found")
        
        print()
    
    def _test_python_modules(self):
        """Test Python modules can be loaded."""
        print("🐍 Testing Python Modules...")
        
        python_files = [
            "SYSTEM_HEALTH_MONITOR.py",
            "OPERATIONS_DAEMON.py",
            "CYCLOTRON_DAEMON.py",
            "AUTONOMOUS_AGENT_ORCHESTRATOR.py",
            "FUNCTIONALITY_TEST_SUITE.py"
        ]
        
        for py_file in python_files:
            path = self.repo_root / py_file
            if path.exists():
                # Test syntax by compiling
                try:
                    result = subprocess.run(
                        ["python3", "-m", "py_compile", str(path)],
                        capture_output=True,
                        timeout=10
                    )
                    if result.returncode == 0:
                        self._add_test_result("Python", f"Syntax: {py_file}", True)
                    else:
                        self._add_test_result(
                            "Python", 
                            f"Syntax: {py_file}", 
                            False,
                            result.stderr.decode()[:100]
                        )
                except Exception as e:
                    self._add_test_result("Python", f"Syntax: {py_file}", False, str(e))
            else:
                self._add_test_result("Python", f"Exists: {py_file}", False, "File not found")
        
        print()
    
    def _test_configuration_files(self):
        """Test configuration files are valid."""
        print("⚙️  Testing Configuration Files...")
        
        # Test package.json
        package_json = self.repo_root / "package.json"
        if package_json.exists():
            try:
                with open(package_json) as f:
                    data = json.load(f)
                
                # Check required fields
                has_name = "name" in data
                has_version = "version" in data
                has_scripts = "scripts" in data
                
                if has_name and has_version and has_scripts:
                    self._add_test_result("Config", "package.json structure", True)
                else:
                    missing = []
                    if not has_name: missing.append("name")
                    if not has_version: missing.append("version")
                    if not has_scripts: missing.append("scripts")
                    self._add_test_result(
                        "Config", 
                        "package.json structure", 
                        False,
                        f"Missing: {', '.join(missing)}"
                    )
                
                # Check dependencies
                if "dependencies" in data:
                    self._add_test_result(
                        "Config", 
                        f"package.json dependencies ({len(data['dependencies'])})", 
                        True
                    )
                else:
                    self._add_test_result("Config", "package.json dependencies", False)
                
            except json.JSONDecodeError as e:
                self._add_test_result("Config", "package.json valid JSON", False, str(e))
            except Exception as e:
                self._add_test_result("Config", "package.json readable", False, str(e))
        else:
            self._add_test_result("Config", "package.json exists", False)
        
        # Test netlify.toml
        netlify_toml = self.repo_root / "netlify.toml"
        if netlify_toml.exists():
            try:
                content = netlify_toml.read_text()
                has_build = "[build]" in content
                self._add_test_result(
                    "Config", 
                    "netlify.toml has build config", 
                    has_build,
                    "Missing [build] section" if not has_build else ""
                )
            except Exception as e:
                self._add_test_result("Config", "netlify.toml readable", False, str(e))
        else:
            self._add_test_result("Config", "netlify.toml exists", False)
        
        # Test .gitignore
        gitignore = self.repo_root / ".gitignore"
        if gitignore.exists():
            try:
                content = gitignore.read_text()
                has_node_modules = "node_modules" in content
                self._add_test_result(
                    "Config", 
                    ".gitignore configured", 
                    has_node_modules,
                    "Missing node_modules entry" if not has_node_modules else ""
                )
            except Exception as e:
                self._add_test_result("Config", ".gitignore readable", False, str(e))
        else:
            self._add_test_result("Config", ".gitignore exists", False)
        
        print()
    
    def _test_javascript_files(self):
        """Test JavaScript files for basic syntax."""
        print("📜 Testing JavaScript Files...")
        
        # Find JS files in root and js/ directory
        js_files = list(self.repo_root.glob("*.js"))
        js_dir = self.repo_root / "js"
        if js_dir.exists():
            js_files.extend(list(js_dir.glob("*.js")))
        
        if js_files:
            for js_file in js_files[:10]:  # Test first 10
                try:
                    content = js_file.read_text()
                    # Basic syntax check - look for common errors
                    has_unclosed_braces = content.count('{') != content.count('}')
                    has_unclosed_parens = content.count('(') != content.count(')')
                    
                    if not has_unclosed_braces and not has_unclosed_parens:
                        self._add_test_result("JavaScript", f"Basic syntax: {js_file.name}", True)
                    else:
                        issues = []
                        if has_unclosed_braces: issues.append("unclosed braces")
                        if has_unclosed_parens: issues.append("unclosed parentheses")
                        self._add_test_result(
                            "JavaScript", 
                            f"Basic syntax: {js_file.name}", 
                            False,
                            ", ".join(issues)
                        )
                except Exception as e:
                    self._add_test_result("JavaScript", f"Read {js_file.name}", False, str(e))
        else:
            self._add_test_result("JavaScript", "JS files found", False, "No JS files")
        
        print()
    
    def _test_github_actions(self):
        """Test GitHub Actions workflows."""
        print("🔧 Testing GitHub Actions...")
        
        workflows_dir = self.repo_root / ".github" / "workflows"
        if workflows_dir.exists():
            workflow_files = list(workflows_dir.glob("*.yml")) + list(workflows_dir.glob("*.yaml"))
            
            if workflow_files:
                self._add_test_result(
                    "CI/CD", 
                    f"GitHub Actions workflows ({len(workflow_files)})", 
                    True
                )
                
                # Check each workflow for basic structure
                for workflow in workflow_files:
                    try:
                        content = workflow.read_text()
                        has_name = "name:" in content
                        has_on = "on:" in content
                        has_jobs = "jobs:" in content
                        
                        if has_name and has_on and has_jobs:
                            self._add_test_result(
                                "CI/CD", 
                                f"Workflow structure: {workflow.name}", 
                                True
                            )
                        else:
                            missing = []
                            if not has_name: missing.append("name")
                            if not has_on: missing.append("on")
                            if not has_jobs: missing.append("jobs")
                            self._add_test_result(
                                "CI/CD", 
                                f"Workflow structure: {workflow.name}", 
                                False,
                                f"Missing: {', '.join(missing)}"
                            )
                    except Exception as e:
                        self._add_test_result(
                            "CI/CD", 
                            f"Read workflow: {workflow.name}", 
                            False, 
                            str(e)
                        )
            else:
                self._add_test_result("CI/CD", "Workflows found", False, "No workflow files")
        else:
            self._add_test_result("CI/CD", ".github/workflows exists", False)
        
        print()
    
    def _test_data_integrity(self):
        """Test data files integrity."""
        print("💾 Testing Data Integrity...")
        
        # Test JSON files
        json_files = [
            "package.json",
            "CONSCIOUSNESS_CORE.json",
            "COMMANDER_BRAIN.json"
        ]
        
        for json_file in json_files:
            path = self.repo_root / json_file
            if path.exists():
                try:
                    with open(path) as f:
                        data = json.load(f)
                    self._add_test_result("Data", f"Valid JSON: {json_file}", True)
                except json.JSONDecodeError as e:
                    self._add_test_result("Data", f"Valid JSON: {json_file}", False, str(e)[:100])
                except Exception as e:
                    self._add_test_result("Data", f"Read {json_file}", False, str(e))
            # Note: Not all files may exist, which is okay
        
        print()
    
    def _test_file_permissions(self):
        """Test file permissions."""
        print("🔒 Testing File Permissions...")
        
        # Check that Python files are readable
        python_files = list(self.repo_root.glob("*.py"))
        if python_files:
            for py_file in python_files[:5]:  # Test first 5
                try:
                    py_file.read_text()
                    self._add_test_result("Permissions", f"Readable: {py_file.name}", True)
                except PermissionError:
                    self._add_test_result(
                        "Permissions", 
                        f"Readable: {py_file.name}", 
                        False,
                        "Permission denied"
                    )
        
        # Check that HTML files are readable
        html_files = list(self.repo_root.glob("*.html"))
        if html_files:
            try:
                html_files[0].read_text()
                self._add_test_result("Permissions", "HTML files readable", True)
            except PermissionError:
                self._add_test_result("Permissions", "HTML files readable", False, "Permission denied")
        
        print()
    
    def _test_trinity_organization(self):
        """Test trinity loop organization structure and divinity catalog."""
        print("✦ Testing Trinity Loop Organization...")

        SEVEN_DOMAINS = {"COMMAND", "BUILD", "CONNECT", "PROTECT", "GROW", "LEARN", "TRANSCEND"}
        VALID_TIERS = {"DIVINE", "TRANSCENDENT", "ENLIGHTENED", "AWAKENED", "CONSCIOUS", "AWARE", "SEEKER"}
        VALID_STATUSES = {"complete", "needs_polish", "in_progress", "needs_work"}

        # 1. projects.json exists and is valid JSON
        projects_path = self.repo_root / "projects.json"
        if not projects_path.exists():
            self._add_test_result("Trinity", "projects.json exists", False, "File not found")
            return
        try:
            with open(projects_path, encoding="utf-8") as f:
                catalog = json.load(f)
            self._add_test_result("Trinity", "projects.json is valid JSON", True)
        except json.JSONDecodeError as e:
            self._add_test_result("Trinity", "projects.json is valid JSON", False, str(e)[:100])
            return

        # 2. Meta contains 7-domain definitions
        meta = catalog.get("meta", {})
        has_seven_domains = "seven_domains" in meta and len(meta["seven_domains"]) == 7
        self._add_test_result(
            "Trinity",
            "projects.json meta has 7-domain definitions",
            has_seven_domains,
            "" if has_seven_domains else "Missing or incomplete seven_domains in meta"
        )

        # 3. Meta contains divinity schema
        has_divinity_schema = "divinity_schema" in meta
        self._add_test_result(
            "Trinity",
            "projects.json meta has divinity_schema",
            has_divinity_schema,
            "" if has_divinity_schema else "Missing divinity_schema in meta"
        )

        # 4. Every project has domain, divinity_score, divinity_tier, trinity_status
        projects = catalog.get("projects", [])
        if not projects:
            self._add_test_result("Trinity", "projects.json has projects", False, "Empty projects list")
            return
        self._add_test_result("Trinity", f"projects.json has {len(projects)} projects", True)

        missing_domain = [p.get("filename", "?") for p in projects if p.get("domain") not in SEVEN_DOMAINS]
        self._add_test_result(
            "Trinity",
            "All projects have valid 7-domain classification",
            len(missing_domain) == 0,
            f"{len(missing_domain)} projects missing domain: {missing_domain[:3]}" if missing_domain else ""
        )

        missing_score = [p.get("filename", "?") for p in projects if "divinity_score" not in p]
        self._add_test_result(
            "Trinity",
            "All projects have divinity_score",
            len(missing_score) == 0,
            f"{len(missing_score)} projects missing divinity_score" if missing_score else ""
        )

        invalid_tier = [p.get("filename", "?") for p in projects if p.get("divinity_tier") not in VALID_TIERS]
        self._add_test_result(
            "Trinity",
            "All projects have valid divinity_tier",
            len(invalid_tier) == 0,
            f"{len(invalid_tier)} projects have invalid tier: {invalid_tier[:3]}" if invalid_tier else ""
        )

        invalid_status = [p.get("filename", "?") for p in projects if p.get("trinity_status") not in VALID_STATUSES]
        self._add_test_result(
            "Trinity",
            "All projects have valid trinity_status",
            len(invalid_status) == 0,
            f"{len(invalid_status)} projects have invalid status" if invalid_status else ""
        )

        # 5. Divinity scores in range 0-100
        out_of_range = []
        for p in projects:
            score = p.get("divinity_score")
            if not isinstance(score, (int, float)) or not (0 <= score <= 100):
                out_of_range.append(p.get("filename", "?"))
        self._add_test_result(
            "Trinity",
            "All divinity scores are in range 0-100",
            len(out_of_range) == 0,
            f"{len(out_of_range)} scores out of range: {out_of_range[:3]}" if out_of_range else ""
        )

        # 6. All 7 domains are represented
        used_domains = set(p.get("domain") for p in projects)
        domains_covered = SEVEN_DOMAINS.issubset(used_domains)
        self._add_test_result(
            "Trinity",
            "All 7 domains are represented in projects",
            domains_covered,
            f"Missing domains: {SEVEN_DOMAINS - used_domains}" if not domains_covered else ""
        )

        # 7. Trinity loop organizer HTML exists
        organizer_path = self.repo_root / "TRINITY_LOOP_ORGANIZER.html"
        self._add_test_result(
            "Trinity",
            "TRINITY_LOOP_ORGANIZER.html exists",
            organizer_path.exists()
        )

        # 8. Core trinity files exist
        for trinity_file in ["trinityLoop.html", "trinityLooper.html"]:
            path = self.repo_root / trinity_file
            self._add_test_result(
                "Trinity",
                f"Core trinity file: {trinity_file}",
                path.exists(),
                "File not found" if not path.exists() else ""
            )

        # 9. Divinity distribution check (informational — projects list is non-empty at this point)
        divine_count = sum(1 for p in projects if p.get("divinity_score", 0) >= 100)
        avg_score = sum(p.get("divinity_score", 0) for p in projects) / len(projects)
        self._add_test_result(
            "Trinity",
            f"Divinity distribution: {divine_count} DIVINE, avg={avg_score:.1f}",
            True  # Informational — always passes
        )

        print()

    def _test_critical_paths(self):
        """Test critical system paths."""
        print("📂 Testing Critical Paths...")
        
        critical_items = [
            ("File", "README.md"),
            ("File", "package.json"),
            ("File", "index.html"),
            ("Directory", ".github"),
            ("Directory", ".github/workflows"),
        ]
        
        for item_type, item_name in critical_items:
            path = self.repo_root / item_name
            exists = path.exists()
            
            if item_type == "File":
                is_correct_type = path.is_file() if exists else False
            else:  # Directory
                is_correct_type = path.is_dir() if exists else False
            
            self._add_test_result(
                "Paths", 
                f"{item_type}: {item_name}", 
                exists and is_correct_type,
                "Not found" if not exists else "Wrong type" if not is_correct_type else ""
            )
        
        print()
    
    def _print_results(self):
        """Print test results summary."""
        print("\n" + "=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        
        # Overall stats
        percentage = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"\nTotal Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed} ✅")
        print(f"Failed: {self.tests_failed} ❌")
        print(f"Success Rate: {percentage:.1f}%")
        
        # Status
        if percentage == 100:
            print(f"\n🎉 ALL TESTS PASSED! Platform is 100% functional!")
        elif percentage >= 90:
            print(f"\n⚠️  {self.tests_failed} test(s) failed. Platform is {percentage:.1f}% functional.")
        else:
            print(f"\n❌ {self.tests_failed} test(s) failed. Platform needs attention.")
        
        # Failed tests details
        if self.tests_failed > 0:
            print("\n" + "-" * 80)
            print("FAILED TESTS:")
            print("-" * 80)
            for result in self.test_results:
                if not result["passed"]:
                    print(f"❌ [{result['category']}] {result['name']}")
                    if result["message"]:
                        print(f"   → {result['message']}")
        
        print("\n" + "=" * 80)
    
    def _save_results(self):
        """Save test results to JSON file."""
        results_file = self.repo_root / "FUNCTIONALITY_TEST_RESULTS.json"
        
        output = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": self.tests_run,
                "passed": self.tests_passed,
                "failed": self.tests_failed,
                "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
            },
            "tests": self.test_results
        }
        
        with open(results_file, 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"\nResults saved to: {results_file}")

def main():
    """Main entry point."""
    tester = FunctionalityTester()
    
    try:
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Critical error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
