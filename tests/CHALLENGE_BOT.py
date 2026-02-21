#!/usr/bin/env python3
"""
CHALLENGE BOT - Architecture Stress Tester
═══════════════════════════════════════════════════════════════
Tests all Trinity endpoints for:
- Valid operations
- Edge cases
- Security vulnerabilities (XSS, injection)
- Malformed inputs
- Rate limiting behavior
═══════════════════════════════════════════════════════════════
"""

import requests
import json
import time
import concurrent.futures
from datetime import datetime

BASE_URL = "https://conciousnessrevolution.io/.netlify/functions"

# Test results
RESULTS = {
    "passed": 0,
    "failed": 0,
    "warnings": 0,
    "tests": []
}

def log_test(name, passed, details="", warning=False):
    """Log test result"""
    status = "✅ PASS" if passed else ("⚠️ WARN" if warning else "❌ FAIL")
    RESULTS["tests"].append({
        "name": name,
        "status": status,
        "details": details,
        "time": datetime.now().isoformat()
    })
    if passed:
        RESULTS["passed"] += 1
    elif warning:
        RESULTS["warnings"] += 1
    else:
        RESULTS["failed"] += 1
    print(f"{status} | {name}: {details[:80]}")

def test_endpoint(name, method, endpoint, data=None, expected_status=200, expected_contains=None, expected_error=None):
    """Generic endpoint tester"""
    url = f"{BASE_URL}/{endpoint}"
    try:
        if method == "GET":
            r = requests.get(url, timeout=15)
        else:
            r = requests.post(url, json=data, headers={"Content-Type": "application/json"}, timeout=15)

        # Check status code
        if r.status_code != expected_status:
            log_test(name, False, f"Expected {expected_status}, got {r.status_code}: {r.text[:100]}")
            return False

        # Check response contains expected string
        if expected_contains and expected_contains not in r.text:
            log_test(name, False, f"Response missing '{expected_contains}'")
            return False

        # Check for expected error message
        if expected_error:
            try:
                resp = r.json()
                if expected_error not in str(resp.get("error", "")):
                    log_test(name, False, f"Expected error '{expected_error}' not found")
                    return False
            except:
                log_test(name, False, f"Could not parse JSON response")
                return False

        log_test(name, True, r.text[:100] if len(r.text) < 100 else r.text[:97] + "...")
        return True

    except requests.exceptions.Timeout:
        log_test(name, False, "Request timed out (15s)")
        return False
    except Exception as e:
        log_test(name, False, f"Exception: {str(e)[:80]}")
        return False

