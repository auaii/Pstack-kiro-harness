# Kiro core feature integration

A proposal to deepen pstack's use of Kiro-native features that Cursor never had.
The current port makes pstack run on Kiro. This proposal makes pstack use Kiro.

This is a design document on the `kiro-core-feature-integration` branch. It
frames the work and designs the workflow. It does not implement. Each integration
below becomes its own change once the shape is agreed.

## Who this is for

The end user who runs `/poteto-mode` on Kiro and wants it to respect their specs,
steering, and hooks rather than ignore them. The maintainer who inherits a
pstack that speaks Kiro's language instead of translating Cursor's.

## Framing

### Definition of done

Each integration below ends in a falsifiable check. The whole lands when a
`/poteto-mode` run on a Kiro project with a spec, steering, and a hook uses all
three without being told to, proven by a live run.

### Scope, quantified

Five integrations. Four edit pstack prose (playbooks, skills). One adds a hook
config. No integration rewrites the pstack philosophy. Rough effort is small per
unit, since each is a targeted edit to an existing skill plus a verification.

### Rigor level

Medium. These are reversible edits to agent-facing markdown and one JSON hook.
No production data, no one-way door. The gate is a live `/poteto-mode` run per
integration plus the existing harness.

## The integration table

The domain is "Kiro feature to pstack integration point". One row per feature.

| Kiro feature | pstack integration point | What changes | Risk |
|---|---|---|---|
| Specs (`.kiro/specs/*/`) | Feature + Bug fix playbooks | Read `requirements.md`, `design.md`, `tasks.md` before `architect`; treat acceptance criteria as the verification target | low, additive step |
| Steering (`.kiro/steering/*.md`) | poteto-mode SKILL.md, how playbook | Name steering as a first-class context source; read it before investigation | low, additive |
| Hooks (`.kiro/hooks/*.json`) | show-me-your-work skill | Offer a `Stop` hook that writes the decision trail automatically | medium, new artifact |
| MCP servers | why skill | Replace Cursor MCP-discovery prose with Kiro `mcpServers` config guidance | low, prose |
| Model config | runner skills (how, reflect, arena, architect, interrogate) | Replace raw Cursor slugs with `auto` so an un-configured install does not send a rejected slug | low, prevents a real failure |

## Designed workflow

Five units, sequenced riskiest-unknown-first. Each is independently landable and
ends in a check. Build the verification first, per foundational-thinking.

### Unit 1: Specs integration (highest value)

Kiro specs carry structured requirements with acceptance criteria, as in the
workshop's `student-search-filter` spec. pstack's Feature playbook currently
starts from `how` then `architect`, inferring requirements from the prompt.

Change: add a step 0 to Feature and Bug fix playbooks. "If `.kiro/specs/<name>/`
exists for this work, read `requirements.md`, `design.md`, and `tasks.md` first.
Treat the acceptance criteria as the verification predicate." This grounds the
work in the spec instead of re-deriving it.

Check: run `/poteto-mode` on the workshop's `student-search-filter` spec and
confirm the run cites the acceptance criteria as its done-check.

### Unit 2: Steering integration

Steering files load into context automatically via `inclusion: always`, but no
playbook tells the agent they exist or to weigh them. The workshop's `tech.md`
names the callback-style DB convention and the `findById` injection gotcha.

Change: add a line to poteto-mode's investigation and how routing. "Read
`.kiro/steering/*.md` for project conventions before proposing a change. Steering
overrides generic defaults."

Check: run `/how` on the workshop app and confirm the explanation reflects the
steering conventions (callback style, per-request connection) rather than
generic Express advice.

### Unit 3: Hooks for the decision trail

`show-me-your-work` writes a TSV decision trail by hand. Kiro `Stop` hooks run an
agent action at the end of every turn, as the workshop's `session-report.json`
proves.

Change: ship an optional `hooks/show-me-your-work.json` that writes the trail on
`Stop`. The skill offers to install it instead of writing the trail manually.

Check: install the hook, run a task, confirm the trail file grows without the
agent being told to write it.

### Unit 4: MCP discovery for the why skill

The `why` skill says "discover available MCPs at runtime", which is Cursor
phrasing. Kiro declares MCP servers in agent config `mcpServers`.

Change: update the `why` skill to read MCP servers from the Kiro agent config and
name the Kiro way to add one (Slack, Jira, GitHub via `mcpServers`).

Check: with a GitHub MCP configured, run `/why` and confirm it queries the
source-control evidence category through the configured server.

### Unit 5: Model slug cleanup in runner skills

`how`, `reflect`, `arena`, `architect`, `interrogate` still carry raw Cursor
slugs (`grok-4.7-xhigh-fast`) in their runner config. Un-configured, a spawn
sends a slug Kiro rejects.

Change: replace raw slugs with `auto` in these five skills, matching what
`setup-pstack` already defaults to. The compat reference already documents this.

Check: grep the five skills for Cursor slugs, expect zero. Spawn a runner with no
`/setup-pstack` run and confirm no model-rejected error.

## Fan-out decision

Units 1, 2, 5 are independent prose edits across different skills. They can
parallelize across subagents, one per unit, each with its own branch. Unit 3 adds
a new file and Unit 4 edits one skill, both independent. No shared writes, so no
serialization needed, per separate-before-serializing-shared-state.

## What this does not do

It does not touch the pstack philosophy, playbooks structure, or principles. It
does not add planning skills (Kiro has plan mode; pstack defers to it). It does
not port Cursor-cloud tooling (bugbot, cursor-team-kit), which stays degraded.

## Delivery

Each unit lands as its own commit on this branch, verified before the next, per
sequence-verifiable-units. The branch merges to main only after a live
`/poteto-mode` run proves all five against the predicate.
