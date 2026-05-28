# Handoff to Luke — Backend Integration Spec

**Project:** radr-web-new (web companion to Radr iOS at getradr.app)
**Web branch:** eli
**Last updated:** 2026-05-28

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
- App Store URL — now wired to `https://apps.apple.com/us/app/radr-calendar/id6758311100`.
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
| `/groups/[id]/members` | Full member list for a crew | Built | Same group RPC — members array |
| `/profile/[username]` | Profile (self + other) | Built | `get_profile_by_username`, `get_mutual_friends`, `get_shared_workouts`, `get_workouts_hosted_by_user`, `get_workouts_user_could_join` |
| `/profile/edit` | Edit profile (4 fields) | Built | `updateProfile(username, full_name, bio, avatar_url)` |
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
- type (one of iOS's 13 NotificationCategory values: `friend_request`, `friend_request_accepted`, `upcoming_activity`, `workout_update`, `workout_invite`, `friend_workout`, `workout_join`, `workout_reaction`, `workout_comment`, `new_message`, `calendar_error`, `profile_view`, `general`)
- message (pre-rendered string — display directly, do NOT assemble from type + actor. **IMPORTANT for RSVP notifications:** include status emoji inline: "Name rsvp'd Going 👍 to Workout Title", "Name rsvp'd Maybe 🤔 to ...", "Name rsvp'd Can't Go 😢 to ...". Web renders this as-is for at-a-glance scanning.)
- actor_id (UUID string | null — resolve avatar via profile lookup)
- entity_id (UUID string | null — canonical target: workout ID, profile ID)
- related_id (UUID string | null — context-dependent: conversation ID, etc.)
- is_read (boolean — NOTE: was previously `unread` with inverted semantics)
- created_at (ISO timestamp — IMPORTANT: web's timeAgo helper returns "just now" for future-dated or sub-minute diffs, so DB timestamps should be UTC and accurate)

---

## Reference Docs (Source of Truth)

All docs in `docs/ios-canonical/` are extracted from iOS code and represent the canonical spec for each concept:

- **activities.md** — 82 workout activities + favorites + Something else behavior
- **messages.md** — Message types, WORKOUT_CARD encoding, jumbomoji, reactions
- **friends.md** — Friend states, FriendshipDTO, request flow
- **workouts.md** — WorkoutDTO, ParticipantProfile, CreateWorkoutDTO
- **notifications.md** — 13 NotificationCategory types, AppNotification struct
- **groups.md** — GroupDTO, GroupMemberDTO, conversation link
- **profiles.md** — User + Profile structs, editable fields, stats

All 7 canonical docs complete. See section 6 below for divergence table status.

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

---

## 🔧 COMPLETE BACKEND WORK REQUIRED (Authoritative)

*Generated by full codebase sweep on 2026-05-27. This is the definitive list. Every item below is currently mocked or optimistic-only on web and needs real backend wiring.*

### 1. Session / Auth

**`CURRENT_USER` constant** (`src/lib/mock-data.ts:98`) → real authenticated session via Supabase Auth.

Files that read `CURRENT_USER` (every one must switch to session context):

| File | Usage |
|---|---|
| `src/app/dashboard/page.tsx` | isUserGoing check, host check, firstName, avatar in nav |
| `src/app/workouts/[id]/page.tsx` | participant check, comment author avatar |
| `src/app/groups/[id]/page.tsx` | member check, user lookup fallback, comment author avatar |
| `src/app/schedule/page.tsx` | nav avatar, workout filter |
| `src/app/settings/page.tsx` | profile display (name, username, avatar link) |
| `src/app/profile/[username]/page.tsx` | isSelf check, attending workouts filter |
| `src/lib/mock-data.ts` | used in getAllKnownUsers, getMutualFriends, getSharedWorkouts, getWorkoutsUserCouldJoin, getOtherParticipant, findDMWith, conversations/messages data |

Additionally, `src/components/layout/avatar-menu.tsx` hardcodes avatar initial "E" and links to `/profile/eli` — must read from session.

**What's needed:** Auth context provider (e.g. `useSession()` hook), replace every `CURRENT_USER` read, protect routes behind auth.

### 2. Data Fetching RPCs (read)

| Mock helper | Defined at | Used by | RPC needed | Returns |
|---|---|---|---|---|
| `MOCK_WORKOUTS` (constant) | mock-data.ts | `/dashboard`, `/workouts/[id]`, `/schedule`, `/profile/[username]` | `get_workouts_for_user`, `get_workout(id)` | `MockWorkout` shape: id, creator_id, creator_username, creator_full_name, creator_avatar_url, title, category, start_time, duration, location?, description?, open_to_join, booking_url?, group_id?, participants (WorkoutParticipant[]), cover_image_url? (web-only), cover_gradient? (web-only) |
| `MOCK_GROUPS` (constant) | mock-data.ts:215 | `/dashboard`, `/groups`, `/groups/[id]`, `/workouts/[id]` | `get_user_groups`, expanded `get_group_for_deep_link` | `MockGroup` shape: id, name, description, avatar_url, cover_photo_url, cover_gradient, member_count, members (MockUser[]), upcoming_workouts (MockWorkout[]), creator_id |
| `MOCK_NOTIFICATIONS` (constant) | mock-data.ts | `/notifications`, `/schedule` (unread count) | `get_notifications(user_id)` | `MockNotification` shape: id, type (NotificationType), message, actor_id?, entity_id?, related_id?, is_read, created_at |
| `MOCK_RECOMMENDATIONS` (constant) | mock-data.ts:663 | `/dashboard` | `get_recommendations(user_id)` | `MockRecommendation` shape: workout (MockWorkout), reason (string) |
| `MOCK_INVITES` (constant) | mock-data.ts:687 | `/dashboard` | `get_pending_invites(user_id)` | MockWorkout[] |
| `MOCK_FRIENDS` (constant) | mock-data.ts:111 | `/friends`, `/groups/[id]` | `get_friends(user_id)` | MockUser[] |
| `USER_STATS` (constant) | mock-data.ts:696 | `/dashboard` (not currently rendered but exported) | `get_user_stats(user_id)` | `{ friends, groups, workouts_this_month }` |
| `FRIEND_REQUESTS_COUNT` (constant) | mock-data.ts:702 | `/dashboard` | counted from `get_incoming_friend_requests` | number |
| `DISCOVERABLE_FRIENDS` (constant) | mock-data.ts:704 | `/dashboard` | derived from `get_suggested_users` | `{ count, preview_avatars }` |
| `getUserByUsername(username)` | mock-data.ts:871 | `/profile/[username]` | `get_profile_by_username(username)` | MockUser \| undefined |
| `getAllKnownUsers()` | mock-data.ts:845 | `getUserByUsername`, `searchUsers` | not needed when real RPCs exist | MockUser[] |
| `getMutualFriends(user)` | mock-data.ts:879 | `/profile/[username]` | `get_mutual_friends(user_id, other_user_id)` | MockUser[] |
| `getSharedWorkouts(user)` | mock-data.ts:886 | `/profile/[username]` | `get_shared_workouts(user_id, other_user_id)` | MockWorkout[] |
| `getWorkoutsHostedByUser(user)` | mock-data.ts:895 | `/profile/[username]` | `get_workouts_hosted_by(user_id)` | MockWorkout[] |
| `getWorkoutsUserCouldJoin(user)` | mock-data.ts:900 | `/profile/[username]` | `get_workouts_user_could_join(current_user_id, other_user_id)` | MockWorkout[] |
| `getIncomingFriendRequests()` | mock-data.ts:795 | `/friends` | `get_incoming_friend_requests(user_id)` | MockFriendRequest[] (id, user, mutual_friends_count, created_at) |
| `getOutgoingFriendRequests()` | mock-data.ts:800 | `/friends` | `get_outgoing_friend_requests(user_id)` | MockFriendRequest[] |
| `getSuggestedUsers()` | mock-data.ts:805 | `/friends` | `get_suggested_users(user_id)` | MockSuggestedUser[] (user, mutual_friends_count, mutual_friend_avatars) |
| `searchUsers(query)` | mock-data.ts:784 | `/friends` | `search_users(query)` | MockUser[] |
| `getFriendStatus(userId)` | mock-data.ts:810 | `/friends` | `get_friend_status(current_user_id, other_user_id)` | FriendStatus: "none" \| "request_sent" \| "request_received" \| "friends" |
| `getConversation(id)` | mock-data.ts:1182 | `/messages/[conversation_id]` | `get_conversation(id)` — only needs participant name + avatar | MockConversation |
| `getOtherParticipant(conv)` | mock-data.ts:1193 | `/messages/[conversation_id]` | derived from conversation participants | MockUser |
| `coverPhotoForActivity(activity)` | mock-data.ts:834 | `/workouts/[id]`, `/groups/[id]` | Static map — can stay client-side or move to DB | string (Unsplash URL) |
| `ACTIVITIES` (constant) | mock-data.ts:920 | `/create` | Could stay hardcoded or `get_activities()` table | Activity[] (key, displayName, icon) |
| `getSuggestedActivities()` | mock-data.ts:1005 | `/create` | client-side or `get_popular_activities(user_id)` | Activity[] |
| `getActivityByKey(key)` | mock-data.ts:1012 | `/create` | client-side lookup from ACTIVITIES | Activity \| undefined |

### 3. Action RPCs (write)

| Action | Page | Current behavior | RPC needed | Notes |
|---|---|---|---|---|
| RSVP toggle (Going / + Join) | `/workouts/[id]` | Nothing (TODO at line 314) | `upsert_rsvp(workout_id, status)` | |
| Comment post (workout) | `/workouts/[id]` | Nothing (TODO at line 510) | `post_comment(target_id, target_type, body)` | |
| Comment post (group) | `/groups/[id]` | Nothing (TODO at line 536) | Same RPC, target_type = 'group' | |
| More menu (workout) | `/workouts/[id]` | Nothing (TODO at line 231) | `report_workout`, `share_workout` | |
| Calendar add (workout) | `/workouts/[id]` | Nothing (TODO at line 347) | Client-side .ics download or Google Calendar link | |
| Share (workout) | `/workouts/[id]` | Nothing (TODO at line 358) | Web Share API / copy link | |
| Notifications toggle (workout) | `/workouts/[id]` | Nothing (TODO at line 366) | `toggle_workout_notifications(workout_id)` | |
| Join/leave group | `/groups/[id]` | Nothing (TODO at line 306) | `join_group(group_id)` / `leave_group(group_id)` | |
| Calendar sync (group) | `/groups/[id]` | Nothing (TODO at line 341) | Client-side .ics or subscription link | |
| Share (group) | `/groups/[id]` | Nothing (TODO at line 352) | Web Share API / copy link | |
| Notifications toggle (group) | `/groups/[id]` | Nothing (TODO at line 360) | `toggle_group_notifications(group_id)` | |
| More menu (group) | `/groups/[id]` | Nothing (TODO at line 367) | `report_group`, `leave_group` | |
| Create group | `/groups` | App-only — links to App Store (crew creation deferred to iOS) | `create_group(input)` lives in iOS only for now | |
| Filter groups | `/groups` | Nothing (TODO at line 148) | Client-side state | |
| Accept friend request | `/notifications` | Nothing (TODO at line 254) | `accept_friend_request(request_id)` | |
| Decline friend request | `/notifications` | Nothing (TODO at line 261) | `decline_friend_request(request_id)` | |
| Mark all notifications read | `/notifications` | Nothing (TODO at line 316) | `mark_all_notifications_read(user_id)` | |
| Settings toggles | `/settings` | Nothing (TODO at line 81) | `update_user_preference(key, value)` | Push, Email, Public Profile, Show Workouts |
| Log out | `/settings` | Nothing (TODO at line 563) | Supabase Auth `signOut()` | |
| Log out (avatar dropdown) | top nav | Nothing (TODO in avatar-menu.tsx:87) | Supabase Auth `signOut()` | |
| Edit profile | `/profile/[username]` | Nothing (TODO at line 250) | `update_profile(fields)` | |
| + Workout with friend | `/profile/[username]` | Links to /create (TODO at line 270) | Should preselect friend invite | |
| Create workout submit | `/create` | Shows success screen (TODO at line 188) | `create_workout(input)` | See RPC spec in doc |
| Date picker | `/create` | Nothing (TODO at line 418) | Client-side date picker component | |
| Time picker | `/create` | Nothing (TODO at line 431) | Client-side time picker component | |
| Location autocomplete | `/create` | Nothing (TODO at line 527) | Google Places API | |
| Invite picker | `/create` | Nothing (TODO at line 590) | `get_friends(user_id)` + multi-select UI | |
| Share created workout | `/create` | Nothing (TODO at line 646) | Web Share API / copy link | |
| Search users | `/friends` | Filters mock data client-side | `search_users(query)` | |
| Send friend request | `/friends` | Optimistic → "Requested" (TODO at line 239) | `send_friend_request(user_id)` | |
| Accept friend request | `/friends` | Optimistic row removal (TODO at line 244) | `accept_friend_request(request_id)` | |
| Decline friend request | `/friends` | Optimistic row removal (TODO at line 249) | `decline_friend_request(request_id)` | |
| Tab switching (Upcoming/Invites/Yours) | `/dashboard` | Nothing (TODO at line 485) | Client-side state + filtered fetches | |

### 4. Optimistic-only actions (reset on reload)

These currently fake success client-side with no persistence. They need real RPCs + error handling:

| Action | Page | Component | What happens now |
|---|---|---|---|
| Send friend request (+ Add) | `/friends` | `friends-content.tsx` | Adds userId to local `addedUserIds` Set → button changes to "Requested" pill |
| Accept friend request | `/friends` | `friends-content.tsx` | Adds requestId to local `dismissedRequestIds` Set → row disappears, count decrements |
| Decline friend request | `/friends` | `friends-content.tsx` | Same as accept — row disappears via `dismissedRequestIds` |
| Create workout | `/create` | `page.tsx` | Shows success screen with confetti + "View Workout" link → no actual DB insert |

### 4b. Stubbed UI actions (honest stubs — need wiring)

*Added 2026-05-28.* These are elements that were previously dead (no handler / `href="#"`) and are now honest stubs. Three treatment types: **open-in-app** (opens modal with deep link + App Store fallback), **optimistic** (visual state change, resets on reload), **real link** (actual working URL).

| Element | Page | Treatment | What it does now | RPC needed |
|---|---|---|---|---|
| Create crew (dashboard) | `/dashboard` | open-in-app | Opens "Crews are made in the app" modal | `create_group(input)` — iOS only for now |
| Create crew (groups list, 2 buttons) | `/groups` | open-in-app | Same modal | Same |
| Calendar icon (workout) | `/workouts/[id]` | optimistic | Shows green checkmark for 2s | `add_to_calendar` / .ics download |
| Share icon (workout) | `/workouts/[id]` | optimistic | Copies URL to clipboard, green checkmark 2s | Web Share API / copy link |
| Bell icon (workout) | `/workouts/[id]` | optimistic | Toggles filled/outline bell (cobalt) | `toggle_workout_notifications(workout_id)` |
| Calendar icon (group) | `/groups/[id]` | optimistic | Shows green checkmark for 2s | Calendar sync |
| Share icon (group) | `/groups/[id]` | optimistic | Copies URL, green checkmark 2s | Web Share API |
| Bell icon (group) | `/groups/[id]` | optimistic | Toggles filled/outline bell (green) | `toggle_group_notifications(group_id)` |
| Join/Leave pill (group) | `/groups/[id]` | optimistic | Toggles "Joined" ↔ "+ Join Crew" | `join_group` / `leave_group` |
| Settings toggles (4) | `/settings` | optimistic | Visual on/off, resets on reload | `update_user_preference(key, value)` |
| Calendar Sync row | `/settings` | open-in-app | Opens "Calendar Sync lives in the app" modal | Deep link `radr://settings/calendar` |
| Blocked Users row | `/settings` | open-in-app | Opens "Blocked Users lives in the app" modal | Deep link `radr://settings/blocked` |
| Log out button | `/settings` | two-tap confirm | First tap: "Tap again to confirm", second: redirects to `/` | Supabase Auth `signOut()` |
| Instagram link | `/settings` | real link | Opens `https://instagram.com/getradr` | — |
| TikTok link | `/settings` | real link | Opens `https://tiktok.com/@getradr` | — |
| X (Twitter) link | `/settings` | real link | Opens `https://x.com/getradr` | — |
| Contact Us | `/settings` | real link | Opens `mailto:getradrapp@gmail.com` | — |
| Terms of Service | `/settings` | real link | Links to `/terms.html` | — |
| Privacy Policy | `/settings` | real link | Links to `/privacy.html` | — |
| Cookie Policy | `/settings` | real link | Links to `/cookies.html` | — |
| "Get the app" link | `/messages/[id]` | real link | Links to App Store | — |
| RSVP (workout) | `/workouts/[id]` | optimistic | 3-way picker updates Who's Going + feed | `upsert_rsvp(workout_id, status)` |
| Comment (workout) | `/workouts/[id]` | optimistic | Prepends to feed, clears input | `post_comment(workout_id, body)` |
| Comment (group) | `/groups/[id]` | optimistic | Prepends to feed, clears input | `post_comment(group_id, 'group', body)` |
| Edit profile save | `/profile/edit` | optimistic | Shows "Saved ✓", redirects to profile (no persistence) | `updateProfile(username, full_name, bio, avatar_url)` |

### 5. Placeholder URLs / external links

| Placeholder | File | Current value | Status |
|---|---|---|---|
| "Don't have the app? Get it" link | `src/app/messages/[conversation_id]/page.tsx` | App Store URL | **FIXED** |
| Open conversation in app | `src/app/messages/[conversation_id]/open-in-radr-button.tsx` | `radr://conversation/${conversationId}` | Confirm universal link URL scheme with Luke |
| Open workout in app | `src/app/w/[id]/page.tsx:343` | `radr://w/${id}` | Confirm universal link scheme |
| Open profile in app | `src/app/u/[username]/page.tsx:162` | `radr://u/${username}` | Confirm universal link scheme |
| Open group in app | `src/app/g/[id]/page.tsx:164` | `radr://g/${id}` | Confirm universal link scheme |
| Calendar Sync | `/settings` | open-in-app modal | **FIXED** — deep link `radr://settings/calendar` |
| Blocked Users | `/settings` | open-in-app modal | **FIXED** — deep link `radr://settings/blocked` |
| Instagram link | `/settings` | `https://instagram.com/getradr` | **FIXED** |
| TikTok link | `/settings` | `https://tiktok.com/@getradr` | **FIXED** |
| X (Twitter) link | `/settings` | `https://x.com/getradr` | **FIXED** |
| Contact Us | `/settings` | `mailto:getradrapp@gmail.com` | **FIXED** |
| Terms of Service | `/settings` | `/terms.html` | **FIXED** |
| Privacy Policy | `/settings` | `/privacy.html` | **FIXED** |
| Cookie Policy | `/settings` | `/cookies.html` | **FIXED** |
| Footer social links | `src/components/layout/footer.tsx:33` | Real URLs (instagram, tiktok, x) | TODO comment says "Update hrefs when social accounts are confirmed" — verify handles are final |

### 6. Known data shape contracts

Canonical docs in `docs/ios-canonical/`:

| Doc | Covers | Status |
|---|---|---|
| `activities.md` | 82 workout activities, keys, displayNames, emoji icons, favorites, "Something else" | Complete |
| `messages.md` | Message types, WORKOUT_CARD encoding, jumbomoji, reactions, conversation model | Complete |
| `friends.md` | Friend states, FriendshipDTO model, request flow, UI audit | Complete |
| `workouts.md` | WorkoutDTO fields, ParticipantProfile shape, CreateWorkoutDTO, MockWorkout divergence table | Complete |
| `notifications.md` | NotificationCategory enum (13 types), AppNotification struct, MockNotification divergence table | Complete |
| `groups.md` | GroupDTO fields, GroupMemberDTO shape, no roles/visibility, conversation link, MockGroup divergence table | Complete |
| `profiles.md` | User + Profile structs, editable fields (4), stats (totalWorkouts/currentStreak), MockUser divergence table | Complete |

**Contract fixes completed (2026-05-27):**

- **MockWorkout:** ALIGNED. Flattened `host` → `creator_id + creator_username + creator_full_name + creator_avatar_url`. Removed `cohosts` and `participant_cap`. `participants` now `WorkoutParticipant[]` matching iOS shape (`{user_id, status, profile: {username, avatar_url}}`). `location` and `description` are now optional. Added `duration` (minutes). Renamed `activity_type` → `category` using iOS camelCase keys. Added `RSVPStatus` type (`"going" | "maybe" | "cant"`). `cover_image_url` and `cover_gradient` are now optional web-only fields. Helper `getWorkoutHost(w)` builds a MockUser from flat fields. Helper `categoryDisplayName(key)` resolves display names from ACTIVITIES list.
- **MockNotification:** ALIGNED. Replaced embedded-object model with iOS flat model: `{id, type, message, actor_id, entity_id, related_id, is_read, created_at}`. Adopted all 13 iOS NotificationCategory types. Removed invented types (`rsvp_yes`, `rsvp_maybe`, `group_invite`). `message` is now pre-rendered (display directly). `is_read` replaces inverted `unread`. Helpers `getNotificationActor(n)` and `getNotificationLink(n)` resolve actor/routing from IDs.

**All five core data contracts audited.** Mock types still without a canonical iOS doc:

- `MockRecommendation` — no spec. Recommendation engine logic is iOS-only for now.
- `MockConversation` — partially covered in `messages.md` but web shape (is_pinned, is_muted, unread_count) needs verification.

**Contract fixes completed (2026-05-28):**

- `MockGroup`: ALIGNED. Members shape changed from `MockUser[]` to lean `GroupMember[]` (`{user_id, joined_at, profile: {username, full_name, avatar_url}}`). Added `conversation_id`, `created_at`, `updated_at`. KEPT `description` + `cover_photo_url` as web-leads features (iOS will add — see `docs/ios-needs-to-add.md`). Helper `resolveGroupMember()` converts lean shape → full MockUser for avatar rendering. `upcoming_workouts[]` still embedded for now (TODO: fetch separately when backend ready).
- `MockUser`: ALIGNED. Renamed `parties_attended` → `total_workouts`, `joined_at` → `created_at`. Added `current_streak`. KEPT `hosted_count` + `birthday_month` as web-leads features (iOS will add — see `docs/ios-needs-to-add.md`).
- `/profile/edit` page built: 4 editable fields (avatar, name, username, bio) matching iOS EditProfileView. Optimistic save; TODO: wire `updateProfile(username, full_name, bio, avatar_url)` RPC.

**Web-leads reverse-handoff:** See `docs/ios-needs-to-add.md` for features web has that iOS must add (Maybe RSVP, birthday, hosted count, group description, group cover photo).

### 7. Inherited backlog (still open)

1. **Broken avatar files in Supabase storage** — Kyrah, Danny, @whereinnyc, @kkrysp return corrupt images. Option A: fix files in storage. Option B: web defensive check (`naturalWidth < 16` → gradient fallback).

2. **`get_group_for_deep_link` RPC expansion** — currently returns id, name, avatar_url, creator_id, conversation_id, created_at, updated_at, member_count. Needs: `members[]` (id, full_name, username, avatar_url), `upcoming_workouts[]` (id, title, start_time, location), `description`. RLS on `group_members` blocks anon reads — RPC likely needs SECURITY DEFINER.

3. **Messaging helpers still in mock-data.ts** — `getConversationsForUser`, `getMessagesForConversation`, `findDMWith`, `getTotalUnreadCount`, `encodeWorkoutCard`, `parseWorkoutCard`, `isJumbomoji`, `MOCK_MESSAGES`, `MOCK_CONVERSATIONS` are all still exported. Web doesn't use most of them (messaging deferred to iOS app). Only `getConversation` and `getOtherParticipant` are actually consumed (by `/messages/[conversation_id]`). The rest can be cleaned up or kept for potential future use — Luke's call.

### 8. Routes summary

| Route | Status | Server/Client | Mock-dependent? | Functional without backend? |
|---|---|---|---|---|
| `/` | Built (Luke's landing page) | Server | No | Yes — static |
| `/dashboard` | Built | Server | Yes — MOCK_WORKOUTS, MOCK_INVITES, MOCK_RECOMMENDATIONS, MOCK_GROUPS, CURRENT_USER | Renders with mock data |
| `/schedule` | Built | Server | Yes — MOCK_WORKOUTS, MOCK_NOTIFICATIONS, CURRENT_USER | Renders with mock data |
| `/workouts/[id]` | Built | Server | Yes — MOCK_WORKOUTS, MOCK_GROUPS, CURRENT_USER | Renders with mock data, actions are no-ops |
| `/groups` | Built | Server | Yes — MOCK_GROUPS | Renders with mock data |
| `/groups/[id]` | Built | Server + Client | Yes — MOCK_GROUPS, MOCK_FRIENDS, CURRENT_USER | Renders with mock data, optimistic comments |
| `/groups/[id]/members` | Built | Server | Yes — MOCK_GROUPS | Full member list with creator badge |
| `/profile/[username]` | Built | Server | Yes — getUserByUsername, getMutualFriends, getSharedWorkouts, etc. | Renders with mock data |
| `/notifications` | Built | Server | Yes — MOCK_NOTIFICATIONS | Renders with mock data, actions are no-ops |
| `/settings` | Built | Server + Client | Yes — CURRENT_USER | Renders with mock data; toggles visual-only (optimistic), social/legal links wired, log out = two-tap confirm |
| `/create` | Built | Client | Yes — ACTIVITIES, getSuggestedActivities, MOCK_FRIENDS | Visual submit only, no DB insert |
| `/friends` | Built | Client | Yes — MOCK_FRIENDS, getIncomingFriendRequests, getSuggestedUsers, searchUsers | Optimistic actions, resets on reload |
| `/messages/[conversation_id]` | Built | Server | Yes — getConversation, getOtherParticipant | Open-in-app landing, needs conversation RPC for real participant name |
| `/w/[id]` | Built (Luke's) | Server | No — uses real Supabase | Yes — live with real data |
| `/g/[id]` | Built (Luke's) | Server | No — uses real Supabase | Yes — live with real data (needs RPC expansion) |
| `/u/[username]` | Built (Luke's) | Server | No — uses real Supabase | Yes — live with real data |
| `/w-v2/[id]` | Built (Luke's) | Server | No | Yes — live |
| `/g-v2/[id]` | Built (Luke's) | Server | No | Yes — live |

---

## Pre-Handoff QA (2026-05-28)

Final QA pass completed before handoff:

- **Partiful benchmark:** Web matches Partiful structurally on all core surfaces. Schedule page + colored workout category cards **lead** Partiful. Two gaps deferred: profile stat badges (→ `docs/future-gamification.md`) and richer dashboard tabs (→ `docs/polish-backlog.md`).
- **Two polish wins shipped:** RSVP emoji in notifications (Going 👍 / Maybe 🤔 / Can't Go 😢) and glowing RSVP bubble picker on workout detail.
- **Link sweep:** Full `/w-v2/` and `/g-v2/` codebase sweep — all navigational links verified pointing to correct detail pages (`/workouts/[id]`, `/groups/[id]`).
- **Dead button sweep:** Every interactive element audited. No button silently does nothing. Treatments: management actions → open-in-app modal, lightweight actions → optimistic visual feedback, external → real URLs. Full catalog in section 4b above.
- **Settings links:** All 9 dead `href="#"` links resolved (3 social → real URLs, 4 legal/support → real URLs/mailto, 2 management → open-in-app modals).
- **Custom 404:** `src/app/not-found.tsx` — "Lost the trail." with cobalt BrandDot + back-to-dashboard button.
- **Build:** Clean pass, all routes render, no TypeScript errors.
