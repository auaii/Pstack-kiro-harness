# Kiro compatibility

pstack was authored for Cursor. On Kiro CLI the philosophy, principles, playbook
steps, and reply discipline work unchanged. What differs is the runtime wiring
between that prose and the agent. This file is the translation table. When a
playbook names a Cursor mechanism, map it here.

## Translation table

| Cursor concept | Kiro equivalent | Notes |
|---|---|---|
| `Task` tool | `subagent` tool | DAG of stages. Each stage is `{name, role, prompt_template, depends_on?, model?}`. |
| `subagent_type: "poteto-agent"` | stage `role: "poteto-agent"` | Resolved against `~/.kiro/agents/poteto-agent.json`. |
| `subagent_type: generalPurpose` | stage `role: "poteto-agent"` or `"kiro_default"` | Some skills (how, why, reflect) spawn with `generalPurpose`. Use `poteto-agent` for pstack-styled delegates, or `kiro_default` for a plain worker. |
| `run_in_background: true` | default | Subagent stages run concurrently by dependency order. No flag. |
| file-pointer context | `prompt_template` text | Reference paths in the prompt; the role's own `resources` load skills. |
| model slug `grok-4.7-xhigh-fast` | stage `model` or omit | Omit to inherit the parent chat model (Auto). Set a real backend model id to pin. |
| model slug `claude-opus-5-5-xhigh` | stage `model` or omit | Same. Kiro model ids are backend ids, not Cursor slugs. |
| `~/.cursor/rules/*.mdc` (`alwaysApply`) | `.kiro/steering/*.md` (`inclusion: always`) | Steering files are the always-applied rule surface. |
| `cursor-team-kit` plugin (`/deslop`, `control-cli`, `control-ui`) | none | Degrade: apply unslop + technical-writing by hand; drive the CLI/UI yourself to verify. |
| `AskQuestion` tool | prose question | Ask in the reply. No shorthand token for the operator to type back. |
| `gh pr ...` / Origin | `gh` (default) | `gh` works on Kiro. Origin is absent here, so opening-a-pr's `gh` fallback applies. |

## Spawning a subagent on Kiro

A playbook that says "delegate to a `poteto-agent` subagent" becomes one
`subagent` call. One stage per delegate, a review stage depending on the
implementers.

```json
{
  "task": "<the overall task>",
  "stages": [
    {
      "name": "implement",
      "role": "poteto-agent",
      "prompt_template": "<consolidated scope: brief, file paths, named data shape, success criteria>"
    },
    {
      "name": "review",
      "role": "poteto-agent",
      "prompt_template": "Review the implementation of {task}. Run the build and tests. Report PASS or FAIL with specifics.",
      "depends_on": ["implement"]
    }
  ]
}
```

Model per role. Omit `model` to run on the parent chat model (the Auto user stays
on Auto). Set a stage `model` only when you have a real Kiro backend model id to
pin. The Cursor slugs in the skill text are defaults from the original harness,
not Kiro model ids.

## What does not port

Kiro subagents cannot spawn their own subagents. A playbook step that assumes a
nested fan-out collapses to the delegate owning the diff directly, which the
Feature step 4 escape ("a subagent forbidden to spawn satisfies this by owning
the diff directly") already allows.

The outer PR-automation playbooks (babysit, shipping, autopilot, orchestrate)
drive `gh`, which works. Their Cursor-cloud touches (bugbot, agentic security
review) have no Kiro equivalent. Treat those triggers as no-ops on Kiro and
review diffs yourself.
