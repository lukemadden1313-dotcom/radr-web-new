# Handoff to Luke — Backend Integration Spec

**Project:** radr-web-new (web companion to Radr iOS at getradr.app)
**Web branch:** eli
**Last updated:** 2026-05-27

This is the single source of truth for everything Luke needs to wire the web app to Supabase. Web is built with mock data + iOS-aligned reference docs. Luke connects it to real backend.

---

## OPEN BACKLOG (Inherited)

These were on the original luke_backlog.md from the start of the web project. Carry over.

### 1. Broken avatar files in Supabase storage

**Status:** Identified, two-option fix offered to Luke, awaiting his pick.
**Issue:** Specific user avatar files (Kyrah, Danny, @whereinnyc, @kkrysp) return corrupt/tiny images from the Supabase storage transform endpoint. URLs load "successfully" so onError doesn't fire — they render as broken slivers.
**Two options:**
- **A:** Fix the corrupt avatar files in Supabase storage for affected users (cleanest)
- **B:** Tell me to add a defensive web-side check (`naturalWidth < 16` after load → gradient fallback)
**Where it shows up:** `/w-v2/[id]`, `/g-v2/[id]`, and presumably wherever else those users' avatars render. Web defensive check would cover all surfaces at once.

### 2. `get_group_for_deep_link` RPC expansion

**Status:** Asked, awaiting Luke. Blocks polished `/groups/[id]` page if we wire it to real data.
**Currently returns:** id, name, avatar_url, creator_id, conversation_id, created_at, updated_at, member_count.
**Needs to also return:**
1. `members[]` — array of `{ id, full_name, username, avatar_url }` for the avatar grid in The Crew. section
2. `upcoming_workouts[]` — next 3-5 workouts in this group, with `{ id, title, start_time, location }` so each can link to `/workouts/[id]`
3. `description` — if Group model supports it on iOS (verify during Groups audit)
**Blocking note:** RLS on `group_members` blocks anon reads. RPC likely needs SECURITY DEFINER.

---

## Architecture Decisions

### Reference Data Sync Strategy

Web and iOS currently have hardcoded reference data (activities, RSVP states, notification types, etc.). This drifts over time. Long-term plan:

**Approach 1 (target):** Reference data lives in Supabase. Both iOS and web fetch at runtime, cache locally for offline.

**Approach 3 (current):** Hardcoded in both codebases. Manual sync via `docs/ios-canonical/*.md` as the contract.

**Migration priority** (highest churn first):
1. Activities (`docs/ios-canonical/activities.md`)
2. Notification types
3. RSVP states
4. Group / Crew structure (especially the `get_group_for_deep_link` expansion above)
5. Other reference data as identified

Each migration: Luke creates Supabase table seeded from the canonical doc, builds `get_*()` RPC, iOS + web update to fetch from RPC.

### Messaging Strategy (Web Defers to App)

**Decision (2026-05-27):** Web does NOT have a messaging UI. The only messaging-related surface on web is `/messages/[conversation_id]`, which serves as a deep-link fallback (e.g. for iMessage shares of conversation links). That page shows a clean "Open in Radr app" landing instead of a chat surface.

**Rationale:** Messaging UX is mobile-first. Half-built web messaging would feel worse than no web messaging. Web's identity becomes clearer: web is for browsing, RSVPing, commenting, and sharing. The app is for messaging, notifications, and deeper social interaction.

**What Luke needs:**
- Universal Link URL scheme — confirm format for "open conversation [id]" deep link. Web buttons currently use placeholder `radr://conversation/{id}`. Update when confirmed.
- App Store URL — placeholder "#" on web. Replace when published.
- `get_conversation(id)` RPC — needed only for the deep-link fallback page to render the correct other-participant's avatar + name. Or this could pull from the existing share-link RPC pattern.

**What Luke does NOT need:**
- send_message, toggle_reaction, pin_conversation, mute_conversation, mark_read, delete_conversation, get_or_create_dm, get_conversations, get_messages_for_conversation. All deferred to iOS app.

### What Web Does Not Touch

