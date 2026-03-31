from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


class EnhancedFeaturesTests(unittest.TestCase):
    # ---------------------------------------------------------------------------
    # Tool runners
    # ---------------------------------------------------------------------------

    def test_bash_tool_runner_executes_command(self) -> None:
        from src.claw_agent_harness.tool_runners import run_bash

        result = run_bash('echo hello')
        self.assertTrue(result.success)
        self.assertIn('hello', result.output)

    def test_bash_tool_runner_returns_error_on_failure(self) -> None:
        from src.claw_agent_harness.tool_runners import run_bash

        result = run_bash('exit 1')
        self.assertFalse(result.success)

    def test_bash_tool_runner_empty_command(self) -> None:
        from src.claw_agent_harness.tool_runners import run_bash

        result = run_bash('')
        self.assertFalse(result.success)
        self.assertIn('Empty', result.error)

    def test_file_read_tool_reads_existing_file(self) -> None:
        from src.claw_agent_harness.tool_runners import run_file_read

        result = run_file_read('src/claw_agent_harness/__init__.py')
        self.assertTrue(result.success)
        self.assertIn('PortRuntime', result.output)

    def test_file_read_tool_line_range(self) -> None:
        from src.claw_agent_harness.tool_runners import run_file_read

        result = run_file_read('src/claw_agent_harness/__init__.py', start_line=1, end_line=3)
        self.assertTrue(result.success)
        lines = result.output.splitlines()
        self.assertLessEqual(len(lines), 3)

    def test_file_read_tool_missing_file(self) -> None:
        from src.claw_agent_harness.tool_runners import run_file_read

        result = run_file_read('/nonexistent/path/file.py')
        self.assertFalse(result.success)
        self.assertIn('not found', result.error)

    def test_file_write_and_read_roundtrip(self) -> None:
        from src.claw_agent_harness.tool_runners import run_file_read, run_file_write

        with tempfile.TemporaryDirectory() as tmpdir:
            path = str(Path(tmpdir) / 'test.txt')
            write_result = run_file_write(path, 'hello world\n')
            self.assertTrue(write_result.success)
            read_result = run_file_read(path)
            self.assertTrue(read_result.success)
            self.assertIn('hello world', read_result.output)

    def test_file_edit_tool_replaces_content(self) -> None:
        from src.claw_agent_harness.tool_runners import run_file_edit, run_file_read, run_file_write

        with tempfile.TemporaryDirectory() as tmpdir:
            path = str(Path(tmpdir) / 'edit_test.py')
            run_file_write(path, 'x = 1\ny = 2\n')
            edit_result = run_file_edit(path, 'x = 1', 'x = 42')
            self.assertTrue(edit_result.success)
            read_result = run_file_read(path)
            self.assertIn('x = 42', read_result.output)
            self.assertNotIn('x = 1', read_result.output)

    def test_file_edit_tool_rejects_missing_target(self) -> None:
        from src.claw_agent_harness.tool_runners import run_file_edit, run_file_write

        with tempfile.TemporaryDirectory() as tmpdir:
            path = str(Path(tmpdir) / 'no_match.py')
            run_file_write(path, 'a = 1\n')
            result = run_file_edit(path, 'z = 99', 'z = 0')
            self.assertFalse(result.success)

    def test_grep_tool_finds_pattern(self) -> None:
        from src.claw_agent_harness.tool_runners import run_grep

        result = run_grep('PortRuntime', path='src', include_glob='*.py')
        self.assertTrue(result.success)
        self.assertIn('PortRuntime', result.output)

    def test_grep_tool_no_matches(self) -> None:
        from src.claw_agent_harness.tool_runners import run_grep

        result = run_grep('ZZZNONEXISTENTXXX', path='src')
        self.assertTrue(result.success)
        self.assertIn('No matches', result.output)

    def test_grep_tool_invalid_regex(self) -> None:
        from src.claw_agent_harness.tool_runners import run_grep

        result = run_grep('[invalid(regex', path='src')
        self.assertFalse(result.success)
        self.assertIn('Invalid regex', result.error)

    def test_glob_tool_finds_python_files(self) -> None:
        from src.claw_agent_harness.tool_runners import run_glob

        result = run_glob('*.py', path='src')
        self.assertTrue(result.success)
        self.assertIn('.py', result.output)

    def test_glob_tool_no_match(self) -> None:
        from src.claw_agent_harness.tool_runners import run_glob

        result = run_glob('*.nonexistent_ext', path='src')
        self.assertTrue(result.success)
        self.assertIn('No matching', result.output)

    # ---------------------------------------------------------------------------
    # CLI tool runner commands
    # ---------------------------------------------------------------------------

    def test_cli_exec_bash_runs(self) -> None:
        result = subprocess.run(
            [sys.executable, '-m', 'src.claw_agent_harness.main', 'exec-bash', 'echo claw-code'],
            check=True, capture_output=True, text=True,
        )
        self.assertIn('claw-code', result.stdout)

    def test_cli_exec_file_read_runs(self) -> None:
        result = subprocess.run(
            [sys.executable, '-m', 'src.claw_agent_harness.main', 'exec-file-read', 'src/claw_agent_harness/__init__.py'],
            check=True, capture_output=True, text=True,
        )
        self.assertIn('PortRuntime', result.stdout)

    def test_cli_search_code_runs(self) -> None:
        result = subprocess.run(
            [sys.executable, '-m', 'src.claw_agent_harness.main', 'search-code', 'PortRuntime', '--path', 'src/claw_agent_harness', '--glob', '*.py'],
            check=True, capture_output=True, text=True,
        )
        self.assertIn('PortRuntime', result.stdout)

    def test_cli_find_files_runs(self) -> None:
        result = subprocess.run(
            [sys.executable, '-m', 'src.claw_agent_harness.main', 'find-files', '*.py', '--path', 'src/claw_agent_harness'],
            check=True, capture_output=True, text=True,
        )
        self.assertIn('.py', result.stdout)

    def test_cli_exec_file_write_and_read(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            path = str(Path(tmpdir) / 'cli_test.txt')
            write_result = subprocess.run(
                [sys.executable, '-m', 'src.claw_agent_harness.main', 'exec-file-write', path, 'cli write test content'],
                check=True, capture_output=True, text=True,
            )
            self.assertIn('Written', write_result.stdout)
            read_result = subprocess.run(
                [sys.executable, '-m', 'src.claw_agent_harness.main', 'exec-file-read', path],
                check=True, capture_output=True, text=True,
            )
            self.assertIn('cli write test content', read_result.stdout)

    # ---------------------------------------------------------------------------
    # Plugin loader
    # ---------------------------------------------------------------------------

    def test_plugin_registry_builds(self) -> None:
        from src.claw_agent_harness.plugins.loader import build_plugin_registry

        registry = build_plugin_registry()
        self.assertIsNotNone(registry)
        self.assertIsInstance(registry.plugins, list)

    def test_plugin_registry_as_markdown(self) -> None:
        from src.claw_agent_harness.plugins.loader import build_plugin_registry

        registry = build_plugin_registry()
        md = registry.as_markdown()
        self.assertIn('Plugin Registry', md)
        self.assertIn('Discovered:', md)

    def test_cli_plugins_runs(self) -> None:
        result = subprocess.run(
            [sys.executable, '-m', 'src.claw_agent_harness.main', 'plugins'],
            check=True, capture_output=True, text=True,
        )
        self.assertIn('Plugin Registry', result.stdout)

    def test_plugin_registry_loads_file_plugins(self) -> None:
        from src.claw_agent_harness.plugins.loader import build_plugin_registry

        with tempfile.TemporaryDirectory() as tmpdir:
            plugin_file = Path(tmpdir) / 'my_plugin.py'
            plugin_file.write_text(
                "PLUGIN_NAME = 'test-plugin'\n"
                "PLUGIN_VERSION = '1.0.0'\n"
                "PLUGIN_DESCRIPTION = 'A test plugin'\n"
            )
            registry = build_plugin_registry(plugin_dir=tmpdir)
            self.assertEqual(len(registry.plugins), 1)
            info = registry.get('test-plugin')
            self.assertIsNotNone(info)
            self.assertTrue(info.loaded)
            self.assertEqual(info.version, '1.0.0')

    # ---------------------------------------------------------------------------
    # Skill runner
    # ---------------------------------------------------------------------------

    def test_skill_runner_builds(self) -> None:
        from src.claw_agent_harness.skills.runner import build_default_skill_runner

        runner = build_default_skill_runner()
        self.assertGreater(len(runner.skills), 0)

    def test_skill_runner_find(self) -> None:
        from src.claw_agent_harness.skills.runner import build_default_skill_runner

        runner = build_default_skill_runner()
        results = runner.find('workspace')
        self.assertTrue(results)

    def test_skill_runner_run_success(self) -> None:
        from src.claw_agent_harness.skills.runner import build_default_skill_runner

        runner = build_default_skill_runner()
        result = runner.run('summarize-workspace')
        self.assertTrue(result.success)
        self.assertGreater(result.steps_completed, 0)

    def test_skill_runner_run_not_found(self) -> None:
        from src.claw_agent_harness.skills.runner import build_default_skill_runner

        runner = build_default_skill_runner()
        result = runner.run('nonexistent-skill')
        self.assertFalse(result.success)
        self.assertIn('not found', result.error)

    def test_skill_runner_as_markdown(self) -> None:
        from src.claw_agent_harness.skills.runner import build_default_skill_runner

        runner = build_default_skill_runner()
        md = runner.as_markdown()
        self.assertIn('Skill Registry', md)
        self.assertIn('summarize-workspace', md)

    def test_cli_skills_runs(self) -> None:
        result = subprocess.run(
            [sys.executable, '-m', 'src.claw_agent_harness.main', 'skills'],
            check=True, capture_output=True, text=True,
        )
        self.assertIn('Skill Registry', result.stdout)

    def test_cli_run_skill_runs(self) -> None:
        result = subprocess.run(
            [sys.executable, '-m', 'src.claw_agent_harness.main', 'run-skill', 'summarize-workspace'],
            check=True, capture_output=True, text=True,
        )
        self.assertIn('summarize-workspace', result.stdout)
        self.assertIn('Success: True', result.stdout)

    # ---------------------------------------------------------------------------
    # REPL session (non-interactive)
    # ---------------------------------------------------------------------------

    def test_repl_session_handle_help(self) -> None:
        from src.claw_agent_harness.repl import REPLSession

        session = REPLSession()
        response = session.handle_line('/help')
        self.assertIsNotNone(response)
        self.assertIn('/help', response)
        self.assertIn('/exit', response)

    def test_repl_session_handle_route(self) -> None:
        from src.claw_agent_harness.repl import REPLSession

        session = REPLSession()
        response = session.handle_line('/route review MCP')
        self.assertIsNotNone(response)
        # Should contain at least one match
        self.assertTrue(len(response) > 0)

    def test_repl_session_handle_cmd_lookup(self) -> None:
        from src.claw_agent_harness.repl import REPLSession

        session = REPLSession()
        response = session.handle_line('/cmd review')
        self.assertIsNotNone(response)
        self.assertIn('review', response.lower())

    def test_repl_session_handle_tool_lookup(self) -> None:
        from src.claw_agent_harness.repl import REPLSession

        session = REPLSession()
        response = session.handle_line('/tool MCPTool')
        self.assertIsNotNone(response)
        self.assertIn('mcptool', response.lower())

    def test_repl_session_handle_bash(self) -> None:
        from src.claw_agent_harness.repl import REPLSession

        session = REPLSession()
        response = session.handle_line('/bash echo repl-test')
        self.assertIsNotNone(response)
        self.assertIn('repl-test', response)

    def test_repl_session_routing_prompt(self) -> None:
        from src.claw_agent_harness.repl import REPLSession

        session = REPLSession()
        response = session.handle_line('review some code')
        self.assertIsNotNone(response)
        self.assertEqual(session.turn_count, 1)
        self.assertGreater(session.total_input_tokens, 0)

    def test_repl_session_history(self) -> None:
        from src.claw_agent_harness.repl import REPLSession

        session = REPLSession()
        session.handle_line('/help')
        session.handle_line('review code')
        response = session.handle_line('/history')
        self.assertIsNotNone(response)
        self.assertIn('/help', response)

    def test_repl_session_info(self) -> None:
        from src.claw_agent_harness.repl import REPLSession

        session = REPLSession()
        session.handle_line('test prompt')
        info = session.session_info()
        self.assertIn('turns', info)

    def test_repl_banner(self) -> None:
        from src.claw_agent_harness.replLauncher import build_repl_banner

        banner = build_repl_banner()
        self.assertIn('REPL', banner)

    # ---------------------------------------------------------------------------
    # Ink / output formatting
    # ---------------------------------------------------------------------------

    def test_ink_render_panel(self) -> None:
        from src.claw_agent_harness.ink import render_panel

        panel = render_panel('test content', no_color=True)
        self.assertIn('test content', panel)
        self.assertIn('─', panel)

    def test_ink_render_table(self) -> None:
        from src.claw_agent_harness.ink import render_table

        table = render_table(['Name', 'Score'], [['review', '4'], ['mcp', '3']])
        self.assertIn('Name', table)
        self.assertIn('review', table)

    def test_ink_colorize_no_color(self) -> None:
        from src.claw_agent_harness.ink import colorize

        text = colorize('hello', 'red', no_color=True)
        self.assertEqual(text, 'hello')

    def test_cli_repl_banner_runs(self) -> None:
        result = subprocess.run(
            [sys.executable, '-m', 'src.claw_agent_harness.main', 'repl-banner'],
            check=True, capture_output=True, text=True,
        )
        self.assertIn('REPL', result.stdout)

    def test_grep_tool_context_lines_correct_numbers(self) -> None:
        from src.claw_agent_harness.tool_runners import run_grep

        with tempfile.TemporaryDirectory() as tmpdir:
            path = str(Path(tmpdir) / 'ctx.py')
            Path(path).write_text('line1\nline2\nMATCH\nline4\nline5\n')
            result = run_grep('MATCH', path=path, context_lines=1)
            self.assertTrue(result.success)
            lines = result.output.splitlines()
            # Should have lines: ctx.py:2 (before), ctx.py:3 (match), ctx.py:4 (after)
            line_numbers = [int(l.split(':')[1]) for l in lines if ':' in l]
            self.assertEqual(line_numbers, [2, 3, 4])

    def test_grep_tool_non_recursive(self) -> None:
        from src.claw_agent_harness.tool_runners import GrepToolRunner

        runner = GrepToolRunner()
        result = runner.run('PortRuntime', path='src', recursive=False)
        self.assertTrue(result.success)
        # Non-recursive only searches direct files in src/, not subdirectories

    def test_grep_tool_hidden_files_excluded(self) -> None:
        from src.claw_agent_harness.tool_runners import GrepToolRunner, run_grep

        with tempfile.TemporaryDirectory() as tmpdir:
            Path(tmpdir, 'visible.py').write_text('TARGET=1\n')
            hidden_dir = Path(tmpdir, '.hidden')
            hidden_dir.mkdir()
            Path(hidden_dir, 'secret.py').write_text('TARGET=1\n')
            runner = GrepToolRunner()
            result = runner.run('TARGET', path=tmpdir)
            self.assertTrue(result.success)
            # Hidden directory files should not appear in results
            self.assertNotIn('.hidden', result.output)
            self.assertIn('visible.py', result.output)

    def test_plugin_loader_handles_syntax_error(self) -> None:
        from src.claw_agent_harness.plugins.loader import build_plugin_registry

        with tempfile.TemporaryDirectory() as tmpdir:
            bad_plugin = Path(tmpdir) / 'bad_plugin.py'
            bad_plugin.write_text('def (  # syntax error\n')
            # Should not raise; bad plugin is silently skipped (loaded=False)
            registry = build_plugin_registry(plugin_dir=tmpdir)
            self.assertEqual(len(registry.plugins), 1)
            info = registry.plugins[0]
            self.assertFalse(info.loaded)

    def test_plugin_loader_handles_missing_attributes(self) -> None:
        from src.claw_agent_harness.plugins.loader import build_plugin_registry

        with tempfile.TemporaryDirectory() as tmpdir:
            minimal_plugin = Path(tmpdir) / 'minimal_plugin.py'
            minimal_plugin.write_text('# no attributes\n')
            registry = build_plugin_registry(plugin_dir=tmpdir)
            self.assertEqual(len(registry.plugins), 1)
            info = registry.plugins[0]
            # Should fall back to stem name and defaults
            self.assertEqual(info.name, 'minimal_plugin')
            self.assertEqual(info.version, '0.0.0')


    def test_routing_exact_name_bonus(self) -> None:
        from src.claw_agent_harness.runtime import PortRuntime

        # 'review' as a standalone query should strongly match the 'review' command
        matches = PortRuntime().route_prompt('review', limit=10)
        names = [m.name for m in matches]
        # The exact 'review' command should appear in results
        self.assertTrue(any('review' in n.lower() for n in names))

    def test_routing_returns_both_command_and_tool(self) -> None:
        from src.claw_agent_harness.runtime import PortRuntime

        matches = PortRuntime().route_prompt('bash file read', limit=6)
        kinds = {m.kind for m in matches}
        self.assertIn('command', kinds)
        self.assertIn('tool', kinds)


if __name__ == '__main__':
    unittest.main()
