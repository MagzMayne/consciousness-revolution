from __future__ import annotations

import fnmatch
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ToolRunResult:
    tool_name: str
    success: bool
    output: str
    error: str = ''


class BashToolRunner:
    DEFAULT_TIMEOUT = 30
    MAX_OUTPUT_BYTES = 65_536

    def run(self, command: str, timeout: int = DEFAULT_TIMEOUT, cwd: str | None = None) -> ToolRunResult:
        if not command or not command.strip():
            return ToolRunResult(tool_name='BashTool', success=False, output='', error='Empty command')
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                timeout=timeout,
                cwd=cwd,
                text=True,
                errors='replace',
            )
            stdout = result.stdout[: self.MAX_OUTPUT_BYTES]
            stderr = result.stderr[: self.MAX_OUTPUT_BYTES]
            combined = stdout
            if stderr:
                combined = f'{stdout}\n[stderr]\n{stderr}'.strip()
            return ToolRunResult(
                tool_name='BashTool',
                success=result.returncode == 0,
                output=combined,
                error='' if result.returncode == 0 else f'exit code {result.returncode}',
            )
        except subprocess.TimeoutExpired:
            return ToolRunResult(tool_name='BashTool', success=False, output='', error=f'Command timed out after {timeout}s')
        except Exception as exc:  # noqa: BLE001
            return ToolRunResult(tool_name='BashTool', success=False, output='', error=str(exc))


class FileReadToolRunner:
    MAX_FILE_BYTES = 1_048_576  # 1 MB

    def run(self, path: str, start_line: int | None = None, end_line: int | None = None) -> ToolRunResult:
        try:
            file_path = Path(path)
            if not file_path.exists():
                return ToolRunResult(tool_name='FileReadTool', success=False, output='', error=f'File not found: {path}')
            if not file_path.is_file():
                return ToolRunResult(tool_name='FileReadTool', success=False, output='', error=f'Not a file: {path}')
            size = file_path.stat().st_size
            if size > self.MAX_FILE_BYTES:
                return ToolRunResult(
                    tool_name='FileReadTool',
                    success=False,
                    output='',
                    error=f'File too large ({size} bytes). Max {self.MAX_FILE_BYTES} bytes.',
                )
            content = file_path.read_text(errors='replace')
            if start_line is not None or end_line is not None:
                lines = content.splitlines(keepends=True)
                s = (start_line - 1) if start_line and start_line > 0 else 0
                e = end_line if end_line else len(lines)
                content = ''.join(lines[s:e])
            return ToolRunResult(tool_name='FileReadTool', success=True, output=content)
        except Exception as exc:  # noqa: BLE001
            return ToolRunResult(tool_name='FileReadTool', success=False, output='', error=str(exc))


class FileWriteToolRunner:
    def run(self, path: str, content: str) -> ToolRunResult:
        try:
            file_path = Path(path)
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(content)
            return ToolRunResult(tool_name='FileWriteTool', success=True, output=f'Written {len(content)} chars to {path}')
        except Exception as exc:  # noqa: BLE001
            return ToolRunResult(tool_name='FileWriteTool', success=False, output='', error=str(exc))


class FileEditToolRunner:
    def run(self, path: str, old_string: str, new_string: str) -> ToolRunResult:
        try:
            file_path = Path(path)
            if not file_path.exists():
                return ToolRunResult(tool_name='FileEditTool', success=False, output='', error=f'File not found: {path}')
            content = file_path.read_text(errors='replace')
            if old_string not in content:
                return ToolRunResult(
                    tool_name='FileEditTool',
                    success=False,
                    output='',
                    error=f'Search string not found in {path}',
                )
            count = content.count(old_string)
            if count > 1:
                return ToolRunResult(
                    tool_name='FileEditTool',
                    success=False,
                    output='',
                    error=f'Search string appears {count} times; must be unique for a safe edit',
                )
            new_content = content.replace(old_string, new_string, 1)
            file_path.write_text(new_content)
            return ToolRunResult(tool_name='FileEditTool', success=True, output=f'Edited {path}: replaced 1 occurrence')
        except Exception as exc:  # noqa: BLE001
            return ToolRunResult(tool_name='FileEditTool', success=False, output='', error=str(exc))