- Auth (Luke building in parallel — magic links, Supabase Auth, redirects)
- Any Supabase RPC code
- The iOS repo (~/Radr-Mobile)
- Luke's existing share-link fallback routes: `/`, `/w/[id]`, `/g/[id]`, `/u/[username]`
- Luke's `src/app/page.tsx` (landing page, ~588 lines)
- Luke's `src/lib/supabase.ts` (singleton client)

### What Web Does Touch (and Luke Replaces)

- `src/lib/mock-data.ts` — Mock data file. Every consumer site is marked `// TODO: replace with [rpc_name] when backend ready`.
- `CURRENT_USER` constant in mock-data — becomes real session lookup from Supabase Auth.
- All client-side actions (RSVP, comment, friend request, etc.) are visual-only stubs awaiting RPC wiring.

---

## Routes Built on Web

| Route | Purpose | Status | Backend Dependencies |
|---|---|---|---|
| `/dashboard` | Logged-in home | Built | `get_dashboard_data` (workouts + groups + friends + stats) |
| `/workouts/[id]` | Workout detail | Built | `get_workout(id)`, `get_workout_activity(workout_id)` |
| `/groups/[id]` | Group detail | Built | Expanded `get_group_for_deep_link` (see Open Backlog #2) |
| `/profile/[username]` | Profile (self + other) | Built | `get_profile_by_username`, `get_mutual_friends`, `get_shared_workouts`, `get_workouts_hosted_by_user`, `get_workouts_user_could_join` |
| `/notifications` | Activity feed | Built | `get_notifications`, `mark_notification_read`, `mark_all_notifications_read` |
| `/schedule` | Month grid + day drawer | Built | `get_workouts_in_month(year, month)` |
| `/groups` | All your groups | Built | `get_user_groups` |
| `/settings` | Account settings | Built | `get_user_preferences`, `update_user_preference(key, value)` |
| `/create` | 3-step workout creation | Built (visual submit only) | `create_workout(input)` — see spec below |
| `/friends` | Friend search + requests + discover + your friends | Built | `search_users`, `get_incoming_friend_requests`, `get_outgoing_friend_requests`, `get_suggested_users`, `accept_friend_request`, `decline_friend_request`, `send_friend_request`, `unfriend` |
| `/messages/[id]` | Deep-link fallback (open-in-app landing) | Built | `getConversation(id)` — only needs participant name + avatar for display |
| `/w-v2/[id]` | Existing workout share page | Pre-existing | (unchanged) |
| `/g-v2/[id]` | Existing group share page | Pre-existing | (will benefit from RPC expansion in backlog #2) |

Existing Luke-owned share fallbacks (`/w/[id]`, `/g/[id]`, `/u/[username]`) untouched.

---

## Action Wiring Map (Visual-Only on Web → Luke Wires)

Every interactive button/action that needs a backend handler. Currently visual-only with `// TODO: wire ...` comments at the call site.

| Action | Page | Mock currently does | Luke needs |
|---|---|---|---|
| RSVP toggle (Going / + Join) | `/workouts/[id]` | nothing | `upsert_rsvp(workout_id, status)` |
| Comment post (workout) | `/workouts/[id]` | nothing | `post_comment(target_id, target_type, body)` |
| Comment post (group) | `/groups/[id]` | nothing | same RPC, target_type = 'group' |
| Friend request accept | `/notifications` | nothing | `accept_friend_request(request_id)` |
| Friend request decline | `/notifications` | nothing | `decline_friend_request(request_id)` |
| Mark all notifications read | `/notifications` | nothing | `mark_all_notifications_read` |
| Settings toggles (Push / Email / Public / Show Workouts) | `/settings` | nothing | `update_user_preference(key, value)` |
| Log out | `/settings` | nothing | Supabase Auth `signOut()` |
| Create workout (full submit) | `/create` | shows success state visually | `create_workout(input)` — see spec below |
| Tab switching (Upcoming/Invites/Yours) | `/dashboard` | nothing | client state + filtered fetches |
| Day selection on schedule | `/schedule` | hardcoded to today | client state + day filter |
| Avatar dropdown → Log out | top nav | nothing | Auth signOut |
| "+ Workout" with friend button | `/profile/[username]` (other view) | links to /create | should preselect friend invite if possible |
| Search users | `/friends` | filters mock data | `search_users(query)` RPC |
| Accept friend request | `/friends` | nothing | `accept_friend_request(request_id)` RPC |
| Decline friend request | `/friends` | nothing | `decline_friend_request(request_id)` RPC |
| Send friend request (Add) | `/friends` | nothing | `send_friend_request(user_id)` RPC |
| Unfriend | `/friends`, `/profile` | nothing | `unfriend(user_id)` RPC |

---

## RPC Specs Worth Noting

### `create_workout(input)` — full /create flow

Web form collects:
- `activity_key` (string, one of ACTIVITIES.key — see `docs/ios-canonical/activities.md`)
- `custom_activity_name` (string | null) — only when `activity_key === "other"`
- `title` (string, required)
- `description` (string | null)
- `start_date` (ISO date YYYY-MM-DD)
- `start_time` (string, e.g. "7:00 AM" — TODO: confirm iOS canonical format)
- `duration_minutes` (number; 30/45/60/90/120 currently — verify against iOS)
- `audience` (string: "All Friends" | "Specific Friends" | "Public")
- `specific_friend_ids` (UUID[] | null) — when audience = "Specific Friends"
- `location` (string | null) — required when audience = "Public"
- `booking_url` (string | null)
- `repeat` (string: "Never" | "Daily" | "Weekly" | "Monthly")
- `reminder` (string: "None" | "5 min" | "15 min" | "30 min" | "1 hour" | "1 day")
- `invite_user_ids` (UUID[] | null)

Returns: created workout ID + full workout object so web can redirect to `/workouts/[new_id]`.

Open question: does iOS already have an equivalent RPC? If yes, web should use the same one. Verify before duplicating.

### `get_notifications(user_id)` — feeds /notifications

Web expects each notification with:
- id (UUID)
- type (one of: `rsvp_yes`, `rsvp_maybe`, `friend_request`, `workout_invite`, `group_invite`, `workout_reminder`)
- actor (full MockUser shape — see web `MockUser` type)
- target_workout (MockWorkout shape | null)
- target_group (MockGroup shape | null)
- created_at (ISO timestamp — IMPORTANT: web's timeAgo helper returns "just now" for future-dated or sub-minute diffs, so DB timestamps should be UTC and accurate)
- unread (boolean)

Note: notification type names (`rsvp_yes` etc.) were invented for web mock data — verify against iOS NotificationType enum during Notifications audit.

---

## Reference Docs (Source of Truth)

All docs in `docs/ios-canonical/` are extracted from iOS code and represent the canonical spec for each concept:

- **activities.md** — 82 workout activities + favorites + Something else behavior
- More to come as we audit per-page (messages, friend states, notifications, group structure, profile fields, settings menu, color palette).

---

## Open Questions for Luke

- Does Supabase already have an `activities` table or are activities iOS-enum-only right now?
- How are notification types modeled in your current schema? (Need to verify the type names web invented.)
- What's your preferred RPC pattern vs. direct table access?
- Auth integration: should web use the same Supabase client setup as iOS, or a separate web-specific client?
- When CURRENT_USER becomes real session, what's the hook pattern (e.g. `useSession()` React context)?
- Does iOS already have a `create_workout` RPC web should reuse?
- Web invented helper names like `getMutualFriends`, `getSharedWorkouts`, `getWorkoutsUserCouldJoin` — do iOS-side equivalent RPCs exist with different names?
- Universal link URL scheme for opening conversations in the iOS app — web's `/messages/[id]` fallback page needs the correct `radr://` or universal link format.
- Friend states enum on web matches iOS — does Supabase model match (see `docs/ios-canonical/friends.md`)?
- "Suggested users" logic — what's the iOS algorithm (mutual connections? geo? activity overlap)? Web mock uses `mutual_friends_count` but doesn't compute the ranking.
