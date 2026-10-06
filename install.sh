#!/usr/bin/env bash
# Install the full pstack skill set into a Kiro CLI environment.
# Idempotent: re-running overwrites the same targets to the same state.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCOPE="${1:-global}"

case "$SCOPE" in
  global)  SKILLS_DIR="$HOME/.kiro/skills"; AGENTS_DIR="$HOME/.kiro/agents" ;;
  workspace) SKILLS_DIR="$PWD/.kiro/skills"; AGENTS_DIR="$PWD/.kiro/agents" ;;
  *) echo "usage: $0 [global|workspace]" >&2; exit 2 ;;
esac

mkdir -p "$SKILLS_DIR" "$AGENTS_DIR"

count=0
for skill_dir in "$REPO_DIR"/.kiro/skills/*/; do
  skill_name="$(basename "$skill_dir")"
  rm -rf "${SKILLS_DIR:?}/$skill_name"
  cp -R "$skill_dir" "$SKILLS_DIR/$skill_name"
  count=$((count+1))
done

SKILL_PATH="$SKILLS_DIR/poteto-mode/SKILL.md"
sed "s#__PSTACK_SKILL_PATH__#$SKILL_PATH#" \
  "$REPO_DIR/.kiro/agents/poteto-agent.json" > "$AGENTS_DIR/poteto-agent.json"

echo "installed $count pstack skills to $SKILLS_DIR"
echo "installed poteto-agent to $AGENTS_DIR/poteto-agent.json"

if command -v kiro-cli >/dev/null 2>&1; then
  kiro-cli agent validate --path "$AGENTS_DIR/poteto-agent.json" && echo "agent config validated" || echo "agent validation failed" >&2
fi

if command -v node >/dev/null 2>&1; then
  node "$SKILLS_DIR/poteto-mode/scripts/verify-kiro-compat.mjs" || true
fi
