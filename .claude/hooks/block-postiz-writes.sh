#!/usr/bin/env bash
# PreToolUse hook for read-only agents: block Postiz commands that publish,
# upload or delete. Posting goes through the social-poster agent.
if grep -qE 'postiz[^|;&]*(posts:(create|delete|connect)|upload)'; then
  echo "Blocked: this agent is read-only. Use the social-poster agent to post." >&2
  exit 2
fi
exit 0