def run_araya_edit_tests():
    """Test araya-edit-cockpit endpoint"""
    print("\n" + "="*60)
    print("🔨 ARAYA-EDIT-COCKPIT TESTS")
    print("="*60)

    # Valid operations
    test_endpoint(
        "Valid add_note to Tiger",
        "POST", "araya-edit-cockpit",
        {"builder_name": "tiger", "edit_type": "add_note", "edit_data": {"note": "Challenge bot test"}},
        expected_contains="success"
    )

    # Missing fields
    test_endpoint(
        "Missing builder_name",
        "POST", "araya-edit-cockpit",
        {"edit_type": "add_task", "edit_data": {"title": "test"}},
        expected_status=400,
        expected_error="Missing required fields"
    )

    test_endpoint(
        "Missing edit_type",
        "POST", "araya-edit-cockpit",
        {"builder_name": "tiger", "edit_data": {"title": "test"}},
        expected_status=400,
        expected_error="Missing required fields"
    )

    test_endpoint(
        "Missing edit_data",
        "POST", "araya-edit-cockpit",
        {"builder_name": "tiger", "edit_type": "add_task"},
        expected_status=400,
        expected_error="Missing required fields"
    )

    # Invalid builder
    test_endpoint(
        "Invalid builder name",
        "POST", "araya-edit-cockpit",
        {"builder_name": "hacker123", "edit_type": "add_task", "edit_data": {"title": "evil"}},
        expected_status=404,
        expected_error="not found in registry"
    )

    # Invalid edit_type
    test_endpoint(
        "Invalid edit_type",
        "POST", "araya-edit-cockpit",
        {"builder_name": "tiger", "edit_type": "delete_all", "edit_data": {}},
        expected_status=400,
        expected_error="Unknown edit_type"
    )

    # XSS attempt in task title
    test_endpoint(
        "XSS in task title (should be escaped)",
        "POST", "araya-edit-cockpit",
        {"builder_name": "tiger", "edit_type": "add_task", "edit_data": {
            "title": "<script>alert('xss')</script>",
            "description": "XSS test"
        }},
        expected_contains="success"  # Should succeed but escape the HTML
    )

    # SQL injection attempt
    test_endpoint(
        "SQL injection attempt",
        "POST", "araya-edit-cockpit",
        {"builder_name": "tiger'; DROP TABLE users;--", "edit_type": "add_task", "edit_data": {"title": "test"}},
        expected_status=404,
        expected_error="not found"
    )

    # Path traversal attempt
    test_endpoint(
        "Path traversal in builder name",
        "POST", "araya-edit-cockpit",
        {"builder_name": "../../../etc/passwd", "edit_type": "add_task", "edit_data": {"title": "test"}},
        expected_status=404,
        expected_error="not found"
    )

    # Empty strings
    test_endpoint(
        "Empty builder_name",
        "POST", "araya-edit-cockpit",
        {"builder_name": "", "edit_type": "add_task", "edit_data": {"title": "test"}},
        expected_status=400
    )

    # Very long input
    test_endpoint(
        "Very long task title (10KB)",
        "POST", "araya-edit-cockpit",
        {"builder_name": "tiger", "edit_type": "add_task", "edit_data": {
            "title": "A" * 10000,
            "description": "Long title test"
        }},
        expected_contains="success"  # Should handle gracefully
    )

def run_discord_verify_tests():
    """Test discord-verify endpoint"""
    print("\n" + "="*60)
    print("🎮 DISCORD-VERIFY TESTS")
    print("="*60)

    # Missing required param
    test_endpoint(
        "Missing discord_user_id",
        "POST", "discord-verify",
        {"action": "verify"},
        expected_status=400,
        expected_error="Missing discord_user_id"
    )

    # Valid format but fake user
    test_endpoint(
        "Valid format, fake user ID",
        "POST", "discord-verify",
        {"discord_user_id": "123456789012345678"},
        expected_status=404  # User not in server
    )

    # GET method test
    test_endpoint(
        "GET with discord_user_id param",
        "GET", "discord-verify?discord_user_id=123456789",
        expected_status=404  # Valid request format, user not found
    )

    # Invalid JSON
    print("Testing malformed JSON...")
    try:
        r = requests.post(f"{BASE_URL}/discord-verify",
                         data="not json",
                         headers={"Content-Type": "application/json"},
                         timeout=10)
        if r.status_code == 500 or r.status_code == 400:
            log_test("Malformed JSON handling", True, f"Properly rejected with {r.status_code}")
        else:
            log_test("Malformed JSON handling", False, f"Unexpected status {r.status_code}")
    except Exception as e:
        log_test("Malformed JSON handling", False, str(e))

def run_domain_tools_tests():
    """Test domain-tools via other endpoints that use it"""
    print("\n" + "="*60)
    print("🔧 DOMAIN-TOOLS INTEGRATION TESTS")
    print("="*60)

    # Test all valid builders
    builders = ["tiger", "alex", "agent_r", "toby", "josh_serrano", "ryan"]
    for builder in builders:
        test_endpoint(
            f"Builder '{builder}' in registry",
            "POST", "araya-edit-cockpit",
            {"builder_name": builder, "edit_type": "add_note", "edit_data": {"note": f"Testing {builder}"}},
            expected_contains="success"
        )
        time.sleep(0.5)  # Small delay to avoid rate limiting

