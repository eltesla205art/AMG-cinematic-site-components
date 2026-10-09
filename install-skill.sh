#!/usr/bin/env bash
# Install the cinematic-modules skill globally for Claude Code (~/.claude/skills),
# bundling all module demos so it works from any project.
set -euo pipefail
REPO="$(cd "$(dirname "$0")" && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/cinematic-modules"

mkdir -p "$DEST/modules"
cp "$REPO/.claude/skills/cinematic-modules/SKILL.md" "$DEST/SKILL.md"
cp "$REPO"/*.html "$DEST/modules/"
echo "Installed cinematic-modules skill to $DEST ($(ls "$DEST/modules" | wc -l | tr -d ' ') files)"
echo "Use it in Claude Code: /cinematic-modules <describe your site>"
