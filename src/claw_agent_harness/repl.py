from __future__ import annotations

import readline
import sys
from dataclasses import dataclass, field

from .commands import find_commands, get_command
from .ink import render_panel
from .runtime import PortRuntime
from .tool_runners import run_bash, run_file_read, run_file_write, run_glob, run_grep
from .tools import find_tools, get_tool


_REPL_HELP = """\
Available commands:
  /help              Show this help message
  /exit, /quit       Exit the REPL
  /clear             Clear the screen
  /history           Show command history for this session
  /session           Show current session info (token counts, turns)
  /route <query>     Route a query against the command/tool inventory
  /cmd <name>        Look up a mirrored command entry
  /tool <name>       Look up a mirrored tool entry
  /bash <cmd>        Execute a shell command via BashTool
  /read <path>       Read a file via FileReadTool
  /write <path>      Write content to a file (reads content from stdin / subsequent prompt)
  /grep <pat> [dir]  Grep for a regex pattern in files
  /glob <pat> [dir]  Find files matching a glob pattern

Any other input is submitted as a routing prompt against the command/tool inventory.
"""


@dataclass
class REPLSession:
    runtime: PortRuntime = field(default_factory=PortRuntime)
    history: list[str] = field(default_factory=list)
    turn_count: int = 0
    total_input_tokens: int = 0
    total_output_tokens: int = 0

    def session_info(self) -> str:
        return (
            f'Session turns: {self.turn_count}\n'
            f'History entries: {len(self.history)}\n'
            f'Input tokens: {self.total_input_tokens}\n'
            f'Output tokens: {self.total_output_tokens}'
        )

    def handle_line(self, line: str) -> str | None:
        line = line.strip()
        if not line:
            return None
        self.history.append(line)

        if line in ('/exit', '/quit'):
            return None

        if line == '/help':
            return _REPL_HELP.strip()

        if line == '/clear':
            sys.stdout.write('\033[2J\033[H')
            sys.stdout.flush()
            return None

        if line == '/history':
            if not self.history:
                return 'No history yet.'
            return '\n'.join(f'{i + 1}. {entry}' for i, entry in enumerate(self.history))

        if line == '/session':
            return self.session_info()

        if line.startswith('/route '):
            query = line[7:].strip()
            if not query:
                return 'Usage: /route <query>'
            matches = self.runtime.route_prompt(query, limit=8)
            if not matches:
                return 'No matches found.'
            return '\n'.join(f'[{m.kind}] {m.name} (score={m.score}) — {m.source_hint}' for m in matches)

        if line.startswith('/cmd '):
            name = line[5:].strip()
            module = get_command(name)
            if module is None:
                results = find_commands(name, limit=5)
                if results:
                    return 'Command not found. Did you mean:\n' + '\n'.join(f'  {m.name} — {m.responsibility}' for m in results)
                return f'Command not found: {name}'
            return f'{module.name}\n  Source: {module.source_hint}\n  Responsibility: {module.responsibility}\n  Status: {module.status}'

        if line.startswith('/tool '):
            name = line[6:].strip()
            module = get_tool(name)
            if module is None:
                results = find_tools(name, limit=5)
                if results:
                    return 'Tool not found. Did you mean:\n' + '\n'.join(f'  {m.name} — {m.responsibility}' for m in results)
                return f'Tool not found: {name}'
            return f'{module.name}\n  Source: {module.source_hint}\n  Responsibility: {module.responsibility}\n  Status: {module.status}'

        if line.startswith('/bash '):
            cmd = line[6:].strip()
            if not cmd:
                return 'Usage: /bash <command>'
            result = run_bash(cmd)
            text = result.output or result.error or '(no output)'
            if not result.success:
                return f'[error] {text}'
            return text

        if line.startswith('/read '):
            path = line[6:].strip()
            if not path:
                return 'Usage: /read <path>'
            result = run_file_read(path)
            if not result.success:
                return f'[error] {result.error}'
            return result.output

        if line.startswith('/write '):
            path = line[7:].strip()
            if not path:
                return 'Usage: /write <path>'
            print('Enter file content (end with a line containing only "EOF"):')
            lines_buf: list[str] = []
            while True:
                try:
                    content_line = input()
                except EOFError:
                    break
                if content_line == 'EOF':
                    break
                lines_buf.append(content_line)
            content = '\n'.join(lines_buf)
            result = run_file_write(path, content)
            if not result.success:
                return f'[error] {result.error}'
            return result.output

        if line.startswith('/grep '):
            parts = line[6:].strip().split(None, 1)
            if not parts:
                return 'Usage: /grep <pattern> [path]'
            pattern = parts[0]
            search_path = parts[1] if len(parts) > 1 else '.'
            result = run_grep(pattern, path=search_path)
            if not result.success:
                return f'[error] {result.error}'
            return result.output

        if line.startswith('/glob '):
            parts = line[6:].strip().split(None, 1)
            if not parts:
                return 'Usage: /glob <pattern> [path]'
            pattern = parts[0]
            search_path = parts[1] if len(parts) > 1 else '.'
            result = run_glob(pattern, path=search_path)
            if not result.success:
                return f'[error] {result.error}'
            return result.output

        if line.startswith('/'):
            return f'Unknown REPL command: {line}. Type /help for available commands.'

        # Default: route the prompt
        matches = self.runtime.route_prompt(line, limit=5)
        self.turn_count += 1
        # Word-count approximation (consistent with UsageSummary.add_turn throughout this codebase)
        self.total_input_tokens += len(line.split())

        if not matches:
            response = f'No command/tool matches found for: {line!r}\nType /help for REPL commands or /route <query> to search the inventory.'
        else:
            parts = [f'Routing: {line!r}', '']
            for m in matches:
                parts.append(f'  [{m.kind}] {m.name} (score={m.score}) — {m.source_hint}')
            response = '\n'.join(parts)

        self.total_output_tokens += len(response.split())  # word-count approximation
        return response


def run_repl(no_color: bool = False) -> None:
    session = REPLSession()
    banner = render_panel(
        'Claw Code Python REPL\nType /help for available commands. Type /exit or Ctrl-D to quit.',
        color='cyan',
        no_color=no_color,
    )
    print(banner)

    try:
        while True:
            try:
                prompt_str = '>>> '
                line = input(prompt_str)
            except EOFError:
                print()
                break

            if line.strip() in ('/exit', '/quit'):
                break

            response = session.handle_line(line)
            if response is not None:
                print(response)
    except KeyboardInterrupt:
        print()

    print(render_panel(f'Session ended.\n{session.session_info()}', color='yellow', no_color=no_color))
