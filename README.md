# Pstack for Kiro 

> **Branch `kiro-core-feature-integration`.**
> Use `main` for the base port. Use this branch when your Kiro project has
> specs, steering, hooks, or MCP servers and you want pstack to read them.

## How this branch connects pstack to Kiro features

Kiro CLI has built-in features that Cursor does not have. The `main` branch
ignores them. This branch wires pstack into each one. Here is what each Kiro
feature does, and what pstack does with it.

### 1. Kiro Specs

**What Kiro gives you.** You write structured requirements in
`.kiro/specs/<name>/requirements.md` with acceptance criteria like "WHEN the user
submits the form, THE controller SHALL trim and escape all fields." Kiro can
generate these from a prompt. They live in your repo.

**What main-branch pstack does.** Ignores them. The Feature playbook infers
requirements from your chat prompt.

**What this branch does.** The Feature and Bug fix playbooks read the spec first.
Each acceptance criterion becomes the done-check. The agent verifies its build
against those criteria, not against what it inferred from your words.

**Example flow.**
```
You have: .kiro/specs/student-search-filter/requirements.md (6 requirements, 13 acceptance criteria)
You type:  /poteto-mode implement the student-search-filter spec
Agent does: reads spec → architect → builds → verifies each criterion → done
```

### 2. Kiro Steering

**What Kiro gives you.** Markdown files in `.kiro/steering/` that describe your
project's conventions. For example `tech.md` says "use callback-style DB access,
not async/await" and "use parameterized queries, not string interpolation."
Steering files load into context every turn automatically.

**What main-branch pstack does.** Steering enters context but no skill mentions
it. The agent might follow it, might not.

**What this branch does.** The `/how` skill and Investigation playbook explicitly
read steering first. The agent names the conventions and follows them.

**Example flow.**
```
You have: .kiro/steering/tech.md (says: callback-style DB, express-validator, no async/await)
You type:  /how does the supplier model layer work
Agent does: reads tech.md → explains using callback style, names the per-request connection pattern
Without this branch: might explain with async/await patterns from generic Express docs
```

### 3. Kiro Hooks

**What Kiro gives you.** JSON files in `.kiro/hooks/` that run an action at
specific moments. A `Stop` hook fires after every agent turn. You already have
one (`session-report.json`) that writes a report after each turn.

**What main-branch pstack does.** Nothing. The `show-me-your-work` skill writes
a decision trail by hand, and the agent has to remember to do it.

**What this branch does.** Ships `hooks/show-me-your-work.json`, a Stop hook that
writes the decision trail automatically. Install it once, the trail builds itself.

**Example flow.**
```
You install: cp hooks/show-me-your-work.json ~/.kiro/hooks/
You type:    /poteto-mode migrate the auth module (going to bed, trust it when I'm back)
Agent does:  works through the night, every turn appends a row to decisions.tsv automatically
You wake up: open decisions.tsv, see every decision, its evidence, and its result
Without this branch: agent writes the trail only when it remembers to
```

### 4. Kiro MCP Servers

**What Kiro gives you.** You declare external tool servers (Slack, Jira, GitHub)
in your agent config `mcpServers`. The agent can query them.

**What main-branch pstack does.** The `/why` skill says "discover MCPs from the
Cursor environment" which means nothing on Kiro.

**What this branch does.** `/why` reads MCP servers from the Kiro agent config
and queries each source to find evidence.

**Example flow.**
```
You have: mcpServers with GitHub configured in your agent
You type:  /why was the per-request DB connection chosen
Agent does: queries git history via GitHub MCP, finds the commit, cites the PR discussion
Without this branch: the prose says "inspect the mcps/ directory Cursor exposes", agent is confused
```

### 5. Model defaults that work out of the box

**What Kiro gives you.** Auto model selection. You pick a model or let Kiro
choose.

**What main-branch pstack does.** Some runner skills still carry Cursor model
names like `grok-4.7-xhigh-fast`. Kiro does not know these names. If you run
`/how` or `/arena` before running `/setup-pstack`, the subagent spawn fails with
a model-rejected error.

