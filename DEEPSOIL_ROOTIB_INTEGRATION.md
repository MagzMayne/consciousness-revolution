RootIB: RB-20260304173933-DS000001

# DeepSoil + RootIB Integration Guide

**Version:** 1.0.0  
**Author:** Ryan Barbrick (Barbrick Design)  
**Contact:** BarbrickDesign@gmail.com  
**RootIB Genesis:** `RootIB: RB-20260223081500-9F3A7C21`

---

## Overview

DeepSoil and RootIB together form the living ecosystem of rooted ideas, tools, and autonomous agents.

| Layer     | Responsibility                                                                 |
|-----------|--------------------------------------------------------------------------------|
| **RootIB**   | Identity, lineage, blessings, activation contracts, provenance, compliance |
| **DeepSoil** | Storage, discovery, indexing, semantic graph, on-chain substrate (Solana)  |

RootIB is the **authoritative identity and governance layer**.  
DeepSoil **extends** RootIB — it does not replace it.

Every entry in DeepSoil **must** be rooted in a valid RootIB identity.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        DeepSoil                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Idea Registry│  │ Tool Registry│  │  Agent Registry  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘            │
│                           │                                 │
│                   Lineage / Semantic Graph                  │
│                           │                                 │
│                   Solana PDA Accounts                       │
└───────────────────────────┼─────────────────────────────────┘
                            │  validates / governs
┌───────────────────────────▼─────────────────────────────────┐
│                        RootIB                               │
│  Identity · Lineage · Blessings · Activation · Provenance  │
└─────────────────────────────────────────────────────────────┘
```

---

## RootIB Integration Rules

All DeepSoil entries **MUST**:

1. **Reference a valid RootIB identity object** — every manifest must carry a `rootib` field containing a well-formed `RootIB: <CreatorID>-<Timestamp>-<8HEX>` string.
2. **Include RootIB lineage anchors** — every manifest must carry a `rootib_lineage` object with at least a `lineage_root` (the RootIB at the start of the provenance chain).
3. **Include RootIB blessing and activation metadata** — every manifest must carry a `rootib_blessing` object declaring whether the entry is blessed, who blessed it, and when.
4. **Follow RootIB's semantic index structure** — tags, capabilities, and relations must be consistent with the RootIB semantic index.
5. **Use RootIB's activation contract for publishing and updating** — registration and updates must pass RootIB identity and blessing validation before being written to DeepSoil.

---

## Files

| File | Purpose |
|------|---------|
| `js/rootib.js` | RootIB utility library (identity, lineage, blessings, provenance) |
| `js/deepsoil.js` | DeepSoil integration layer (storage, discovery, registration) |
| `deepSoil.html` | Interactive DeepSoil substrate dashboard |
| `deepsoil/schemas/idea.manifest.schema.json` | JSON Schema for idea manifests |
| `deepsoil/schemas/tool.manifest.schema.json` | JSON Schema for tool manifests |
| `deepsoil/schemas/agent.manifest.schema.json` | JSON Schema for agent manifests |
| `deepsoil/examples/idea-example.json` | Example idea manifest with RootIB fields |
| `deepsoil/examples/tool-example.json` | Example tool manifest with RootIB fields |
| `deepsoil/examples/agent-example.json` | Example agent manifest with RootIB fields |
| `test-deepsoil-rootib.js` | Tests validating RootIB compliance |

---

## Manifest Schema Reference

### Required RootIB Fields (all entry types)

| Field | Type | Description |
|-------|------|-------------|
| `rootib` | `string` | RootIB identity: `RootIB: <CreatorID>-<Timestamp>-<8HEX>` |
| `rootib_lineage` | `object` | Lineage anchor; includes `lineage_root` (RootIB at chain root) |
| `rootib_lineage.lineage_root` | `string` | RootIB at the genesis of this entry's lineage |
| `rootib_lineage.parent_rootib` | `string\|null` | Direct parent's RootIB; `null` for genesis entries |
| `rootib_blessing` | `object` | Blessing metadata |
| `rootib_blessing.blessed` | `boolean` | Whether entry has an active blessing |
| `rootib_blessing.blessings` | `string[]` | List of active blessing identifiers |
| `deepsoil_meta` | `object` | DeepSoil storage metadata |
| `deepsoil_meta.program_id` | `string` | Solana program ID (`DEEPSOiL111...`) |
| `deepsoil_meta.entry_type` | `string` | `"idea"`, `"tool"`, or `"agent"` |

### Idea-specific Fields

| Field | Description |
|-------|-------------|
| `idea_id` | Unique ID: `idea:<namespace>.<slug>` |
| `name` | Human-readable name |
| `tags` | Semantic discovery tags |
| `parents` | idea_id values of parent ideas |
| `children` | idea_id values of child ideas |

### Tool-specific Fields

| Field | Description |
|-------|-------------|
| `tool_mint` | Solana mint address (unique key) |
| `name` | Namespaced name: `<substrate>.<domain>.<verb>` |
| `version` | Semantic version |
| `capabilities` | Capability tags for agent discovery |
| `safety_level` | `"open"` / `"restricted"` / `"blessed_only"` |
| `rootib_lineage.idea_root` | idea_id this tool implements |

### Agent-specific Fields

| Field | Description |
|-------|-------------|
| `agent_mint` | Solana mint address (unique key) |
| `name` | Namespaced name: `<substrate>.agent.<role>` |
| `role` | Primary role (planner, executor, etc.) |
| `capabilities` | Capability tags for agent-to-agent discovery |
| `required_tools` | tool_mint values agent depends on |
| `rootib_lineage.idea_root` | idea_id this agent was conceived from |

---

## DeepSoil JavaScript API

Load both scripts in order:

```html
<script src="js/rootib.js"></script>
<script src="js/deepsoil.js"></script>
```

Or in Node.js:

```javascript
const RootIB = require('./js/rootib.js');
global.RootIB = RootIB;  // required by deepsoil.js
const DeepSoil = require('./js/deepsoil.js');
```

### Registration

```javascript
// Register an idea
const ideaRootib = await RootIB.generate('RB', 'My idea content');
const result = await DeepSoil.registerIdea({
  idea_id: 'idea:my.idea',
  name: 'My Idea',
  description: 'Description...',
  tags: ['my-tag'],
  parents: [],
  children: [],
  rootib: ideaRootib,
  rootib_lineage: { lineage_root: ideaRootib, parent_rootib: null, parents: [] },
  rootib_blessing: { blessed: true, blessings: ['blessing:my.blessing'], blessed_by: 'RB', blessed_at: new Date().toISOString(), revoked: false },
  deepsoil_meta: { program_id: DeepSoil.PROGRAM_ID, entry_type: 'idea', schema_version: '1.0.0', network: 'solana-simulated' }
});
// result.entry    → the stored entry
// result.rootib   → DeepSoil-scoped RootIB for this registration event
// result.validation.valid → boolean

