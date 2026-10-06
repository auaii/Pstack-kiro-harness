# Pstack for Kiro 

The full [pstack](https://github.com/cursor/plugins/tree/main/pstack) prompt
engineering stack, ported to run on Kiro CLI. All 54 skills, 23 playbooks, and
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
| `/grill-me`, `/grilling` | Stress-tests a plan or design. |
| `/benchmark-checklist` | Vets a perf measurement before acting. |
| `/create-verification-skill` | Generates a skill that drives the app like a user. |
| `/maintain-verification-skill` | Keeps a verification skill honest. |
| `/make-bot-ui` | Builds a dashboard with webhook-driven bots. |
| `/poteto-help` | Guides picking the right skill or playbook. |
| `/using-superpowers` | Ensures skills are invoked before acting. |
| `/typescript-best-practices` | TypeScript rules for .ts/.tsx files. |

Plus 19 principle skills (`principle-laziness-protocol`,
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

Copies all 54 skills to `~/.kiro/skills/`, writes
`~/.kiro/agents/poteto-agent.json` with the real skill path, validates, and runs
the harness.

### Workspace (one project)

From the project root:

```bash
/path/to/Pstack-kiro-harness/install.sh workspace
```

Installs into `./.kiro/skills/` and `./.kiro/agents/`. Workspace overrides global.

### Manual

1. Copy everything under `.kiro/skills/` to `~/.kiro/skills/`.
2. Copy `.kiro/agents/poteto-agent.json` to `~/.kiro/agents/`.
3. In that copy, replace `__PSTACK_SKILL_PATH__` with the absolute path to the
   installed `poteto-mode/SKILL.md`.
4. Run `kiro-cli agent validate --path ~/.kiro/agents/poteto-agent.json`.

## Use

pstack skills work as slash commands in `kiro-cli chat`. After a global install,
every new chat session sees all 54 skills because the default agent inherits
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
/grill-me <plan>          # stress-test a plan
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
        └── ... (54 skills total)
```

## Scope

This repo ships the complete pstack skill set. The `cursor-team-kit` plugin
(`/deslop`, `control-cli`, `control-ui`) and Cursor-cloud integrations (bugbot,
agentic security review) have no Kiro equivalent and degrade to manual. The
playbooks that drive `gh` work as written when `gh` is installed.

## License

Same as the upstream [cursor/plugins](https://github.com/cursor/plugins)
repository.