class GrepToolRunner:
    MAX_RESULTS = 200

    def run(
        self,
        pattern: str,
        path: str = '.',
        recursive: bool = True,
        ignore_case: bool = False,
        include_glob: str | None = None,
        context_lines: int = 0,
    ) -> ToolRunResult:
        try:
            flags = re.IGNORECASE if ignore_case else 0
            compiled = re.compile(pattern, flags)
        except re.error as exc:
            return ToolRunResult(tool_name='GrepTool', success=False, output='', error=f'Invalid regex: {exc}')

        search_path = Path(path)
        if not search_path.exists():
            return ToolRunResult(tool_name='GrepTool', success=False, output='', error=f'Path not found: {path}')

        try:
            results: list[str] = []
            files = self._iter_files(search_path, recursive, include_glob)
            for file_path in files:
                try:
                    lines = file_path.read_text(errors='replace').splitlines()
                except OSError:
                    continue
                for idx, line in enumerate(lines, start=1):
                    if compiled.search(line):
                        before = lines[max(0, idx - 1 - context_lines): idx - 1]
                        after = lines[idx: idx + context_lines]
                        for offset, b in enumerate(before):
                            b_lineno = idx - len(before) + offset
                            results.append(f'{file_path}:{b_lineno}: {b}')
                        results.append(f'{file_path}:{idx}: {line}')
                        for offset, a in enumerate(after):
                            results.append(f'{file_path}:{idx + 1 + offset}: {a}')
                        if len(results) >= self.MAX_RESULTS:
                            results.append(f'... (truncated at {self.MAX_RESULTS} results)')
                            return ToolRunResult(tool_name='GrepTool', success=True, output='\n'.join(results))
            if not results:
                return ToolRunResult(tool_name='GrepTool', success=True, output='No matches found.')
            return ToolRunResult(tool_name='GrepTool', success=True, output='\n'.join(results))
        except Exception as exc:  # noqa: BLE001
            return ToolRunResult(tool_name='GrepTool', success=False, output='', error=str(exc))

    def _iter_files(self, root: Path, recursive: bool, include_glob: str | None):
        if root.is_file():
            yield root
            return
        if recursive:
            for item in root.rglob('*'):
                if item.is_file() and not self._is_hidden(item):
                    if include_glob is None or fnmatch.fnmatch(item.name, include_glob):
                        yield item
        else:
            for item in root.iterdir():
                if item.is_file() and not self._is_hidden(item):
                    if include_glob is None or fnmatch.fnmatch(item.name, include_glob):
                        yield item

    @staticmethod
    def _is_hidden(path: Path) -> bool:
        return any(part.startswith('.') for part in path.parts)


class GlobToolRunner:
    MAX_RESULTS = 500

    def run(self, pattern: str, path: str = '.', recursive: bool = True) -> ToolRunResult:
        try:
            search_path = Path(path)
            if not search_path.exists():
                return ToolRunResult(tool_name='GlobTool', success=False, output='', error=f'Path not found: {path}')
            if recursive and '**' not in pattern:
                pattern = f'**/{pattern}'
            matches = sorted(str(p) for p in search_path.glob(pattern) if p.is_file())
            if not matches:
                return ToolRunResult(tool_name='GlobTool', success=True, output='No matching files found.')
            if len(matches) > self.MAX_RESULTS:
                matches = matches[: self.MAX_RESULTS]
                matches.append(f'... (truncated at {self.MAX_RESULTS} results)')
            return ToolRunResult(tool_name='GlobTool', success=True, output='\n'.join(matches))
        except Exception as exc:  # noqa: BLE001
            return ToolRunResult(tool_name='GlobTool', success=False, output='', error=str(exc))


_bash = BashToolRunner()
_file_read = FileReadToolRunner()
_file_write = FileWriteToolRunner()
_file_edit = FileEditToolRunner()
_grep = GrepToolRunner()
_glob = GlobToolRunner()


def run_bash(command: str, timeout: int = BashToolRunner.DEFAULT_TIMEOUT, cwd: str | None = None) -> ToolRunResult:
    return _bash.run(command, timeout=timeout, cwd=cwd)


def run_file_read(path: str, start_line: int | None = None, end_line: int | None = None) -> ToolRunResult:
    return _file_read.run(path, start_line=start_line, end_line=end_line)


def run_file_write(path: str, content: str) -> ToolRunResult:
    return _file_write.run(path, content)


def run_file_edit(path: str, old_string: str, new_string: str) -> ToolRunResult:
    return _file_edit.run(path, old_string, new_string)


def run_grep(
    pattern: str,
    path: str = '.',
    recursive: bool = True,
    ignore_case: bool = False,
    include_glob: str | None = None,
    context_lines: int = 0,
) -> ToolRunResult:
    return _grep.run(pattern, path=path, recursive=recursive, ignore_case=ignore_case, include_glob=include_glob, context_lines=context_lines)


def run_glob(pattern: str, path: str = '.', recursive: bool = True) -> ToolRunResult:
    return _glob.run(pattern, path=path, recursive=recursive)
