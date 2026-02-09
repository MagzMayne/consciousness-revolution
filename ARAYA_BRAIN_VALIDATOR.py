#!/usr/bin/env python3
"""
ARAYA BRAIN VALIDATOR - The Cheat Code
Proves both Web API and Discord are hooked to Cyclotron
Run this anytime to verify the connection is working.

Usage:
    python ARAYA_BRAIN_VALIDATOR.py          # Full test (10 rounds)
    python ARAYA_BRAIN_VALIDATOR.py quick    # Quick test (3 rounds)
    python ARAYA_BRAIN_VALIDATOR.py fix      # Auto-fix and retest
"""

import requests
import sqlite3
import json
import sys
import os
import time
import subprocess
from datetime import datetime

# Configuration
API_URL = "http://localhost:6666/chat"
CYCLOTRON_DB = os.path.expanduser("~/.consciousness/cyclotron_core/atoms.db")
DISCORD_LISTENER = os.path.expanduser("~/.consciousness/ARAYA_DISCORD_LISTENER.py")
ARAYA_API_FILE = os.path.join(os.path.dirname(__file__), "ARAYA_UNIFIED_API.py")

# Test questions that MUST use brain knowledge
TEST_QUESTIONS = [
    ("What are the 7 Domains?", ["COMMAND", "BUILD", "CONNECT", "PROTECT", "GROW", "LEARN", "TRANSCEND"]),
    ("Who is the Commander?", ["Darrick Preble"]),
    ("What is the Trinity formula?", ["C1", "C2", "C3", "×", "∞"]),
    ("Explain Pattern Theory 3-7-13", ["3", "7", "13", "Infinity"]),
    ("What is gaslighting?", ["manipulation", "question", "reality"]),
    ("What is love bombing?", ["manipulation", "overwhelming", "affection"]),
    ("What is LFSME?", ["Lighter", "Faster", "Stronger", "Elegant"]),
    ("What is the Cyclotron?", ["brain", "atoms", "knowledge"]),
]

