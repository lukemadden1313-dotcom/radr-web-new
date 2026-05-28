# iOS Canonical: Notification Model

**Source:** `~/Radr-Mobile/Radr/`
**Files audited:**
- `ViewModels/NotificationManager.swift` (NotificationCategory enum, AppNotification struct, fetch/mark/delete logic)
- `Views/Home/HomeView.swift` (NotificationsView — rendering, tap handling, deduplication)
- `Services/SupabaseService.swift` + `SupabaseService+Messaging.swift` (notification inserts)

**Audited:** 2026-05-27
**Sync status:** CRITICAL DIVERGENCE. Web's notification type names were invented and do not match iOS. See divergence table below.

---

## Overview

iOS notifications live in a `notifications` Supabase table. Each row has a `type` string that maps to a `NotificationCategory` enum. The notification model is flat — it stores a pre-rendered `message` string and references to actors/entities via UUIDs, not nested objects.

This is fundamentally different from web's `MockNotification` which embeds full `MockUser` and `MockWorkout` objects.

---

## NotificationCategory Enum (NotificationManager.swift:13)

```swift
enum NotificationCategory: String, CaseIterable, Identifiable {
    case friendRequest = "friend_request"
    case upcomingActivity = "upcoming_activity"
    case workoutUpdate = "workout_update"
    case workoutInvite = "workout_invite"
    case friendWorkout = "friend_workout"
    case workoutJoin = "workout_join"
    case workoutReaction = "workout_reaction"
    case workoutComment = "workout_comment"
    case newMessage = "new_message"
    case calendarError = "calendar_error"
    case friendRequestAccepted = "friend_request_accepted"
    case profileView = "profile_view"
    case general = "general"
}
```

### Per-type details

| Type | DB value | Title | Icon | Color | What it means |
|------|----------|-------|------|-------|---------------|
| friendRequest | `friend_request` | "Friend Requests" | person.badge.plus | blue | Someone sent you a friend request |
| friendRequestAccepted | `friend_request_accepted` | "Friend Accepted" | person.badge.checkmark | green | Someone accepted your request |
| upcomingActivity | `upcoming_activity` | "Upcoming Activities" | clock.fill | orange | Reminder for upcoming workout |
| workoutUpdate | `workout_update` | "Workout Updates" | exclamationmark.arrow.circlepath | red | A workout you're in was modified |
| workoutInvite | `workout_invite` | "Workout Invites" | envelope.fill | cyan | You were invited to a workout |
| friendWorkout | `friend_workout` | "Friends' Workouts" | figure.run | green | A friend posted a new workout |
| workoutJoin | `workout_join` | "Joined Workouts" | person.2.fill | indigo | Someone joined your workout |
| workoutReaction | `workout_reaction` | "Reactions" | heart.fill | pink | Someone reacted to your workout |
| workoutComment | `workout_comment` | "Comments" | text.bubble.fill | purple | Someone commented on your workout |
| newMessage | `new_message` | "Messages" | bubble.left.fill | blue | New DM or group message |
| calendarError | `calendar_error` | "Calendar" | calendar.badge.exclamationmark | orange | Google Calendar token issue |
| profileView | `profile_view` | "Profile Views" | eye.fill | purple | Someone viewed your profile |
| general | `general` | "Other Activity" | bell.fill | gray | Catch-all fallback |

---

## AppNotification Struct (NotificationManager.swift:86)

| DB column | Swift property | Swift type | Notes |
|-----------|---------------|------------|-------|
| `id` | `id` | `UUID` | Primary key |
| `type` | `type` | `String` | Maps to NotificationCategory rawValue |
| `message` | `message` | `String?` | Pre-rendered human-readable text (e.g. "Luke joined your workout") |
| `related_id` | `relatedId` | `UUID?` | Context-dependent: workout ID for invites/updates, conversation ID for messages |
| `entity_id` | `entityId` | `String?` | Canonical target ID (workout ID for reactions/comments/joins) |
| `actor_id` | `actorId` | `String?` | UUID of the user who triggered the notification |
| `is_read` | `isRead` | `Bool` | Read state |
| `created_at` | `createdAtString` | `String` | ISO 8601 timestamp (decoded to Date via computed property) |

### Computed properties

| Property | Logic |
|----------|-------|
| `category` | `NotificationCategory(rawValue: type) ?? .general` |
| `displayMessage` | `message ?? "New notification"` |
| `createdAt` | ISO 8601 parse of `createdAtString` |
| `senderName` | Parses name from message text before action verbs ("joined", "sent", "commented", etc.) |

### Important: `message` is pre-rendered

iOS does NOT assemble notification text client-side from structured data. The `message` field comes pre-written from the backend (or from the insert point in iOS code). Examples from the codebase:

- Friend request: `"{name} sent you a friend request"` (FriendsViewModel.swift:133)
- Friend accepted: `"{name} accepted your friend request"` (FriendsViewModel.swift:183)
- Workout join: `"{name} joined your workout"` (inserted by backend/trigger)
- Message: `"{SenderName}: {preview}"` or `"[GroupName] SenderName: {preview}"` for group messages

---

## Notification Display (HomeView.swift NotificationsView)

### Title
- Page title: "Activity." (italic + accent dot) — NOT "Notifications"

### Deduplication
- Messages: grouped by conversation (`relatedId`), shown as single row with count
- Other notifications: grouped by `(type, message)`, shown as single row with count badge

### Row structure
- Actor avatar (fetched separately via `profileCache[actorId]`)
- `displayMessage` text
- Relative time
- Unread indicator (blue dot)