// Register a tool
const toolResult = await DeepSoil.registerTool({ tool_mint: 'TOOLABC...', ...manifest });

// Register an agent
const agentResult = await DeepSoil.registerAgent({ agent_mint: 'AGENTABC...', ...manifest });
```

### Lineage

```javascript
// Link two entries in the lineage graph
const linkResult = await DeepSoil.linkLineage(
  'idea:parent-idea',  // parent
  'idea:child-idea',   // child
  'parent_of'          // relation: parent_of | derived_from | extends
);
// linkResult.link.rootib → RootIB stamped on the link itself
```

### Discovery

```javascript
// Discover ideas
const ideas = DeepSoil.discoverIdeas({ tag: 'substrate', blessed: true });

// Discover tools
const tools = DeepSoil.discoverTools({ capability: 'summarization', safety_level: 'open' });

// Discover agents
const agents = DeepSoil.discoverAgents({ role: 'planner', blessed: true });

// Traverse lineage graph
const nodes = DeepSoil.discoverLineage('idea:deepsoil.core-layer');
// Returns [{ id, relation, depth, rootib }]
```

### Validation

```javascript
// Validate any manifest for RootIB compliance before registering
const { valid, errors } = await DeepSoil.validateRootIBEntry(manifest);
if (!valid) {
  console.error('RootIB compliance errors:', errors);
}
```

---

## Solana Program Instructions (Conceptual)

DeepSoil uses four on-chain instructions. Each validates RootIB identity, blessing, and provenance before writing PDA data accounts.

### `deepsoil_register_idea`

```
Accounts:
  payer           <pubkey>
  authority       <pubkey>
  idea_account    <deepsoil_idea_pda>   -- PDA seeded by idea_id
  system_program  <pubkey>
  deepsoil_program <pubkey>

