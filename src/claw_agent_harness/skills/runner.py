from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable


@dataclass(frozen=True)
class SkillStep:
    name: str
    description: str
    tool: str
    args: dict[str, str] = field(default_factory=dict)


@dataclass
class Skill:
    name: str
    description: str
    steps: list[SkillStep] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)

    def as_text(self) -> str:
        lines = [f'Skill: {self.name}', f'  Description: {self.description}']
        if self.tags:
            lines.append(f'  Tags: {", ".join(self.tags)}')
        lines.append(f'  Steps ({len(self.steps)}):')
        for i, step in enumerate(self.steps, start=1):
            lines.append(f'    {i}. [{step.tool}] {step.name} — {step.description}')
        return '\n'.join(lines)


@dataclass(frozen=True)
class SkillRunResult:
    skill_name: str
    steps_completed: int
    steps_total: int
    outputs: tuple[str, ...]
    success: bool
    error: str = ''

    def as_text(self) -> str:
        lines = [
            f'Skill: {self.skill_name}',
            f'Steps: {self.steps_completed}/{self.steps_total}',
            f'Success: {self.success}',
        ]
        if self.error:
            lines.append(f'Error: {self.error}')
        if self.outputs:
            lines.append('Outputs:')
            lines.extend(f'  {o}' for o in self.outputs)
        return '\n'.join(lines)


ToolDispatch = Callable[[str, dict[str, str]], str]


def _default_dispatch(tool: str, args: dict[str, str]) -> str:
    return f'[{tool}] args={args}'


@dataclass
class SkillRunner:
    skills: list[Skill] = field(default_factory=list)

    def register(self, skill: Skill) -> None:
        self.skills.append(skill)

    def get(self, name: str) -> Skill | None:
        for skill in self.skills:
            if skill.name.lower() == name.lower():
                return skill
        return None

    def find(self, query: str) -> list[Skill]:
        q = query.lower()
        return [s for s in self.skills if q in s.name.lower() or q in s.description.lower() or any(q in t for t in s.tags)]

    def run(self, name: str, dispatch: ToolDispatch = _default_dispatch) -> SkillRunResult:
        skill = self.get(name)
        if skill is None:
            return SkillRunResult(
                skill_name=name,
                steps_completed=0,
                steps_total=0,
                outputs=(),
                success=False,
                error=f'Skill not found: {name}',
            )
        outputs: list[str] = []
        for i, step in enumerate(skill.steps):
            try:
                output = dispatch(step.tool, step.args)
                outputs.append(output)
            except Exception as exc:  # noqa: BLE001
                return SkillRunResult(
                    skill_name=name,
                    steps_completed=i,
                    steps_total=len(skill.steps),
                    outputs=tuple(outputs),
                    success=False,
                    error=f'Step {i + 1} ({step.name}) failed: {exc}',
                )
        return SkillRunResult(
            skill_name=name,
            steps_completed=len(skill.steps),
            steps_total=len(skill.steps),
            outputs=tuple(outputs),
            success=True,
        )

    def as_markdown(self) -> str:
        lines = ['# Skill Registry', '', f'Skills registered: {len(self.skills)}', '']
        for skill in self.skills:
            lines.append(f'## {skill.name}')
            lines.append(skill.description)
            if skill.tags:
                lines.append(f'Tags: {", ".join(skill.tags)}')
            for step in skill.steps:
                lines.append(f'- [{step.tool}] {step.name}')
            lines.append('')
        return '\n'.join(lines)


def build_default_skill_runner() -> SkillRunner:
    runner = SkillRunner()
    runner.register(Skill(
        name='summarize-workspace',
        description='Summarize the Python porting workspace structure and parity status',
        tags=['workspace', 'summary', 'audit'],
        steps=[
            SkillStep('manifest', 'Scan workspace files', 'port_manifest'),
            SkillStep('parity', 'Run parity audit', 'parity_audit'),
            SkillStep('query', 'Render workspace summary', 'query_engine'),
        ],
    ))
    runner.register(Skill(
        name='search-and-read',
        description='Find files matching a pattern and read them',
        tags=['search', 'files', 'read'],
        steps=[
            SkillStep('find', 'Find files with glob', 'GlobTool', {'pattern': '**/*.py'}),
            SkillStep('read', 'Read matched files', 'FileReadTool'),
        ],
    ))
    runner.register(Skill(
        name='grep-and-report',
        description='Search for a pattern across source files and report matches',
        tags=['search', 'grep', 'report'],
        steps=[
            SkillStep('grep', 'Search source files', 'GrepTool', {'path': 'src'}),
            SkillStep('format', 'Format results as report', 'query_engine'),
        ],
    ))
    return runner
