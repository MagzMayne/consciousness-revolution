---
applyTo: "**/*.py"
---

## Python Script Guidelines

When creating or modifying Python scripts in this repository, follow these standards:

### File Naming

- **System/automation scripts**: `UPPERCASE_WITH_UNDERSCORES.py` (e.g., `PATTERN_DETECTOR.py`)
- **Module/library files**: `lowercase_with_underscores.py` (e.g., `aul_agent_base.py`)
- **Test files**: Include `TEST` or `test` in the name (e.g., `FUNCTIONALITY_TEST_SUITE.py`)

### Code Standards

1. **Python version**: Target Python 3.8+ for compatibility
2. **Type hints**: Use type annotations for all function parameters and return types
   ```python
   def process_data(input_str: str, threshold: int = 10) -> dict:
       """Process input data and return results."""
       pass
   ```

3. **Docstrings**: Use Google-style docstrings for all modules, classes, and functions
   ```python
   def analyze_pattern(text: str) -> dict:
       """Analyze text for consciousness patterns.
       
       Args:
           text: The input text to analyze
           
       Returns:
           Dictionary containing pattern analysis results
           
       Raises:
           ValueError: If text is empty or invalid
       """
       pass
   ```

4. **Error handling**: Use specific exception types with informative messages
   ```python
   try:
       result = process_data(input_data)
   except ValueError as e:
       logger.error(f"Invalid input data: {e}")
       raise
   except Exception as e:
       logger.error(f"Unexpected error: {e}")
       return default_value
   ```

5. **Logging**: Use Python's logging module instead of print statements for scripts
   ```python
   import logging
   
   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)
   
   logger.info("Processing started")
   logger.error("An error occurred")
   ```

### Script Structure

1. **Imports**: Group in this order with blank lines between:
   - Standard library imports
   - Third-party imports
   - Local application imports

2. **Constants**: Define at module level in UPPERCASE
   ```python
   MAX_RETRIES = 3
   DEFAULT_TIMEOUT = 30
   API_BASE_URL = "https://api.example.com"
   ```

3. **Main block**: Use `if __name__ == "__main__":` for executable scripts
   ```python
   def main():
       """Main entry point for the script."""
       # Implementation here
       pass
   
   if __name__ == "__main__":
       main()
   ```

### Autonomous Agent Scripts

For scripts that interact with the AUL (AI Universal Language) protocol:

1. **Inherit from base classes**: Use `aul_agent_base.py` as the foundation
2. **Register capabilities**: Clearly define what the agent can do
3. **Use message bus**: Communicate through `aul_message_bus.py`
4. **Include health checks**: Implement health monitoring endpoints
5. **Handle failures gracefully**: Use exponential backoff for retries

### Testing

1. **Unit tests**: Create corresponding test files with `test_` prefix or `_test` suffix
2. **Use assertions**: Prefer `assert` statements with descriptive messages
3. **Mock external dependencies**: Use `unittest.mock` for external services
4. **Test coverage**: Aim for at least 80% code coverage on critical paths

### Dependencies

1. **Add to requirements**: If adding new dependencies, update the appropriate requirements file
2. **Use virtual environments**: Scripts should work in isolated environments
3. **Version pinning**: Pin major versions in requirements.txt (e.g., `supabase>=2.0.0`)

### Performance

1. **Async operations**: Use `asyncio` for I/O-bound operations
2. **Resource cleanup**: Use context managers (`with` statements) for files and connections
3. **Memory efficiency**: Process large datasets in chunks/batches
4. **Caching**: Cache expensive computations when appropriate

### Security

1. **Environment variables**: Use `.env` files for secrets, never hardcode
2. **Input validation**: Always validate and sanitize user inputs
3. **SQL injection**: Use parameterized queries with database operations
4. **API keys**: Store in environment variables, never commit to repository

### Common Patterns

**Processing files:**
```python
def process_file(filepath: str) -> dict:
    """Process a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return analyze_content(content)
    except FileNotFoundError:
        logger.error(f"File not found: {filepath}")
        return {}
    except Exception as e:
        logger.error(f"Error processing {filepath}: {e}")
        return {}
```

**API calls with retries:**
```python
import time
from typing import Optional

def call_api_with_retry(url: str, max_retries: int = 3) -> Optional[dict]:
    """Call API with exponential backoff retry."""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            if attempt == max_retries - 1:
                logger.error(f"API call failed after {max_retries} attempts")
                return None
            wait_time = 2 ** attempt
            logger.warning(f"Retry {attempt + 1}/{max_retries} after {wait_time}s")
            time.sleep(wait_time)
    return None
```

**Configuration management:**
```python
import os
from dataclasses import dataclass

@dataclass
class Config:
    """Application configuration."""
    api_key: str = os.getenv('API_KEY', '')
    db_url: str = os.getenv('DATABASE_URL', '')
    debug: bool = os.getenv('DEBUG', 'false').lower() == 'true'
    
    def validate(self) -> bool:
        """Validate configuration."""
        return bool(self.api_key and self.db_url)
```

### Documentation

1. **README files**: Create a README.md for complex scripts explaining usage
2. **Inline comments**: Use sparingly, only for complex logic
3. **Examples**: Include usage examples in docstrings or README
4. **CLI help**: Use `argparse` with clear help messages for CLI scripts

### Specific Script Types

**Automation scripts** (e.g., `CYCLOTRON_*.py`):
- Should be idempotent (safe to run multiple times)
- Include progress indicators for long-running operations
- Support dry-run mode when applicable

**Agent scripts** (e.g., `*_AGENT.py`):
- Follow AUL protocol specifications
- Register with orchestrator on startup
- Implement graceful shutdown handlers

**Test scripts** (e.g., `*_TEST_SUITE.py`):
- Clear test names describing what is being tested
- Use setUp/tearDown for test fixtures
- Generate detailed test reports in JSON format
