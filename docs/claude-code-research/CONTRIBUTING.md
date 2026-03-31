# Contributing to Claude Code Research Archive

This repository is maintained as an **educational and defensive security research archive**. Contributions are welcome in the form of analysis, annotations, and documentation.

---

## What We Welcome

- **Architecture analysis** — Walkthroughs of subsystems, data-flow diagrams, or written summaries of how modules interact
- **Security observations** — Notes on permission enforcement, sandboxing logic, or interesting security patterns in the codebase
- **Documentation improvements** — Corrections and additions to the `docs/` research notes
- **Code annotations** — Inline comments added to source files that help other researchers understand complex logic (prefix with `[RESEARCH NOTE]`)
- **Tooling** — Scripts in `scripts/` that help analyze the codebase (dependency graphs, call trees, metrics)

## What We Do Not Accept

- Changes that introduce new functional features to the leaked code
- Removal or suppression of existing safety/permission checks
- Credentials, tokens, or secrets of any kind
- Content that could be used to harm Anthropic's systems or users

---

## How to Contribute

1. **Fork** this repository
2. **Create a branch** — `git checkout -b research/my-analysis-topic`
3. **Add your contribution** — documentation, annotations, or analysis scripts
4. **Open a Pull Request** with a clear description of your findings

---

## Code of Ethics

All contributors must abide by the following:

- Research must be conducted for **defensive or educational** purposes only
- Do not attempt to reproduce, distribute, or commercialise Anthropic's proprietary code
- Do not use the snapshot to develop tools that circumvent Claude's safety measures
- Cite this repository appropriately in any published research

---

## Documentation Style

- Write in clear, concise English
- Use [GitHub Flavored Markdown](https://docs.github.com/en/get-started/writing-on-github)
- Link to specific files with `src/path/to/file.ts` references
- Label speculative or uncertain observations with **[UNCERTAIN]**

---

## Questions

Open a GitHub Discussion for general research questions, or file an Issue if you find a factual error in the documentation.
