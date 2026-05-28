# Polish Backlog

**Status:** Non-blocking visual polish items found during QA. Not in current sprint.
**Last updated:** 2026-05-28

## Dashboard
- Richer tab system: add Hosting + Attended tabs with counts (Partiful has Upcoming/Invites/Hosting/Attended; we have Upcoming/Invites/Yours)
- Tab switching is currently a TODO — needs client-side state + filtered fetches

## Profile
- Profile badges: redesign flat stat rectangles (Workouts / Day Streak / Hosted) as glowing badge objects — see docs/future-gamification.md for full spec

## Groups
- Group search on /groups is visual-only (non-interactive placeholder) — wire client-side filter
- "Create workout" link inside empty-state group detail still links to /create — should ideally pre-select the group

## Schedule
- Day selection on month grid is hardcoded to today — needs client-side state

## Notifications
- Mark all as read button is a no-op — needs RPC wiring
- Accept/Decline friend request buttons on notification cards are no-ops

## General
- Avatar menu dropdown "Log out" is a no-op (separate from settings log out which works)
- Mobile responsiveness audit not yet done — pages look good on desktop/tablet, untested on small phones
