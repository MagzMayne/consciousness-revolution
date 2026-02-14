---
applyTo: "**/*{test,TEST}*.py"
---

## Test Suite Guidelines

Testing is critical for maintaining the reliability and stability of the Consciousness Revolution platform. All test files should follow these standards.

### Test File Naming

- **Test suites**: `*_TEST_SUITE.py` or `*_test_suite.py`
- **Unit tests**: `test_*.py` or `*_test.py`
- **Integration tests**: `*_integration_test.py`
- **Functionality tests**: `FUNCTIONALITY_TEST_SUITE.py`

### Test Structure

Use Python's `unittest` framework as the base:

```python
import unittest
import json
from typing import Dict, Any

class PatternDetectorTests(unittest.TestCase):
    """Test suite for pattern detection functionality."""
    
    def setUp(self):
        """Set up test fixtures before each test."""
        self.test_data = self.load_test_data()
        
    def tearDown(self):
        """Clean up after each test."""
        pass
    
    def test_basic_pattern_detection(self):
        """Test that basic patterns are detected correctly."""
        result = detect_pattern("test input")
        self.assertIsNotNone(result)
        self.assertIn('score', result)
        
    def test_edge_case_empty_input(self):
        """Test handling of empty input."""
        result = detect_pattern("")
        self.assertEqual(result['error'], 'Empty input')

if __name__ == '__main__':
    unittest.main()
```

### Test Organization

1. **Group related tests** in test classes
2. **One test file per module** being tested
3. **Descriptive test names** that explain what is being tested
4. **Arrange-Act-Assert** pattern in each test:
   ```python
   def test_user_registration(self):
       # Arrange
       user_data = {'email': 'test@example.com', 'name': 'Test User'}
       
       # Act
       result = register_user(user_data)
       
       # Assert
       self.assertTrue(result['success'])
       self.assertEqual(result['user']['email'], user_data['email'])
   ```

### Comprehensive Test Coverage

Test suites should cover:

1. **Happy path**: Normal, expected usage
2. **Edge cases**: Boundary conditions, empty inputs, nulls
3. **Error cases**: Invalid inputs, network failures, exceptions
4. **Integration**: How components work together
5. **Performance**: Critical paths should meet performance requirements

### Test Data

1. **Use fixtures**: Store test data in separate files or methods
   ```python
   @classmethod
   def setUpClass(cls):
       """Load test data once for all tests."""
       with open('test_data.json', 'r') as f:
           cls.test_data = json.load(f)
   ```

2. **Isolate tests**: Each test should be independent
3. **Clean up**: Remove test artifacts in tearDown
4. **Mock external services**: Don't make real API calls
   ```python
   from unittest.mock import patch, MagicMock
   
   @patch('requests.get')
   def test_api_call(self, mock_get):
       mock_get.return_value = MagicMock(
           status_code=200,
           json=lambda: {'result': 'success'}
       )
       result = fetch_data()
       self.assertEqual(result['result'], 'success')
   ```

### Assertions

Use descriptive assertions with custom messages:

```python
# Good - descriptive message
self.assertEqual(
    result['score'], 
    8, 
    "Pattern score should be 8 for high-confidence matches"
)

# Better - use specific assertions
self.assertIn('indicators', result, "Result must include indicators")
self.assertGreater(result['score'], 0, "Score must be positive")
self.assertIsInstance(result['timestamp'], str, "Timestamp must be string")
```

### Test Results Reporting

Generate JSON reports for CI/CD integration:

```python
import json
from datetime import datetime

class TestResults:
    """Container for test results."""
    
    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'skipped': 0,
            'failures': [],
            'duration_seconds': 0
        }
    
    def save(self, filename: str = 'test_results.json'):
        """Save results to JSON file."""
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)

# Usage in main:
if __name__ == '__main__':
    results = TestResults()
    
    # Run tests
    suite = unittest.TestLoader().loadTestsFromModule(__name__)
    runner = unittest.TextTestRunner(verbosity=2)
    test_result = runner.run(suite)
    
    # Record results
    results.results['total_tests'] = test_result.testsRun
    results.results['passed'] = test_result.testsRun - len(test_result.failures)
    results.results['failed'] = len(test_result.failures)
    
    # Save report
    results.save()
```

### Testing Autonomous Agents

For AUL agent tests:

1. **Test agent registration**: Verify agents register correctly
2. **Test message passing**: Ensure messages are sent/received
3. **Test health checks**: Verify health monitoring works
4. **Test error recovery**: Simulate failures and verify recovery
5. **Test performance**: Message throughput and latency

```python
def test_agent_message_bus(self):
    """Test message bus communication."""
    # Setup
    bus = MessageBus()
    agent1 = TestAgent('agent1')
    agent2 = TestAgent('agent2')
    
    # Register agents
    bus.register(agent1)
    bus.register(agent2)
    
    # Send message
    message = {'type': 'test', 'data': 'hello'}
    bus.send('agent1', 'agent2', message)
    
    # Verify receipt
    received = agent2.get_last_message()
    self.assertEqual(received['data'], 'hello')
```

### HTML/Frontend Testing

For testing HTML tools:

1. **Manual testing checklist** in test file docstring
2. **Automated where possible** using headless browser
3. **Test critical paths**: Core functionality must work

