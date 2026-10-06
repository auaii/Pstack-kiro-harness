# Kiro core feature integration report

Branch: `kiro-core-feature-integration`
Base: `main` at commit `6353c56`

## What this branch does

Deepens pstack's use of five Kiro-native features that Cursor never had. The
main branch already makes pstack run on Kiro. This branch makes pstack use Kiro.

## Changes, one per unit

### Unit 1. Spec-aware playbooks

Files changed: `playbooks/feature.md`, `playbooks/bug-fix.md`.

Added a "Spec first" lead-in before step 1 in both playbooks. When
`.kiro/specs/<name>/` exists for the task, the playbook reads `requirements.md`,
`design.md`, and `tasks.md` first, then uses the acceptance criteria as the
verification predicate. When no spec exists, inference from the prompt works as
before.

### Unit 2. Steering-aware investigation and how

Files changed: `playbooks/investigation.md`, `how/SKILL.md`.

Investigation step 1 now reads `.kiro/steering/*.md` for project conventions
before routing to `/how`. The how skill reads steering at the start of Step 1
before assessing complexity. This grounds explanations in the real codebase
conventions (stack, structure, gotchas) instead of generic advice.

### Unit 3. Automatic decision trail via Stop hook

Files created: `hooks/show-me-your-work.json`.
Files changed: `show-me-your-work/SKILL.md`.

Ships a Kiro `Stop` hook that appends one decision-log row per turn to
`decisions.tsv`. The show-me-your-work skill now offers to install the hook
instead of writing the trail manually. The hook fires automatically. Manual
logging via `scripts/log.sh` still works alongside it.

### Unit 4. MCP discovery retargeted to Kiro

Files changed: `why/SKILL.md`, `show-me-your-work/SKILL.md`.

Replaced the Cursor MCP-discovery prose ("inspect the `mcps/` directory Cursor
exposes") with Kiro agent config guidance ("MCP servers are declared in
`mcpServers`"). Fixed the `readonly/Ask mode` term to a Kiro-generic phrasing.
Fixed the `~/.cursor/projects/*/` transcript path in show-me-your-work.

### Unit 5. Model slug cleanup (deep)

Files changed: 6 runner skills (`how`, `reflect`, `arena`, `architect`,
`interrogate`, `why`), 6 playbooks (`feature`, `bug-fix`, `multi-phase-plan`,
`hillclimb`, `perf-issue`, `refactoring`), `swarm`, and 8 other skill files
(`reflect/references/*`, `recall`, `poteto-help`, `automate-me`,
`create-verification-skill`, `maintain-verification-skill`,
`session-pickup`, `eval`, `worktree-cleanup`, `worktree-audit.sh`,
`make-bot-ui`).

Replaced every Cursor model slug (`grok-4.7-xhigh-fast`, `claude-opus-5-5-xhigh`)
with `auto` so un-configured spawns no longer send a slug Kiro rejects. Replaced
every `~/.cursor/` path variant (`.cursor/skills/`, `.cursor/projects/`,
`.cursor/worktrees/`, `.cursor/plugins/`, `.cursor/automations/`) with `.kiro/`
equivalents. Replaced `pstack-models.mdc` with `pstack-models.md`, `Task tool`
with `subagent tool`, `subagent_type: generalPurpose` with `role: "poteto-agent"`.
Added a Kiro degrade note to `make-bot-ui` for the Cursor-cloud webhook.

## Verification

- Harness `verify-kiro-compat.mjs`: ALL PASS (26/26 assertions).
- Slug sweep (`grep -rln "grok-4.|claude-opus-5" .kiro/skills/`): clean except
  the intentional `kiro-compat.md` translation table.
- `.cursor` sweep (`grep -rln ".cursor" .kiro/skills/`): clean except
  `make-bot-ui` (`api2.cursor.sh` URL, Cursor-cloud service, intentional with
  Kiro note) and intentional compat doc + harness regex.

## Commits on this branch

1. `7a76c3f` docs(pstack): propose Kiro core feature integration
2. feat(pstack): make Feature and Bug fix playbooks spec-aware
3. feat(pstack): make investigation and how steering-aware
4. feat(pstack): add Stop-hook for automatic decision trail
5. feat(pstack): retarget why skill MCP discovery to Kiro mcpServers
6. feat(pstack): replace Cursor slugs with auto in runner skills
7. fix(pstack): deep cleanup Cursor paths and slugs across all skills
8. docs(pstack): guide page 11 + this report

## Not done on this branch

- Not pushed to main (per operator instruction).
- `make-bot-ui` webhook URL stays Cursor-cloud (`api2.cursor.sh`); no Kiro
  equivalent exists.
- `cursor-team-kit` (`/deslop`, `control-*`) stays degraded.
- Outer PR-automation playbooks (babysit, shipping, autopilot) keep `gh`
  references which work on Kiro.
