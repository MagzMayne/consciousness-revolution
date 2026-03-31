from __future__ import annotations


def build_repl_banner() -> str:
    return 'Claw Code Python REPL — type /help for commands, /exit to quit.'


def launch_repl(no_color: bool = False) -> None:
    from .repl import run_repl
    run_repl(no_color=no_color)
