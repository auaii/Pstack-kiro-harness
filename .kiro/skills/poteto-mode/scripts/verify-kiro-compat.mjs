#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const skillDir = dirname(dirname(fileURLToPath(import.meta.url)));
const skillsRoot = dirname(skillDir);
const home = process.env.HOME;

let failed = 0;
function assert(ok, msg) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
  if (!ok) failed++;
}
function read(p) {
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

const setupSkill = join(skillsRoot, "setup-pstack", "SKILL.md");
const skillMd = join(skillDir, "SKILL.md");
const compatDoc = join(skillDir, "references", "kiro-compat.md");
const agentPath = join(home, ".kiro", "agents", "poteto-agent.json");

const coreLoop = {
  "poteto-mode/SKILL.md": skillMd,
  "setup-pstack/SKILL.md": setupSkill,
  "playbooks/feature.md": join(skillDir, "playbooks", "feature.md"),
  "playbooks/investigation.md": join(skillDir, "playbooks", "investigation.md"),
};

for (const [label, path] of Object.entries(coreLoop)) {
  const body = read(path);
  assert(body.length > 0, `core-loop file present: ${label}`);
  assert(!/~\/\.cursor\//.test(body), `${label} has no ~/.cursor/ path`);
  assert(!/\.mdc\b/.test(body), `${label} has no .mdc rule-file reference`);
}

assert(!/alwaysApply/.test(read(setupSkill)) && /inclusion: always/.test(read(setupSkill)),
  "setup-pstack uses Kiro steering frontmatter (inclusion: always, not alwaysApply)");
assert(/~\/\.kiro\/steering\/pstack-models\.md/.test(read(setupSkill)),
  "setup-pstack writes to ~/.kiro/steering/pstack-models.md");

assert(existsSync(compatDoc), "references/kiro-compat.md exists");
const compat = read(compatDoc);
for (const token of ["subagent", "role:", ".kiro/steering", "AskQuestion", "gh"]) {
  assert(compat.includes(token), `kiro-compat.md documents '${token}'`);
}

assert(existsSync(agentPath), "poteto-agent.json exists in ~/.kiro/agents/");
let cfg = null;
try { cfg = JSON.parse(read(agentPath)); } catch {}
assert(cfg && cfg.name === "poteto-agent", "poteto-agent.json is valid JSON named 'poteto-agent'");
assert(cfg && Array.isArray(cfg.resources) && cfg.resources.some(r => r.startsWith("skill://")),
  "poteto-agent.json loads skills via skill:// resources");

if (existsSync(agentPath)) {
  try {
    execFileSync("kiro-cli", ["agent", "validate", "--path", agentPath], { stdio: "pipe" });
    assert(true, "kiro-cli agent validate passes on poteto-agent.json");
  } catch (e) {
    assert(false, `kiro-cli agent validate: ${(e.stderr || e.stdout || e.message).toString().trim().split("\n")[0]}`);
  }
} else {
  assert(false, "kiro-cli agent validate skipped, poteto-agent.json missing");
}

const sub = read(skillMd).slice(read(skillMd).indexOf("## Subagents"));
assert(/role: "poteto-agent"/.test(sub), "SKILL.md Subagents section spawns via role: \"poteto-agent\"");
assert(/references\/kiro-compat\.md/.test(sub), "SKILL.md Subagents section points to kiro-compat.md");

console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