class BrainValidator:
    def __init__(self):
        self.results = []
        self.api_working = False
        self.discord_configured = False
        self.cyclotron_connected = False

    def check_cyclotron(self):
        """Verify Cyclotron database exists and has atoms"""
        try:
            conn = sqlite3.connect(CYCLOTRON_DB)
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM atoms")
            count = c.fetchone()[0]
            conn.close()
            self.cyclotron_connected = count > 100000
            return count
        except Exception as e:
            print(f"  [ERROR] Cyclotron: {e}")
            return 0

    def check_api(self):
        """Verify ARAYA API is running"""
        try:
            response = requests.get("http://localhost:6666/health", timeout=5)
            self.api_working = response.status_code == 200
            return self.api_working
        except:
            # Try chat endpoint as fallback
            try:
                response = requests.post(API_URL, json={"message": "ping"}, timeout=10)
                self.api_working = response.status_code == 200
                return self.api_working
            except:
                return False

    def check_discord_config(self):
        """Verify Discord listener is configured to use the API"""
        try:
            with open(DISCORD_LISTENER, 'r') as f:
                content = f.read()
                # Check if it's pointing to the right API
                self.discord_configured = "localhost:6666" in content or "127.0.0.1:6666" in content
                return self.discord_configured
        except:
            return False

    def test_question(self, question, expected_keywords):
        """Test a single question and verify brain is being used"""
        try:
            response = requests.post(API_URL, json={"message": question}, timeout=60)
            data = response.json()

            brain_used = data.get("brain_context_used", 0)
            answer = data.get("response", "").lower()

            # Check if expected keywords are in response
            keywords_found = sum(1 for kw in expected_keywords if kw.lower() in answer)
            keyword_ratio = keywords_found / len(expected_keywords) if expected_keywords else 0

            # Determine pass/fail
            passed = brain_used > 0 and keyword_ratio >= 0.3  # At least 30% keywords + brain used

            return {
                "question": question[:50],
                "brain_context": brain_used,
                "keywords_found": f"{keywords_found}/{len(expected_keywords)}",
                "passed": passed,
                "snippet": answer[:80] + "..." if len(answer) > 80 else answer
            }
        except Exception as e:
            return {
                "question": question[:50],
                "brain_context": 0,
                "keywords_found": "0/0",
                "passed": False,
                "error": str(e)
            }

    def run_test_round(self, round_num, questions):
        """Run a single round of tests"""
        print(f"\n{'='*60}")
        print(f"  ROUND {round_num}")
        print(f"{'='*60}")

        round_results = []
        for q, keywords in questions:
            result = self.test_question(q, keywords)
            round_results.append(result)

            status = "✓ PASS" if result["passed"] else "✗ FAIL"
            print(f"  {status} | BRAIN:{result['brain_context']:2} | {result['question'][:40]}")

        return round_results

    def calculate_score(self, all_results):
        """Calculate overall brain connection score"""
        total_tests = len(all_results)
        passed = sum(1 for r in all_results if r["passed"])
        brain_used = sum(1 for r in all_results if r["brain_context"] > 0)

        return {
            "total": total_tests,
            "passed": passed,
            "brain_used": brain_used,
            "pass_rate": (passed / total_tests * 100) if total_tests > 0 else 0,
            "brain_rate": (brain_used / total_tests * 100) if total_tests > 0 else 0
        }

    def start_api(self):
        """Start ARAYA API if not running"""
        print("\n[FIX] Starting ARAYA API...")
        try:
            subprocess.Popen(
                ["python", ARAYA_API_FILE],
                cwd=os.path.dirname(ARAYA_API_FILE),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
            )
            time.sleep(5)  # Wait for startup
            return self.check_api()
        except Exception as e:
            print(f"  [ERROR] Could not start API: {e}")
            return False

    def run_validation(self, rounds=10, auto_fix=False):
        """Run full validation suite"""
        print("\n" + "="*60)
        print("  ARAYA BRAIN VALIDATOR - THE CHEAT CODE")
        print("="*60)
        print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"  Rounds: {rounds}")
        print("="*60)

        # Pre-flight checks
        print("\n[1] PRE-FLIGHT CHECKS")
        print("-"*40)

        atom_count = self.check_cyclotron()
        print(f"  Cyclotron: {atom_count:,} atoms {'✓' if self.cyclotron_connected else '✗'}")

        api_ok = self.check_api()
        print(f"  API (6666): {'ONLINE ✓' if api_ok else 'OFFLINE ✗'}")

        if not api_ok and auto_fix:
            api_ok = self.start_api()
            print(f"  API (retry): {'ONLINE ✓' if api_ok else 'STILL OFFLINE ✗'}")

        discord_ok = self.check_discord_config()
        print(f"  Discord cfg: {'CONFIGURED ✓' if discord_ok else 'NOT FOUND ✗'}")

        if not api_ok:
            print("\n[ERROR] API not running. Use 'fix' mode or start manually:")
            print("  cd 100X_DEPLOYMENT && python ARAYA_UNIFIED_API.py")
            return False

        # Run test rounds
        print("\n[2] BRAIN CONNECTION TESTS")
        print("-"*40)

        all_results = []
        questions_per_round = min(4, len(TEST_QUESTIONS))  # 4 random questions per round

        import random
        for i in range(1, rounds + 1):
            # Shuffle and pick questions for variety
            round_questions = random.sample(TEST_QUESTIONS, questions_per_round)
            results = self.run_test_round(i, round_questions)
            all_results.extend(results)

            # Small delay between rounds
            if i < rounds:
                time.sleep(1)

        # Calculate final score
        score = self.calculate_score(all_results)

        # Final report
        print("\n" + "="*60)
        print("  FINAL REPORT")
        print("="*60)
        print(f"  Total Tests:    {score['total']}")
        print(f"  Passed:         {score['passed']} ({score['pass_rate']:.1f}%)")
        print(f"  Brain Used:     {score['brain_used']} ({score['brain_rate']:.1f}%)")
        print("-"*40)

        # Determine overall status
        if score['pass_rate'] >= 80 and score['brain_rate'] >= 90:
            status = "BRAIN CONNECTED ✓✓✓"
            emoji = "🧠"
        elif score['pass_rate'] >= 50:
            status = "PARTIAL CONNECTION ⚠"
            emoji = "⚡"
        else:
            status = "BRAIN DISCONNECTED ✗"
            emoji = "💀"

        print(f"\n  {emoji} STATUS: {status}")
        print(f"  {emoji} Cyclotron: {atom_count:,} atoms")
        print(f"  {emoji} Discord: {'Uses same API ✓' if discord_ok else 'Check config'}")
        print("\n" + "="*60)

        # Save results
        self.save_results(score, all_results)

        return score['pass_rate'] >= 80

    def save_results(self, score, results):
        """Save validation results to file"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "score": score,
            "cyclotron_atoms": self.check_cyclotron(),
            "api_online": self.api_working,
            "discord_configured": self.discord_configured,
            "results": results
        }

        report_file = os.path.join(os.path.dirname(__file__), "BRAIN_VALIDATION_REPORT.json")
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"  Report saved: BRAIN_VALIDATION_REPORT.json")


def main():
    validator = BrainValidator()

    # Parse args
    mode = sys.argv[1].lower() if len(sys.argv) > 1 else "full"

    if mode == "quick":
        validator.run_validation(rounds=3, auto_fix=False)
    elif mode == "fix":
        validator.run_validation(rounds=5, auto_fix=True)
    else:
        validator.run_validation(rounds=10, auto_fix=False)


if __name__ == "__main__":
    main()
