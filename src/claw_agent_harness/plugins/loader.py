from __future__ import annotations

import importlib
import importlib.util
import sys
from dataclasses import dataclass, field
from pathlib import Path
from types import ModuleType


@dataclass
class PluginInfo:
    name: str
    path: str
    version: str = '0.0.0'
    description: str = ''
    loaded: bool = False
    module: ModuleType | None = None

    def as_text(self) -> str:
        status = 'loaded' if self.loaded else 'discovered'
        return f'{self.name} [{status}] v{self.version} — {self.description or self.path}'


@dataclass
class PluginRegistry:
    plugins: list[PluginInfo] = field(default_factory=list)

    def register(self, info: PluginInfo) -> None:
        for existing in self.plugins:
            if existing.name == info.name:
                return
        self.plugins.append(info)

    def get(self, name: str) -> PluginInfo | None:
        for plugin in self.plugins:
            if plugin.name == name:
                return plugin
        return None

    def loaded_plugins(self) -> list[PluginInfo]:
        return [p for p in self.plugins if p.loaded]

    def as_markdown(self) -> str:
        lines = ['# Plugin Registry', '', f'Discovered: {len(self.plugins)}, Loaded: {len(self.loaded_plugins())}', '']
        for plugin in self.plugins:
            lines.append(f'- {plugin.as_text()}')
        return '\n'.join(lines)


def _discover_plugin_files(plugin_dir: Path) -> list[Path]:
    if not plugin_dir.is_dir():
        return []
    return sorted(
        p for p in plugin_dir.iterdir()
        if p.suffix == '.py' and not p.name.startswith('_')
    )


def _load_plugin_module(path: Path) -> ModuleType | None:
    module_name = f'_claw_plugin_{path.stem}'
    try:
        spec = importlib.util.spec_from_file_location(module_name, path)
        if spec is None or spec.loader is None:
            return None
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)  # type: ignore[attr-defined]
        return module
    except Exception:  # noqa: BLE001
        return None


def _info_from_module(path: Path, module: ModuleType | None) -> PluginInfo:
    name = getattr(module, 'PLUGIN_NAME', None) or path.stem
    version = getattr(module, 'PLUGIN_VERSION', '0.0.0')
    description = getattr(module, 'PLUGIN_DESCRIPTION', '')
    return PluginInfo(
        name=name,
        path=str(path),
        version=version,
        description=description,
        loaded=module is not None,
        module=module,
    )


def build_plugin_registry(plugin_dir: str | Path | None = None, load: bool = True) -> PluginRegistry:
    registry = PluginRegistry()
    if plugin_dir is None:
        plugin_dir = Path(__file__).resolve().parent.parent.parent / 'plugins'
    plugin_dir = Path(plugin_dir)
    for path in _discover_plugin_files(plugin_dir):
        module = _load_plugin_module(path) if load else None
        info = _info_from_module(path, module)
        registry.register(info)
    return registry
