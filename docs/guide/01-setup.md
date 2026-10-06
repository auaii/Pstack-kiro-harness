# Set up pstack on Kiro

In this page you install the skills, pick which models pstack uses, and run your
first task. This is the Kiro port, so the install differs from the upstream
Cursor instructions.

## Install the skills

From a clone of this repo:

```bash
./install.sh global
```

This copies all 51 skills to `~/.kiro/skills/` and the `poteto-agent` config to
`~/.kiro/agents/`, then validates and runs the harness. A workspace install
(`./install.sh workspace`) puts them under the current project instead.

Kiro has no `/add-plugin` command. The skills are plain `SKILL.md` files that
Kiro discovers through `skill://.kiro/skills/*/SKILL.md`, which the default agent
loads automatically.

## Pick your models

Run in a Kiro chat:

```text
/setup-pstack
```

`/setup-pstack` asks for a reasoning budget, shows each role (code delegates,
judgment, the review panels), and asks what you want. It writes
`~/.kiro/steering/pstack-models.md`, a steering file with `inclusion: always`
that every pstack skill reads. This replaces the Cursor `~/.cursor/rules/*.mdc`
rule.

On Kiro the default for every role is `auto`, which omits the subagent stage
`model` and runs the role on your parent chat model. Auto users stay on Auto.
Pin a role to a real Kiro backend model id only if you have one. Kiro model ids
are not Cursor slugs like `grok-4.7-xhigh-fast`, so the upstream slug defaults do
not apply here.

You only override what you care about. A role with no line keeps the default. To
restore a default, delete that role's line. A rerun keeps any role whose model
differs from the default.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a
colleague:

```text
/poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in,
the Feature playbook for this prompt. If `/poteto-mode` skips a step, the step
stays in the list with `skip: <reason>`.

## Keep pstack on across turns

To switch the whole chat to the poteto agent:

```text
/agent poteto-agent
```

This loads `poteto-mode` as the system prompt. For most work, invoking
`/poteto-mode` as a slash command from any agent is simpler and enough. Kiro has
no Cursor-style Option+Enter custom mode; the `/agent` switch is the equivalent.

## Keep the cost in check

pstack spends extra tokens on subagents and review panels. To spend fewer:

- Rerun `/setup-pstack` and pick a smaller reasoning budget.
- Keep roles at `auto` so they run on the chat's own model.
- Shorten a panel list. Each entry runs one subagent.
- Save `/poteto-mode` for work that needs rigor.

Next: [Route work through `/poteto-mode`](./02-poteto-mode.md).