```python
"""
Manual Testing Checklist for pattern-detector.html:
- [ ] Page loads without errors in Chrome, Firefox, Safari
- [ ] Input field accepts text
- [ ] Analyze button triggers analysis
- [ ] Results display correctly
- [ ] Responsive on mobile, tablet, desktop
- [ ] All buttons keyboard accessible
- [ ] Error messages appear for invalid input
"""
```

### Functionality Test Suite Pattern

Main test runner that validates entire system:

```python
class FunctionalityTestSuite:
    """Comprehensive functionality test suite."""
    
    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'tests': [],
            'summary': {}
        }
    
    def run_all_tests(self):
        """Run all functionality tests."""
        test_categories = [
            ('HTML Files', self.test_html_files),
            ('Python Scripts', self.test_python_scripts),
            ('Configuration', self.test_configuration),
            ('Dependencies', self.test_dependencies),
        ]
        
        for category, test_func in test_categories:
            print(f"\nTesting {category}...")
            test_func()
        
        self.generate_summary()
        self.save_results()
    
    def test_html_files(self):
        """Test all HTML files for validity."""
        html_files = glob.glob('**/*.html', recursive=True)
        for filepath in html_files:
            result = self.validate_html_file(filepath)
            self.results['tests'].append({
                'category': 'HTML',
                'file': filepath,
                'status': 'passed' if result else 'failed'
            })
    
    def generate_summary(self):
        """Generate test summary."""
        total = len(self.results['tests'])
        passed = sum(1 for t in self.results['tests'] if t['status'] == 'passed')
        failed = total - passed
        
        self.results['summary'] = {
            'total': total,
            'passed': passed,
            'failed': failed,
            'success_rate': f"{(passed/total*100):.1f}%" if total > 0 else "0%"
        }
```

### Performance Testing

Include performance benchmarks for critical operations:

```python
import time

def test_pattern_detection_performance(self):
    """Test that pattern detection completes within acceptable time."""
    text = "Large test input..." * 1000
    
    start_time = time.time()
    result = detect_pattern(text)
    duration = time.time() - start_time
    
    # Should complete in under 1 second
    self.assertLess(
        duration, 
        1.0, 
        f"Pattern detection took {duration:.2f}s, should be < 1s"
    )
```

### Error Simulation

Test error handling:

```python
def test_network_failure_handling(self):
    """Test graceful handling of network failures."""
    with patch('requests.get') as mock_get:
        mock_get.side_effect = requests.ConnectionError("Network error")
        
        result = fetch_remote_data()
        
        # Should return error, not raise exception
        self.assertIsNotNone(result)
        self.assertIn('error', result)
        self.assertEqual(result['error'], 'network_error')
```

### CI/CD Integration

Tests should work in GitHub Actions:

```python
import os

def is_ci_environment():
    """Check if running in CI."""
    return os.getenv('CI') == 'true'

class IntegrationTests(unittest.TestCase):
    """Integration tests that may require specific environment."""
    
    @unittest.skipIf(
        is_ci_environment(),
        "Skipping in CI - requires local environment"
    )
    def test_local_file_access(self):
        """Test that requires local file system."""
        pass
```

### Common Test Patterns

**Testing file processing:**
```python
def test_file_processing(self):
    """Test file processing with various inputs."""
    test_cases = [
        ('valid_input.txt', True, 'Should process valid file'),
        ('invalid_input.txt', False, 'Should reject invalid file'),
        ('empty_file.txt', False, 'Should handle empty file'),
    ]
    
    for filename, should_pass, description in test_cases:
        with self.subTest(filename=filename):
            result = process_file(filename)
            if should_pass:
                self.assertTrue(result['success'], description)
            else:
                self.assertFalse(result['success'], description)
```

**Testing async operations:**
```python
import asyncio

class AsyncTests(unittest.TestCase):
    """Tests for async operations."""
    
    def test_async_operation(self):
        """Test async function."""
        async def run_test():
            result = await async_function()
            self.assertIsNotNone(result)
        
        asyncio.run(run_test())
```

### Documentation in Tests

Each test file should include:

1. **Module docstring**: What is being tested
2. **Class docstring**: Purpose of test class
3. **Method docstrings**: What each test verifies
4. **Inline comments**: For complex test logic only

```python
"""
Test suite for pattern detection system.

Tests cover:
- Pattern identification
- Scoring accuracy
- Edge cases and error handling
- Performance requirements
"""

class PatternDetectionTests(unittest.TestCase):
    """Tests for core pattern detection functionality."""
    
    def test_love_bombing_detection(self):
        """Verify love bombing pattern is correctly identified."""
        # Test with known love bombing indicators
        text = "You're absolutely perfect and amazing..."
        result = detect_pattern(text)
        
        # Should identify as love bombing with high confidence
        self.assertEqual(result['pattern'], 'love_bombing')
        self.assertGreater(result['score'], 7)
```

### Best Practices

1. **Fast tests**: Keep unit tests under 100ms each
2. **Isolated tests**: No dependencies between tests
3. **Repeatable**: Same inputs always produce same outputs
4. **Meaningful names**: Test name describes what is tested
5. **One assertion per test**: When possible, focus each test
6. **Clean up resources**: Close files, connections in tearDown
7. **Use constants**: Define test constants at top of file
8. **Document complex scenarios**: Add comments for non-obvious tests
