# iOS Canonical: Group / Crew Model

**Source:** `~/Radr-Mobile/Radr/`
**Files audited:**
- `Services/SupabaseService.swift` (GroupDTO, GroupMemberDTO, GroupMemberProfileDTO structs)
- `Services/SupabaseService+Groups.swift` (CRUD operations, RPCs, select queries)
- `ViewModels/GroupViewModel.swift` (loadGroups, createGroup, leaveGroup, etc.)
- `Views/Groups/GroupDetailView.swift` (detail page layout)
- `Views/Groups/CreateGroupView.swift` (group creation flow)
- `Views/Navigation/DeepLinkLoaders.swift` (GroupForDeepLinkRow)

**Audited:** 2026-05-28
**Sync status:** MODERATE DIVERGENCE. Web has invented fields (cover_photo_url, cover_gradient, description, upcoming_workouts[]). iOS has fields web is missing (conversation_id, updated_at). Core shape (id, name, avatar_url, creator_id, members) is close.

---

## Overview

iOS calls these **Groups** (not Crews). The UI uses "Crew" in some labels, but the data model and DB table are `groups` / `group_members`. Each group is backed by a linked `conversation` (group chat). Members are stored in a join table `group_members`, fetched via Supabase joins.

---

## GroupDTO (SupabaseService.swift:2101)

| DB column | Swift property | Swift type | Optional? | Notes |
|-----------|---------------|------------|-----------|-------|
| `id` | `id` | `String` | required | UUID primary key |
| `name` | `name` | `String` | required | Group name |
| `avatar_url` | `avatarUrl` | `String?` | optional | Group avatar (uploaded to Supabase storage) |
| `creator_id` | `creatorId` | `String` | required | UUID of group creator |
| `conversation_id` | `conversationId` | `String?` | optional | Linked group chat conversation |
| `created_at` | `createdAt` | `Date?` | optional | |
| `updated_at` | `updatedAt` | `Date?` | optional | |
| (joined) | `members` | `[GroupMemberDTO]?` | optional | Fetched via Supabase join, not a DB column |

### Notable absences from GroupDTO
- **No `description` field** — iOS groups have no description.
- **No `cover_photo_url` or `cover_gradient`** — iOS groups only have `avatar_url`.
- **No `member_count` stored field** — computed from `members?.count` (except in deep-link RPC which returns `member_count`).
- **No `upcoming_workouts` embedded** — workouts linked to a group are fetched separately via `group_id` filter on workouts table.

---

## GroupMemberDTO (SupabaseService.swift:2145)

| DB column | Swift property | Swift type | Notes |
|-----------|---------------|------------|-------|
| `group_id` | `groupId` | `String` | |
| `user_id` | `userId` | `String` | |
| `joined_at` | `joinedAt` | `Date?` | |
| (joined) | `profile` | `GroupMemberProfileDTO?` | Joined from `profiles` table |

### GroupMemberProfileDTO (SupabaseService.swift:2160)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | |
| `username` | `String?` | |
| `fullName` | `String?` | `full_name` in DB |
| `avatarUrl` | `String?` | `avatar_url` in DB |

### Member roles
- iOS has **no role/admin system**. The only distinction is `creatorId` — the group creator can remove members and delete the group (enforced by RLS).
- No admin, moderator, or member role field exists.

---

## Group visibility
- iOS has **no public/private/invite-only enum**. All groups are private by default — you must be in `group_members` to see the group (enforced by RLS).
- The `join_group_via_workout_invite` RPC allows joining a group through a shared workout link (the workout must have a `group_id`).

---

## Linked conversation
- Every group has a linked `conversation_id`. The conversation row has `is_group: true` and `group_name` / `group_avatar_url` fields.
- `createGroup()` automatically creates the conversation + adds all members as `conversation_participants`.
- When a group's name or avatar changes, the linked conversation is updated too.

---

## GroupForDeepLinkRow (DeepLinkLoaders.swift:24)