### Tap actions per type
| Type | Navigates to |
|------|-------------|
| friendRequest | Friend request action sheet (accept/decline) |
| friendRequestAccepted | Actor's profile |
| workoutComment | Workout detail (auto-opens comments) |
| workoutJoin, workoutUpdate, workoutInvite, friendWorkout, workoutReaction, upcomingActivity | Workout detail |
| newMessage | Conversation |
| profileView | Actor's profile |
| calendarError, general | No navigation |

### Mark read
- `markAllRead()` is called `onAppear` — entering the notification list marks everything read
- Individual delete via swipe
- "Clear All" button deletes all notifications

---

## DIVERGENCE TABLE: Web MockNotification types vs iOS NotificationCategory

| Web type name | iOS equivalent | Match? | Action needed |
|---------------|---------------|--------|---------------|
| `"rsvp_yes"` | (does not exist) | INVENTED | iOS has no RSVP-specific notification. The closest is `workout_join` ("Someone joined your workout"). Remove or rename. |
| `"rsvp_maybe"` | (does not exist) | INVENTED | iOS has no "maybe" RSVP concept at all. Remove entirely. |
| `"friend_request"` | `"friend_request"` | OK | |
| `"workout_invite"` | `"workout_invite"` | OK | |
| `"group_invite"` | (does not exist) | INVENTED | iOS has no group invite notification type. Remove or map to `general`. |
| `"workout_reminder"` | `"upcoming_activity"` | RENAMED | Same concept, different name. Rename to `upcoming_activity`. |
| (missing) | `"friend_request_accepted"` | MISSING | Add to web |
| (missing) | `"workout_update"` | MISSING | Add to web |
| (missing) | `"friend_workout"` | MISSING | Add to web |
| (missing) | `"workout_join"` | MISSING | Add to web (this is what web calls "rsvp_yes") |
| (missing) | `"workout_reaction"` | MISSING | Add to web |
| (missing) | `"workout_comment"` | MISSING | Add to web |
| (missing) | `"new_message"` | MISSING | Web defers messaging to app, but should still handle if received |
| (missing) | `"calendar_error"` | MISSING | Low priority — calendar sync only |
| (missing) | `"profile_view"` | MISSING | Add to web |

### Summary: 3 of 6 web types don't exist in iOS. 8 iOS types are missing from web.

---

## DIVERGENCE TABLE: MockNotification fields vs AppNotification

| MockNotification field | AppNotification field | Match? | Action needed |
|-----------------------|----------------------|--------|---------------|
| `id: string` | `id: UUID` | OK | Same wire format |
| `type: string union` | `type: String` | WRONG VALUES | Web type names are invented (see above) |
| `actor: MockUser` | `actorId: String?` | STRUCTURE MISMATCH | iOS stores only actor UUID. Actor name/avatar fetched separately via profile lookup. Web embeds full MockUser. |
| `target_workout?: MockWorkout` | `entityId: String?` + `relatedId: UUID?` | STRUCTURE MISMATCH | iOS stores only IDs. Workout data fetched separately. Web embeds full MockWorkout. |
| `target_group?: MockGroup` | (no group field) | WEB-ONLY | iOS has no group reference on notifications |
| `created_at: string` | `createdAtString: String` (`created_at`) | OK | Same wire format |
| `unread: boolean` | `isRead: Bool` | INVERTED | Web uses `unread`, iOS uses `is_read`. Semantically inverted. |
| (missing) | `message: String?` | CRITICAL MISSING | iOS notification text is pre-rendered in `message` field. Web generates text from type + actor + target. Web must switch to using `message`. |
| (missing) | `relatedId: UUID?` | MISSING | Context-dependent reference |
| (missing) | `entityId: String?` | MISSING | Canonical target reference |

### Summary: The model structure is fundamentally different.

iOS notifications are **flat rows with pre-rendered message text and UUID references**. Web notifications are **rich objects with embedded actor/workout/group data**.

When Luke wires real data, web must:
1. Use the `message` field for display text (not generate it from type + actor)
2. Use `actorId` to fetch actor avatar separately (or denormalize in the RPC)
3. Use `entityId`/`relatedId` to link to workouts/profiles (not embed objects)
4. Adopt iOS type names
5. Flip `unread` → `is_read` (or invert in the fetch)

---

## Web Implementation Notes

1. **Page title:** iOS calls it "Activity." — web calls it "Notifications." Consider aligning.
2. **Pre-rendered messages:** The biggest paradigm shift. Web currently generates notification copy from structured data. iOS stores the copy in the DB. When wiring to real data, web should display `message` directly and only use `type` for icon/color selection and tap routing.
3. **Actor avatar fetching:** iOS fetches actor profiles separately (`profileCache[actorId]`). Web could either:
   - Use an RPC that joins profiles (recommended — avoids N+1 fetches)
   - Fetch profiles client-side per actorId
4. **Deduplication:** iOS deduplicates notifications by `(type, message)`. Web doesn't deduplicate. Consider adding when wiring.
5. **Inline actions:** iOS only has inline actions on `friend_request` (accept/decline via sheet). Other types navigate on tap. Web has inline Accept/Decline buttons.

---

## Sync Strategy

When Luke wires real notifications:
1. Replace MockNotification type with shape matching AppNotification: `{id, type, message, related_id, entity_id, actor_id, is_read, created_at}`
2. Create `get_notifications(user_id)` RPC that returns notifications + optionally joins actor profiles for avatar display
3. Use `message` field directly for display text
4. Use iOS `NotificationCategory` type names
5. Route taps based on `type` + `entityId`/`relatedId` (not embedded objects)
6. `mark_all_read(user_id)` → updates `is_read = true` on all unread