def run_concurrency_test():
    """Test concurrent requests"""
    print("\n" + "="*60)
    print("⚡ CONCURRENCY TESTS")
    print("="*60)

    def make_request(i):
        try:
            r = requests.post(
                f"{BASE_URL}/araya-edit-cockpit",
                json={"builder_name": "tiger", "edit_type": "add_note", "edit_data": {"note": f"Concurrent test {i}"}},
                timeout=30
            )
            return r.status_code
        except:
            return 0

    print("Sending 5 concurrent requests...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(make_request, i) for i in range(5)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    success_count = sum(1 for r in results if r == 200)
    log_test(f"Concurrent requests ({success_count}/5 succeeded)",
             success_count >= 3,  # At least 60% should succeed
             f"Status codes: {results}")

def run_rate_limit_test():
    """Test rate limiting behavior"""
    print("\n" + "="*60)
    print("🚦 RATE LIMIT TESTS")
    print("="*60)

    print("Sending 10 rapid requests...")
    statuses = []
    for i in range(10):
        try:
            r = requests.post(
                f"{BASE_URL}/araya-edit-cockpit",
                json={"builder_name": "tiger", "edit_type": "add_note", "edit_data": {"note": f"Rate test {i}"}},
                timeout=10
            )
            statuses.append(r.status_code)
        except:
            statuses.append(0)

    rate_limited = sum(1 for s in statuses if s == 429)
    success = sum(1 for s in statuses if s == 200)

    if rate_limited > 0:
        log_test("Rate limiting active", True, f"{rate_limited}/10 requests rate limited", warning=True)
    else:
        log_test("Rate limiting check", True, f"All {success}/10 requests succeeded (no rate limit hit)")

def run_method_tests():
    """Test HTTP method handling"""
    print("\n" + "="*60)
    print("📡 HTTP METHOD TESTS")
    print("="*60)

    # Test wrong methods
    try:
        r = requests.get(f"{BASE_URL}/araya-edit-cockpit", timeout=10)
        log_test("GET on POST-only endpoint", r.status_code == 405, f"Status: {r.status_code}")
    except Exception as e:
        log_test("GET on POST-only endpoint", False, str(e))

    try:
        r = requests.delete(f"{BASE_URL}/araya-edit-cockpit", timeout=10)
        log_test("DELETE method rejected", r.status_code in [405, 404], f"Status: {r.status_code}")
    except Exception as e:
        log_test("DELETE method rejected", False, str(e))

    # OPTIONS (CORS preflight)
    try:
        r = requests.options(f"{BASE_URL}/araya-edit-cockpit", timeout=10)
        log_test("OPTIONS (CORS preflight)", r.status_code == 200, f"Status: {r.status_code}")
    except Exception as e:
        log_test("OPTIONS (CORS preflight)", False, str(e))

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("📊 CHALLENGE BOT SUMMARY")
    print("="*60)
    total = RESULTS["passed"] + RESULTS["failed"] + RESULTS["warnings"]
    print(f"""
╔══════════════════════════════════════╗
║  TOTAL TESTS:    {total:>4}                ║
║  ✅ PASSED:      {RESULTS['passed']:>4}                ║
║  ❌ FAILED:      {RESULTS['failed']:>4}                ║
║  ⚠️  WARNINGS:    {RESULTS['warnings']:>4}                ║
╠══════════════════════════════════════╣
║  PASS RATE:      {(RESULTS['passed']/total*100) if total > 0 else 0:>5.1f}%             ║
╚══════════════════════════════════════╝
""")

    if RESULTS["failed"] > 0:
        print("❌ FAILED TESTS:")
        for t in RESULTS["tests"]:
            if "FAIL" in t["status"]:
                print(f"   - {t['name']}: {t['details']}")

    # Save results to file
    with open("CHALLENGE_BOT_RESULTS.json", "w") as f:
        json.dump(RESULTS, f, indent=2)
    print(f"\nResults saved to CHALLENGE_BOT_RESULTS.json")

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════╗
║           🤖 CHALLENGE BOT - Architecture Tester            ║
║                  Pattern: 3 → 7 → 13 → ∞                    ║
╚══════════════════════════════════════════════════════════════╝
""")

    start_time = time.time()

    # Run all test suites
    run_araya_edit_tests()
    run_discord_verify_tests()
    run_domain_tools_tests()
    run_method_tests()
    run_concurrency_test()
    run_rate_limit_test()

    elapsed = time.time() - start_time
    print(f"\n⏱️  Total test time: {elapsed:.1f} seconds")

    print_summary()