The `get_group_for_deep_link` SECURITY DEFINER RPC returns a leaner shape for non-members:

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | |
| `name` | `String` | |
| `avatarUrl` | `String?` | |
| `creatorId` | `String` | |
| `conversationId` | `String?` | |
| `createdAt` | `String?` | Raw ISO string |
| `updatedAt` | `String?` | Raw ISO string |
| `memberCount` | `Int` | Computed by RPC |

---

## DIVERGENCE TABLE: MockGroup vs iOS GroupDTO

| MockGroup field | iOS GroupDTO equivalent | Match? | Action needed |
|----------------|----------------------|--------|---------------|
| `id: string` | `id: String` | OK | |
| `name: string` | `name: String` | OK | |
| `description: string` | (does not exist) | INVENTED | iOS groups have no description. Remove from MockGroup or keep as web-only display field. |
| `avatar_url: string \| null` | `avatarUrl: String?` | OK | Same field, different casing (web uses snake_case) |
| `cover_photo_url: string \| null` | (does not exist) | INVENTED | iOS only has avatar_url for groups. Remove or keep as web-only cosmetic. |
| `cover_gradient: string` | (does not exist) | INVENTED | Web-only decorative field. |
| `member_count: number` | (computed from members?.count) | STRUCTURAL | iOS computes from members array. Only deep-link RPC returns it as a field. |
| `members: MockUser[]` | `members: [GroupMemberDTO]?` | SHAPE MISMATCH | iOS members are `GroupMemberDTO` with `{groupId, userId, joinedAt, profile: {id, username, fullName, avatarUrl}}` — NOT full User objects. |
| `upcoming_workouts: MockWorkout[]` | (does not exist on group) | INVENTED | iOS fetches workouts separately by `group_id`. Not embedded in group object. |
| `creator_id: string` | `creatorId: String` | OK | |
| (missing) | `conversationId: String?` | MISSING | Linked group chat. Add to MockGroup. |
| (missing) | `createdAt: Date?` | MISSING | |
| (missing) | `updatedAt: Date?` | MISSING | |

### Summary
- 3 invented fields: `description`, `cover_photo_url`, `cover_gradient`
- 1 invented embedded array: `upcoming_workouts[]` (should be separate fetch)
- Members shape is wrong: web embeds full `MockUser[]`, iOS uses lean `GroupMemberDTO[]` with joined profile
- Missing: `conversationId`, `createdAt`, `updatedAt`

---

## Web Implementation Notes

1. **Group avatar only:** iOS groups have a single avatar, not a cover photo. Web's `cover_photo_url` + `cover_gradient` are web-only cosmetic fields. Keep them as optional web-only display fields (like workout's `cover_image_url`).
2. **No description:** If we want descriptions on web, it's a web-leads-iOS feature. Mark clearly.
3. **Members shape:** When Luke wires real data, members will come as `{user_id, joined_at, profile: {id, username, full_name, avatar_url}}`. The web needs to handle this lean shape (no initials, no gradient_seed — derive client-side).
4. **Upcoming workouts:** Fetch separately via a `get_group_workouts(group_id)` RPC or filter workouts by `group_id`. Don't embed in the group object.
5. **Conversation link:** The `conversationId` is critical for the "Message" button on group detail pages. Web currently defers messaging to the app, but should store the ID for deep-linking.

---

## Sync Strategy

When Luke wires real groups:
1. Fetch groups via `fetchGroups()` pattern (get member group_ids, then fetch groups with joined members)
2. Members come as `GroupMemberDTO[]` with lean profile joins — resolve avatars from profile data
3. Upcoming workouts fetched separately: `SELECT * FROM workouts WHERE group_id = $1 AND start_time > now()`
4. `description` kept as optional web-only field (not in iOS schema)
5. `cover_photo_url` / `cover_gradient` kept as optional web-only display fields
6. Add `conversation_id` to type for messaging deep-links
