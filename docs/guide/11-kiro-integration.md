# Use pstack with Kiro core features

The five integrations on the `kiro-core-feature-integration` branch wire pstack
into Kiro features that Cursor never had. This page shows how to use each one.

## Specs: ground a Feature or Bug fix in a Kiro spec

Kiro specs live in `.kiro/specs/<name>/` with `requirements.md`, `design.md`, and
`tasks.md`. The Feature and Bug fix playbooks now read the spec before planning.

How to use it. Create a spec, then run the playbook on it.

```text
/poteto-mode implement the student-search-filter spec. verify against its acceptance criteria.
```

What changes. The playbook reads `.kiro/specs/student-search-filter/` first,
treats each acceptance criterion as the done-check, and verifies the build
against them instead of inferring requirements from your prompt. When no spec
exists, it works as before.

Where it is wired. `playbooks/feature.md` and `playbooks/bug-fix.md`, as a
"Spec first" lead-in before step 1.

## Steering: respect project conventions automatically

Kiro steering files in `.kiro/steering/*.md` carry stack, structure, and gotcha
conventions. They load into context automatically, but now the skills name them.

How to use it. Nothing extra. With steering files present, run any investigation.

```text
/how does the supplier model layer work
```

What changes. `/how` and Investigation read `.kiro/steering/*.md` first, so the
explanation reflects your conventions (for example the callback-style DB access
and per-request connection in the workshop's `tech.md`) instead of generic
advice.

Where it is wired. `playbooks/investigation.md` step 1, and `how/SKILL.md`
Step 1.

## Hooks: automatic decision trail

`show-me-your-work` keeps a decision trail. On Kiro you can make it automatic
with a `Stop` hook that writes one row per turn.

How to use it. Install the shipped hook.

```bash
cp hooks/show-me-your-work.json ~/.kiro/hooks/
```

Or merge it into your agent config `hooks` section. After that, every turn with a
real decision appends a row to `decisions.tsv` without the agent being told.

What changes. The trail builds itself. The manual `scripts/log.sh` still works
for mid-turn entries.

Where it is wired. `hooks/show-me-your-work.json`, offered by
`show-me-your-work/SKILL.md`.

## MCP: query team evidence through Kiro mcpServers

The `/why` skill queries evidence categories (source control, issue tracker,
chat, observability) through MCP servers.

How to use it. Declare MCP servers in your agent config, then run `/why`.

```json
{
  "mcpServers": {
    "github": { "type": "registry", "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" } }
  }
}
```

```text
/why was the per-request DB connection chosen
```

What changes. `/why` reads MCP servers from the Kiro agent config and queries
each configured source. Run `/tools` to see what is loaded.

Where it is wired. `why/SKILL.md`, MCP discovery section.

## Models: no setup needed to start

The runner skills (how, why, arena, architect, interrogate, reflect) default
every model to `auto`, which runs on your parent chat model. An un-configured
install no longer sends a Cursor slug that Kiro rejects.

How to use it. Nothing. It works out of the box. To pin models per role, run
`/setup-pstack` and set real Kiro model ids.

Where it is wired. All six runner skills, plus the code playbooks.

## Summary

| Feature | Command | What you get |
|---|---|---|
| Specs | `/poteto-mode implement the <name> spec` | Acceptance criteria as the done-check |
| Steering | any `/how` or investigation | Conventions respected automatically |
| Hooks | `cp hooks/show-me-your-work.json ~/.kiro/hooks/` | Automatic decision trail |
| MCP | configure `mcpServers`, then `/why` | Team evidence queried per source |
| Models | works by default, `/setup-pstack` to pin | No rejected-slug errors |