**What this branch does.** Every skill defaults to `auto` (use the parent chat
model). Works immediately after install. `/setup-pstack` lets you pin specific
models later if you want.

## Quick comparison

| | `main` branch | `kiro-core-feature-integration` branch |
|---|---|---|
| Specs | ignored | read before planning, acceptance criteria = done-check |
| Steering | enters context silently | skills name it and follow conventions |
| Hooks | manual decision trail | automatic Stop-hook trail |
| MCP | Cursor discovery prose | reads Kiro agent config |
| Model defaults | Cursor slugs that may reject | `auto` everywhere, works immediately |
| Cursor-ism cleanup | core loop only | deep, across all 51 skills |

Full per-file change list and verification record are in
[`docs/KIRO-INTEGRATION-REPORT.md`](docs/KIRO-INTEGRATION-REPORT.md). The usage
guide for all five features is in
[`docs/guide/11-kiro-integration.md`](docs/guide/11-kiro-integration.md).

---

The full [pstack](https://github.com/cursor/plugins/tree/main/pstack) prompt
engineering stack, ported to run on Kiro CLI. All 51 skills, 23 playbooks, and
the `poteto-agent` subagent role, wired for Kiro's skill discovery, subagent
tool, and steering files.

## What is pstack

pstack is a structured agent operating system. `/poteto-mode` is the router. You
give it a task, it matches a playbook, applies principles, delegates through
subagents, and writes verified work. The skills it routes to include:

| Skill | What it does |
|---|---|
| `/poteto-mode` | Router. Matches a task to a playbook and drives it. |
| `/how` | Explains how a subsystem works before you change it. |
| `/why` | Traces why a decision was made, with evidence. |
| `/teach` | Explains a body of work so you actually understand it. |
| `/recall` | Reconstructs your recent working context. |
| `/architect` | Parallel design exploration before implementing. |
| `/arena` | N parallel candidates at the same task, pick the best. |
| `/swarm` | Fan-out workers for coverage, races, exploration. |
| `/interrogate` | Multi-model adversarial review before shipping. |
| `/reflect` | Reviews a transcript and routes learnings to skill edits. |
| `/tdd` | Test-driven development when explicitly asked. |
| `/unslop` | Strips AI tells from prose. |
| `/no-comments` | Strips unnecessary comments before review. |
| `/technical-writing` | Layered writing standard for docs, PRs, commits. |
| `/bro` | Restates the last message in plain language. |
| `/correct` | Finds repeated mistakes and makes each one impossible. |
| `/blast-radius` | Finds what a change could break elsewhere. |
| `/show-me-your-work` | Decision trail for long or unattended work. |
| `/setup-pstack` | Picks which model each role uses. |
| `/automate-me` | Drafts a personal working-style skill. |
| `/figure-it-out` | Designs a bespoke playbook for anything. |
| `/benchmark-checklist` | Vets a perf measurement before acting. |
| `/create-verification-skill` | Generates a skill that drives the app like a user. |
| `/maintain-verification-skill` | Keeps a verification skill honest. |
| `/make-bot-ui` | Builds a dashboard with webhook-driven bots. |
| `/poteto-help` | Guides picking the right skill or playbook. |
| `/typescript-best-practices` | TypeScript rules for .ts/.tsx files. |

Plus 24 principle skills (`principle-laziness-protocol`,
`principle-fix-root-causes`, `principle-model-the-domain`, etc.) that ground
every decision.

## What changed from the Cursor version

Full detail in `.kiro/skills/poteto-mode/references/kiro-compat.md`.

| Cursor | Kiro |
|---|---|
| `Task` tool | `subagent` tool (DAG stages) |
| `subagent_type: "poteto-agent"` | stage `role: "poteto-agent"` |
| `~/.cursor/rules/*.mdc` (`alwaysApply`) | `.kiro/steering/*.md` (`inclusion: always`) |
| model slugs (`grok-4.7-xhigh-fast`) | Kiro model ids, or `auto` |
| `cursor-team-kit` (`/deslop`, `control-*`) | not present, degrade to manual |
| `AskQuestion` tool | prose question in the reply |

## Requirements

- **Kiro CLI** (`kiro-cli`) on PATH.
- **Node.js** for the verification harness.
- **`gh`** (optional) for PR playbooks.

## Install

### Global (all workspaces)

```bash
git clone https://github.com/auaii/Pstack-kiro-harness.git
cd Pstack-kiro-harness
chmod +x install.sh
./install.sh global
```

Copies all 51 skills to `~/.kiro/skills/` and the agent config to
`~/.kiro/agents/`, validates, and runs the harness. The agent config uses a
`~/...` path, so no path rewriting is needed.

### Workspace (one project)

From the project root:

```bash
/path/to/Pstack-kiro-harness/install.sh workspace
```

Installs into `./.kiro/skills/` and `./.kiro/agents/`. Workspace overrides global.
Note the agent `prompt` still points at the global `~/.kiro/skills/` path, so a
workspace install also needs the skills present globally, or edit that one path.

### Manual

The agent config uses `~/...` paths, so a plain copy works for a global install.

1. Copy everything under `.kiro/skills/` to `~/.kiro/skills/`.
2. Copy `.kiro/agents/poteto-agent.json` to `~/.kiro/agents/`.
3. Run `kiro-cli agent validate --path ~/.kiro/agents/poteto-agent.json`.

## Use

pstack skills work as slash commands in `kiro-cli chat`. After a global install,
every new chat session sees all 51 skills because the default agent inherits
`skill://~/.kiro/skills/*/SKILL.md`. Tab completion works (`/pote<Tab>` completes
to `/poteto-mode`). No agent switch is needed. See `docs/PORTING-SUMMARY.md` for
the chat verification record.

### Start the mode

```
/poteto-mode <your task>
```

The router reads the task, matches a playbook (Feature, Bug fix, Investigation,
Refactoring, Prototype, etc.), opens a todo list with that playbook's steps, and
works through them. Principles are applied at each decision point.

### Understand before changing

```
/how <subsystem>          # how does it work
/why <decision>           # why was it built this way
/teach <topic>            # explain it so I understand
/recall <work context>    # what was I working on
```

### Design before coding

```
/architect <feature>      # parallel design exploration
/arena <alternatives>     # N candidates, pick the best
/swarm <coverage target>  # fan-out for coverage or exploration
/interrogate              # multi-model adversarial review
```

### Build and clean

```
/tdd <feature>            # test-driven when requested
/unslop                   # strip AI tells from prose
/no-comments              # strip comments before review
/technical-writing        # writing standard for docs and PRs
```

### Configure models per role

```
/setup-pstack
```

Asks for a reasoning budget, writes `~/.kiro/steering/pstack-models.md`. Default
is `auto` (use the parent chat model). Pin specific Kiro model ids per role if
you have them.

### Verify the port

```bash
node ~/.kiro/skills/poteto-mode/scripts/verify-kiro-compat.mjs
```

26 assertions against real artifacts. Exits non-zero if any fail.

## Layout

```
Pstack-kiro-harness/
├── install.sh
├── .gitignore
├── README.md
└── .kiro/
    ├── agents/
    │   └── poteto-agent.json          # subagent role (template)
    └── skills/
        ├── poteto-mode/               # router, 23 playbooks, references, scripts
        ├── setup-pstack/              # per-role model config
        ├── how/                       # subsystem explainer
        ├── why/                       # decision tracer
        ├── architect/                 # parallel design
        ├── arena/                     # bakeoff
        ├── swarm/                     # fan-out
        ├── interrogate/               # adversarial review
        ├── reflect/                   # transcript learnings
        ├── principle-*/               # 19 grounding principles
        └── ... (51 skills total)
```

## Scope

This repo ships the complete pstack skill set. The `cursor-team-kit` plugin
(`/deslop`, `control-cli`, `control-ui`) and Cursor-cloud integrations (bugbot,
agentic security review) have no Kiro equivalent and degrade to manual. The
playbooks that drive `gh` work as written when `gh` is installed.

## License

Same as the upstream [cursor/plugins](https://github.com/cursor/plugins)
repository.
