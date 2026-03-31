from __future__ import annotations

import os
import sys

_ANSI_COLORS = {
    'reset': '\033[0m',
    'bold': '\033[1m',
    'dim': '\033[2m',
    'red': '\033[31m',
    'green': '\033[32m',
    'yellow': '\033[33m',
    'blue': '\033[34m',
    'magenta': '\033[35m',
    'cyan': '\033[36m',
    'white': '\033[37m',
    'bright_red': '\033[91m',
    'bright_green': '\033[92m',
    'bright_yellow': '\033[93m',
    'bright_blue': '\033[94m',
    'bright_magenta': '\033[95m',
    'bright_cyan': '\033[96m',
}


def _supports_color() -> bool:
    if not hasattr(sys.stdout, 'isatty') or not sys.stdout.isatty():
        return False
    if os.environ.get('NO_COLOR') or os.environ.get('TERM') == 'dumb':
        return False
    return True


def colorize(text: str, color: str, no_color: bool = False) -> str:
    if no_color or not _supports_color():
        return text
    code = _ANSI_COLORS.get(color.lower(), '')
    reset = _ANSI_COLORS['reset']
    return f'{code}{text}{reset}' if code else text


def render_markdown_panel(text: str) -> str:
    border = '=' * 40
    return f"{border}\n{text}\n{border}"


def render_panel(text: str, color: str = '', no_color: bool = False) -> str:
    border = '─' * 44
    if color and not no_color and _supports_color():
        code = _ANSI_COLORS.get(color.lower(), '')
        reset = _ANSI_COLORS['reset']
        border = f'{code}{border}{reset}'
    return f"{border}\n{text}\n{border}"


def render_table(headers: list[str], rows: list[list[str]], no_color: bool = False) -> str:
    all_rows = [headers] + rows
    col_widths = [max(len(str(r[i])) for r in all_rows if i < len(r)) for i in range(len(headers))]
    sep = '+-' + '-+-'.join('-' * w for w in col_widths) + '-+'

    def fmt_row(row: list[str]) -> str:
        cells = (str(row[i]).ljust(col_widths[i]) if i < len(row) else ' ' * col_widths[i] for i in range(len(headers)))
        return '| ' + ' | '.join(cells) + ' |'

    lines = [sep, fmt_row(headers), sep]
    for row in rows:
        lines.append(fmt_row(row))
    lines.append(sep)
    return '\n'.join(lines)


def dim(text: str, no_color: bool = False) -> str:
    return colorize(text, 'dim', no_color=no_color)


def bold(text: str, no_color: bool = False) -> str:
    if no_color or not _supports_color():
        return text
    return f'\033[1m{text}\033[0m'
