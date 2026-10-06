# Porting pstack to Kiro CLI

A detailed record of how [pstack](https://github.com/cursor/plugins/tree/main/pstack)
was ported from Cursor to Kiro CLI, what changed and why, how it was verified, and
how Kiro compares to other agent harnesses for this workload.

## What pstack is

pstack is a structured agent operating system. `/poteto-mode` is the router: it
reads a task, matches a playbook, applies principles, delegates through
subagents, and produces verified work. The router is worthless without the
skills it routes to. The port therefore ships the complete set: 54 skills, 23
playbooks, 19 principles, and the `poteto-agent` subagent role.

## Why a port was needed

pstack was authored for the Cursor harness. Every runtime touch point assumed
Cursor mechanisms that Kiro does not have or exposes differently. The philosophy,
playbook steps, principles, and reply discipline are prose and port unchanged.
The wiring between that prose and the agent runtime had to be retargeted.

## What changed from upstream pstack

Ten changes, each driven by a measured difference between the two harnesses.

| Area | Upstream (Cursor) | Port (Kiro) | Reason |
|---|---|---|---|
| Repository layout | plugin flat layout | `.kiro/skills/` and `.kiro/agents/` | Kiro discovers skills via `skill://.kiro/skills/*/SKILL.md` |
| Subagent spawn | `Task` tool + `subagent_type` | `subagent` tool DAG + stage `role` | Kiro has no `Task` tool; `subagent` is its pipeline primitive |
| Subagent role | `poteto-agent` wrapper | agent config `~/.kiro/agents/poteto-agent.json` | A role must resolve to a real agent config or the spawn errors |
| Model config path | `~/.cursor/rules/pstack-models.mdc` | `~/.kiro/steering/pstack-models.md` | Kiro reads steering files, never `~/.cursor/` |
| Config frontmatter | `alwaysApply: true` | `inclusion: always` | Kiro steering frontmatter format |
| Model identifiers | `grok-4.7-xhigh-fast`, `claude-opus-5-5-xhigh` | `auto` (default) | Kiro uses backend model ids, not Cursor slugs; a slug is rejected |
| `generalPurpose` role | spawn `generalPurpose` | `poteto-agent` or `kiro_default` | `generalPurpose` does not exist on Kiro |
| Code-quality plugin | `cursor-team-kit` (`/deslop`, `control-*`) | manual degrade with notes | The plugin has no Kiro equivalent |
| Interactive questions | `AskQuestion` tool | prose question in the reply | Kiro has no `AskQuestion` tool |
| Transcript paths | `~/.cursor/projects/*/` | `~/.kiro/projects/*/` plus env override | Hardcoded Cursor paths in three playbooks and `worktree-audit.sh` |

## Files created for the port

These do not exist in upstream pstack. They are the port's compatibility layer.

- `.kiro/agents/poteto-agent.json`. The agent config that makes the subagent role
  resolve. It loads every skill through `skill://` resources and uses a
  `file://~/.kiro/skills/poteto-mode/SKILL.md` tilde path, so a plain copy to
  `~/.kiro/` works without any path rewriting.
- `.kiro/skills/poteto-mode/references/kiro-compat.md`. An eleven-row translation
  table from Cursor concepts to Kiro equivalents. It is the source of truth any
  playbook consults when it names a Cursor mechanism.
- `.kiro/skills/poteto-mode/scripts/verify-kiro-compat.mjs`. A verification
  harness with 26 assertions against the real files. It exits non-zero on any
  Cursor residue in the core loop.
- `install.sh`. An idempotent installer for global or workspace scope.
- `README.md`. Install and usage for all 54 skills.

## How the port was verified

Verification ran against real artifacts, not self-report.

1. **Harness.** `verify-kiro-compat.mjs` reports 26 of 26 PASS. It confirms the
   core-loop skills carry no `~/.cursor/` or `.mdc` references, that
   `setup-pstack` targets the Kiro steering path with `inclusion: always`, that
   the compatibility reference names the Kiro mechanisms, that
   `poteto-agent.json` passes `kiro-cli agent validate`, and that the Subagents
   section spawns through the `poteto-agent` role.
2. **Agent validation.** `kiro-cli agent validate` on `poteto-agent.json` exits 0.
3. **Live spawn.** A real `subagent` call with `role: "poteto-agent"` returned the
   installed SKILL.md path and confirmed it could see ten core skills, proving the
   role resolves and loads the skill set.
4. **Scenario QA.** Five real pstack scenarios ran in parallel through the role,
   each returning VERIFIED:
   - Bug-fix playbook match on a SQL-injection defect, with the correct playbook
     and first three steps.
   - Principle routing: `principle-fix-root-causes` and
     `principle-laziness-protocol` read, applicability and first rule stated.
   - The `/how` skill confirmed Kiro-compatible, which surfaced the
     `generalPurpose` role gap that was then added to the compat table.
   - `/setup-pstack` confirmed to write the Kiro steering path with no `~/.cursor/`
     residue.
   - The compat table and the Subagents section confirmed internally consistent.

## Using pstack in Kiro chat

pstack skills work as slash commands in `kiro-cli chat`. This is the primary
interaction surface. No special agent switch is needed. After installing with
`./install.sh global`, every new chat session sees all 54 skills because the
built-in default agent (`kiro_default`) loads
`skill://~/.kiro/skills/*/SKILL.md` as a default resource, and custom agents
inherit those resources unless `disableInheritingDefaultResources` is set. The
skills appear as tab-completable slash commands.

### Verified in chat

The following were verified in a live `kiro-cli chat` session (not a subagent):

- `kiro-cli agent list` shows `poteto-agent` as a global agent. (measured)
- The installed skill files at `~/.kiro/skills/poteto-mode/SKILL.md`,
  `~/.kiro/skills/how/SKILL.md`, and `~/.kiro/skills/unslop/SKILL.md` exist and
  are readable. (measured)
- The `poteto-mode` frontmatter contains `mode: true` and
  `disable-model-invocation: true`, which means it only fires on explicit
  `/poteto-mode` invocation, not on every turn. (measured)
- Default resource inheritance is active, confirmed by introspect documentation
  showing `skill://~/.kiro/skills/*/SKILL.md` in the default resources. (measured)
- A live `subagent` spawn with `role: "poteto-agent"` from within chat resolved
  the agent, loaded the full SKILL.md as its prompt, and confirmed visibility of
  10 sampled skills. (measured)
- Five parallel QA scenarios ran through the `poteto-agent` role and all returned
  VERIFIED, proving the router concept works end-to-end. (measured)

### How to invoke in chat

Type any pstack skill as a slash command:

```
/poteto-mode fix the SQL injection in findById
/how the supplier model layer
/why was the db connection opened per request
/setup-pstack
/unslop
```

Tab completion works. `/pote<Tab>` completes to `/poteto-mode`. The router reads
the task, matches a playbook, and drives it. Sub-skills like `/how` and `/why`
can be invoked directly for a focused task.

### Agent switching (optional)

To switch the entire chat session to the poteto agent:

```
/agent poteto-agent
```

This loads the SKILL.md as the system prompt and restricts tools to the agent
config. For most use cases, invoking `/poteto-mode` as a slash command from any
agent is simpler and sufficient.

## Harness comparison

How Kiro compares to Claude Code and Codex for this workload. The Kiro claims are
measured in this port. The Claude Code and Codex claims are general knowledge,
not run here, so treat them as unverified.

### Where Kiro has an edge

- **Agent config is validated JSON.** `kiro-cli agent validate` is a separate
  command, so the harness checks a role before spawning it. This port asserts
  that command as a real gate. (measured)
- **Steering files are plain markdown.** `.kiro/steering/*.md` with
  `inclusion: always` is portable and human-readable, simpler than Cursor's
  `.mdc` rule format. (measured)
- **Subagents are an explicit DAG.** `depends_on` and fail-fast semantics map
  cleanly onto pstack's research-implement-review playbooks. Five stages ran in
  parallel during QA. (measured)
- **Native progressive skill loading.** Skill metadata loads at startup, full
  content on demand, so the router holds 54 skills without flooding context.
  (measured against the install)
- **Lifecycle hooks.** `agentSpawn`, `preToolUse`, `postToolUse`, and `stop`
  hooks can automate verification and decision-trail steps. (measured capability,
  unused in this port)

### Where Kiro is limited

- **No nested subagents.** A subagent cannot spawn another. The orchestrate and
  autopilot playbooks assume a coordinator-owner-worker tree; the second level
  collapses. Documented in the compat reference. (measured)
- **No per-role model tiering by default.** pstack tiers hard work to a stronger
  model and trivial work to a faster one. Kiro uses Auto or a backend id, so every
  role defaults to `auto` and runs the parent model. Per-role pinning needs real
  backend ids. (measured)
- **No built-in cloud review tooling.** `cursor-team-kit`, bugbot, and the
  agentic security review have no Kiro equivalent. The babysit and shipping
  playbooks degrade to manual review plus `gh`. (measured absent)
- **Subagent sessions do not persist.** They cannot be resumed, which suits
  pstack's fresh-subagent default but blocks a resumable babysit watcher.
  (measured)

### Collaboration features to build on

- **MCP servers.** The agent config supports remote HTTP MCP with OAuth (Slack,
  Figma, Atlassian). This is the path to wire pstack playbooks into team chat and
  issue trackers, and how the dormant benny automation would map to Kiro.
- **Hooks as team automation.** A `postToolUse` hook can run CI or lint
  automatically; a `stop` hook can post status.
- **Workspace over global override.** Teams share pstack globally and override
  per project. The installer supports both scopes.
- **`gh` works.** The PR playbooks that drive `gh` collaborate through GitHub even
  without `cursor-team-kit`.

### Verdict

For pstack specifically, Kiro's real advantages are validated-JSON agent config
and plain-markdown steering, which make the port clean and the harness checkable.
Its real costs are the lack of nested subagents and cloud review tooling. A full
head-to-head against Claude Code and Codex would require porting pstack onto each
and running the same QA, which this record does not cover.

## Layout

```
Pstack-kiro-harness/
├── install.sh
├── README.md
├── docs/
│   └── PORTING-SUMMARY.md         # this file
└── .kiro/
    ├── agents/poteto-agent.json
    └── skills/                     # 54 skills
        ├── poteto-mode/            # router, 23 playbooks, references, scripts
        ├── setup-pstack/
        ├── how/  why/  architect/  arena/  swarm/  interrogate/  reflect/
        ├── principle-*/            # 19 principles
        └── ...
```