Data:
  idea_id         string
  manifest_uri    string   (Arweave / IPFS / HTTPS)
  rootib          string   (validated before write)
  blessing_proof  bytes    (RootIB blessing signature or on-chain blessing account)
```

### `deepsoil_register_tool`

```
Accounts:
  payer, authority, tool_mint, tool_account <deepsoil_tool_pda>, system_program, deepsoil_program

Data:
  manifest_uri    string
  capability_tags string[]
  safety_level    "open" | "restricted" | "blessed_only"
  rootib          string
  blessing_proof  bytes
```

### `deepsoil_register_agent`

```
Accounts:
  payer, authority, agent_mint, agent_account <deepsoil_agent_pda>, system_program, deepsoil_program

Data:
  manifest_uri    string
  role            string
  required_tools  string[]  (tool_mint values)
  rootib          string
  blessing_proof  bytes
```

### `deepsoil_link_lineage`

```
Accounts:
  authority       <pubkey>
  parent_entry    <deepsoil_pda>
  child_entry     <deepsoil_pda>
  lineage_account <deepsoil_lineage_pda>
  deepsoil_program <pubkey>

Data:
  relation        "parent_of" | "derived_from" | "extends"
  link_rootib     string   (RootIB stamped on the link)
```

---

## PDA Layout

```
Idea PDA:    seeds = ["deepsoil", "idea", idea_id]
Tool PDA:    seeds = ["deepsoil", "tool", tool_mint]
Agent PDA:   seeds = ["deepsoil", "agent", agent_mint]
Lineage PDA: seeds = ["deepsoil", "lineage", parent_id, child_id]
```

All PDAs are owned by `DEEPSOiL111111111111111111111111111111111`.

---

## Governance

DeepSoil stores governance metadata; RootIB enforces it.

| Model | Description |
|-------|-------------|
| `single_owner` | One Solana pubkey controls the entry |
| `multisig` | M-of-N signers required for updates |
| `dao` | On-chain DAO vote required |

Revocation rules:
- A revoked **tool** MUST NOT be invoked by any agent.
- A revoked **agent** MUST NOT activate.
- Revocation is recorded in `rootib_blessing.revoked = true`.

---

## Testing

Run the RootIB compliance test suite:

```bash
node test-deepsoil-rootib.js
```

Expected output: `82 passed, 0 failed`

The tests validate:
1. Module loading
2. RootIB identity validation
3. `validateRootIBEntry` for all required fields
4. Idea, tool, and agent registration
5. Lineage linking
6. Discovery layer (filter by tag, capability, role, blessed)
7. RootIB lineage anchoring (parent → child cryptographic binding)
8. State summary
9. Example manifest file compliance

---

## Quick-Start Example

```javascript
// 1. Generate a RootIB identity for a new idea
const ideaRootib = await RootIB.generate('RB', 'My AI Planning Idea');

// 2. Build the manifest
const idea = {
  idea_id:  'idea:my.ai-planning',
  name:     'My AI Planning Idea',
  description: 'An idea for autonomous AI planning grounded in DeepSoil.',
  tags:     ['ai', 'planning', 'autonomous'],
  parents:  [],
  children: [],
  rootib:   ideaRootib,
  rootib_lineage: {
    lineage_root:  ideaRootib,
    parent_rootib: null,
    parents:       []
  },
  rootib_blessing: {
    blessed:    true,
    blessings:  ['blessing:deepsoil.core'],
    blessed_by: 'RB',
    blessed_at: new Date().toISOString(),
    revoked:    false
  },
  deepsoil_meta: {
    program_id:     DeepSoil.PROGRAM_ID,
    entry_type:     'idea',
    schema_version: '1.0.0',
    network:        'solana-simulated'
  }
};

// 3. Register in DeepSoil (validates RootIB before storing)
const { entry, rootib, validation } = await DeepSoil.registerIdea(idea);

// 4. Discover it
const results = DeepSoil.discoverIdeas({ tag: 'planning' });
console.log(results[0].name); // → "My AI Planning Idea"

// 5. Check lineage
const lineage = DeepSoil.discoverLineage('idea:my.ai-planning');
```

---

## Further Reading

- [RootIB Standard](https://barbrickdesign.github.io/RootIB.html) — authoritative spec
- [DeepSoil Dashboard](https://barbrickdesign.github.io/deepSoil.html) — interactive UI
- `deepsoil/schemas/` — JSON schemas for all manifest types
- `deepsoil/examples/` — complete example manifests
