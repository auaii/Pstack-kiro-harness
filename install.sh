#!/usr/bin/env bash
# Install the full pstack skill set into a Kiro CLI environment.
# Idempotent: re-running overwrites the same targets to the same state.
#
# Global install copies .kiro/skills and .kiro/agents to ~/.kiro/ directly.
# The agent config uses ~/... paths so no path rewriting is needed.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCOPE="${1:-global}"

case "$SCOPE" in
  global)  TARGET_DIR="$HOME/.kiro" ;;
  workspace) TARGET_DIR="$PWD/.kiro" ;;
  *) echo "usage: $0 [global|workspace]" >&2; exit 2 ;;
esac

mkdir -p "$TARGET_DIR/skills" "$TARGET_DIR/agents"

count=0
for skill_dir in "$REPO_DIR"/.kiro/skills/*/; do
  skill_name="$(basename "$skill_dir")"
  rm -rf "${TARGET_DIR:?}/skills/$skill_name"
  cp -R "$skill_dir" "$TARGET_DIR/skills/$skill_name"
  count=$((count+1))
done

cp "$REPO_DIR/.kiro/agents/poteto-agent.json" "$TARGET_DIR/agents/poteto-agent.json"

echo "installed $count skills + poteto-agent to $TARGET_DIR/"

if command -v kiro-cli >/dev/null 2>&1; then
  kiro-cli agent validate --path "$TARGET_DIR/agents/poteto-agent.json" && echo "agent config validated" || echo "agent validation failed" >&2
fi

if command -v node >/dev/null 2>&1; then
  node "$TARGET_DIR/skills/poteto-mode/scripts/verify-kiro-compat.mjs" || true
fi
