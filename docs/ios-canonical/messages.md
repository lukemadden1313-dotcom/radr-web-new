# Messages / Inbox — iOS Canonical Reference

**Source:** ~/Radr-Mobile/Radr (multiple files, see per-section citations)
**Audited:** 2026-05-27
**Sync status:** Web has no messages page yet. This doc is the spec for building one.

---

## 1. Data Model

### MessageDTO (SupabaseService.swift:2007)

| Field | Type | DB Column | Notes |
|---|---|---|---|
| id | String | id | UUID primary key |
| conversationId | String | conversation_id | FK to conversations table |
| senderId | String | sender_id | FK to profiles |
| text | String | text | Plain text or `WORKOUT_CARD::` prefixed payload |
| createdAt | Date | created_at | ISO 8601 UTC |
| replyToId | String? | reply_to_id | FK to messages (nullable) — for reply threading |
| reactions | [MessageReactionDTO]? | (joined) | Inline-fetched via Supabase select join |

### MessageReactionDTO (SupabaseService.swift:2027)

| Field | Type | DB Column |
|---|---|---|
| id | String | id |
| messageId | String | message_id |
| userId | String | user_id |
| emoji | String | emoji |
| createdAt | Date? | created_at |

Quick-react emoji set (hardcoded in MessageActions.swift): `["heart", "face.smiling", "eyes", "crying", "angry", "thumbsup"]` — displayed as: `["❤️", "😂", "😮", "😢", "😡", "👍"]`

### ConversationDTO (SupabaseService.swift:2061)

| Field | Type | DB Column | Notes |
|---|---|---|---|
| id | String | id | UUID |
| createdAt | Date? | created_at | |
| lastMessageText | String? | last_message_text | Updated by DB trigger on message insert |
| lastMessageAt | Date? | last_message_at | Updated by DB trigger |
| participants | [ConversationParticipantRow]? | (joined) | Via conversation_participants table |
| isGroup | Bool? | is_group | true = group chat, false/nil = DM |
| groupId | String? | group_id | FK to groups table (only for group chats) |
| group | ConversationGroupInfo? | (joined) | name + avatar_url from groups table |

### ConversationParticipantRow (SupabaseService.swift:2043)

| Field | Type | DB Column | Notes |
|---|---|---|---|
| userId | String | user_id | |
| lastReadAt | Date? | last_read_at | Used for unread calculation |
| profile | ProfileDTO? | (joined) | username, full_name, avatar_url, bio |
| isPinned | Bool? | is_pinned | Per-user pin state |
| isMuted | Bool? | is_muted | Per-user mute state |
| markedUnread | Bool? | marked_unread | Manual "mark as unread" flag |

### WorkoutCardData (Models/WorkoutCardData.swift)

Inline workout shares are stored as message text with a special prefix format:

```
WORKOUT_CARD::{workoutId}::{title}::{startTimeISO}::{location}::{category}::{creatorId}::{bookingUrl}
```

Parsed by `WorkoutCardData.parse(_:)`. Fields: workoutId, title, startTime (Date), location, category, creatorId, bookingUrl (optional).

---

## 2. DB Tables & RPCs

### Tables

| Table | Purpose |
|---|---|
| conversations | One row per conversation (DM or group) |
| conversation_participants | Join table: user_id + conversation_id + read/pin/mute state |
| messages | All messages, FK to conversation_id |
| message_reactions | Emoji reactions, FK to message_id + user_id |

### RPCs

| RPC / Function | Purpose | Source |
|---|---|---|
| `get_or_create_dm(other_user)` | Returns existing DM conversation_id or creates one | SupabaseService+Messaging.swift:19 |
| `get_conversation_unread_counts(p_user_id, p_overrides)` | Batch unread counts + last_sender_id for all conversations | SupabaseService+Messaging.swift:178 |

### Direct Table Operations (not RPCs)

- **fetchConversations**: SELECT from conversation_participants -> conversations (with joined participants + profiles)
- **fetchMessages**: SELECT from messages WHERE conversation_id, ORDER BY created_at ASC
- **sendMessage**: INSERT into messages + INSERT/UPDATE notifications (throttled: 1 push per sender/recipient/conversation per 60s)
- **markConversationRead**: UPDATE conversation_participants SET last_read_at, marked_unread=false
- **togglePin/toggleMute/markAsUnread**: UPDATE conversation_participants
- **deleteMessage**: DELETE from messages + UPDATE conversations.last_message_text to latest remaining
- **insert/deleteMessageReaction**: INSERT/DELETE on message_reactions

---

## 3. Inbox UI (ConversationsView.swift)

The inbox is the **Messages** tab in the main tab bar. It uses `ConversationsView` (not `InviteView` — that's a legacy wrapper).

### Header
- Left: current user avatar (tappable -> You tab)
- Center: "Inbox." with italic + cobalt BrandDot, subtitle "N unread" or "All caught up"
- Right: compose button (square.and.pencil icon) -> NewMessageSheet

### Search Bar
- "Search by name" text field, filters conversations by other participant's display name

### Sections

**1. FRIENDS (suggested row)**
- Horizontal scroll of friends the user hasn't messaged yet
- Max 10 shown, sorted alphabetically
- Avatar tappable -> profile, name tappable -> opens DM (via `getOrCreateDM` RPC)

**2. MESSAGES (conversation list)**
- DMs only — group conversations are filtered out (`isGroup != true`)
- Sort: pinned first, then by last_message_at descending
- Blocked users filtered out

### Conversation Row Layout
```
[Avatar]  [Name]  [pin icon?] [mute icon?]  [Spacer]  [time]
          [preview text]                               [unread dot]
```

- **Avatar**: 46px, tappable -> profile
- **Name**: bold if unread, regular otherwise
- **Time**: relative format: "now", "Nm", "Nh", "yesterday", "Nd", "Nw"
- **Preview**: "You: {text}" if you sent last, "Shared a workout" for WORKOUT_CARD:: messages, "Say hi" if no messages
- **Unread dot**: 7px cobalt circle, shown when: not sent by me AND (markedUnread OR lastMessageAt > lastReadAt)
- **Context menu**: Mark as Unread, Pin/Unpin, Mute/Unmute, Delete

### Empty State
- Ghost chat thread (3 faded bubbles: "running tomorrow?" / "7am central park" / "fired up")
- CTA card: "Start a thread." + "Add friends to start a thread." + cobalt "Find friends" button
- Cobalt accent glow on CTA card

### Loading Skeleton
- 6 rows of: circle(46) + rect(120x13) + rect(180x11) + rect(24x9)

---

## 4. Chat Screen (ChatView.swift)

### Navigation Bar (custom, toolbar hidden)
- Left: back chevron in circle (cobalt)
- Center: avatar (32px) + name (italic, bold) + cobalt dot
- Tapping avatar/name -> navigates to profile (DMs) or does nothing (group chats)

### DM Intro (empty conversation)
- Large avatar (80px), name (italic bold), @username, shared workout summary or "Friends on Radr"
- Shared workout summary fetched via `getSharedWorkouts(userIdA:, userIdB:)`

### Chat Header (above messages when messages exist)
- Avatar (64px) + name (italic bold) + @username
- Tappable -> profile

### Message Grouping
- Consecutive messages from same sender grouped together
- Timestamp separator inserted when gap > 60 minutes between messages
- Format: "TODAY h:mm a", "YESTERDAY h:mm a", "EEE h:mm a" (same week), "MMM d, h:mm a" (older)

### Message Bubble Layout
```
[Avatar 28px]  [Bubble]            — received (left-aligned)
               [Bubble]  [Avatar]  — sent (right-aligned, cobalt background)
```

- Avatar only shown on LAST message in a group (spacer on others for alignment)
- Sent bubbles: cobalt (#0C5DE9) background, cream text
- Received bubbles: #1a1a1a background, cream text
- Max width: 280px
- Bubble shape: `ChatBubbleShape` with variable corner radii (isMe, isFirst, isLast)
- **Jumbomoji**: 1-3 pure emoji messages render at 40pt with no bubble background
- **Reply quote**: cobalt left bar (2px) + sender name (cobalt) + original text (gray, 1 line)

### Reactions
- Displayed below message bubble as grouped emoji count pills
- Pill: emoji + count (if > 1), cobalt highlight if current user reacted
- Tap pill -> sheet showing who reacted

### Context Menu (long-press on message)
- Quick reactions: heart, face.smiling, eyes, thumbsup (4 shown in context menu)
- Reply
- Copy (text messages only)
- Unsend (own messages only, destructive)
- Report Message (other's messages, destructive)

### Workout Card in DM
- Rich card rendered when message text starts with `WORKOUT_CARD::`
- Layout: creator avatar + name, divider, title + time + location + booking link, divider, action buttons
- Actions: "You created this" / "Joined" / "+ Join" / "Started" (past workouts) + "View" button
- Tapping "View" fetches full workout and navigates to WorkoutDetailView
- Tapping "+ Join" joins the workout via workoutsViewModel

### Input Bar
- Bottom safe area inset
- TextField: "Message..." placeholder (italic), capsule-shaped, #1a1a1a background
- Multi-line: 1-4 lines
- Send button: cobalt circle with up arrow, only visible when text is non-empty
- Reply preview bar shown above input when replying (cobalt left bar + sender name + text + X cancel)

### Send Flow
1. Trim text, guard not empty and not already sending
2. Optimistic: update conversation preview locally (text, timestamp, move to top)
3. Insert into `messages` table
4. Build notification(s): single recipient for DM, all non-muted participants for group
5. Notification format: "[GroupName] SenderName: preview" (truncated to 100 chars)
6. Throttle: 1 notification INSERT per (sender, recipient, conversation) per 60s window; subsequent messages UPDATE existing notification's message + created_at
7. Mark conversation as read after sending
8. Background refresh: re-fetch messages + conversations + unread counts

### Realtime Subscriptions
- **Messages channel**: listens for INSERT on `messages` table filtered by conversation_id
- **Reactions channel**: listens for INSERT/DELETE on `message_reactions`
- **Conversations channel** (from inbox): listens for INSERT on `messages` globally, refreshes conversation list
- Subscriptions torn down on view disappear; conversation marked as read on disappear

---

## 5. New Message Sheet (ConversationsView.swift:706)

- Full friends list, sorted alphabetically, sectioned by first letter (A-Z headers)
- Search bar: filter by username or name
- Each row: avatar (40px) + name + @username, tappable -> creates/finds DM and navigates
- Uses `getOrCreateDM` RPC, then sets `pendingChat` on MessagingViewModel
- "Discover Friends" button if friends list is empty

---

## 6. Workout Share Sheet (RadrWorkoutShareSheet.swift)

Separate from chat — accessed from workout detail actions.

- Modal: 75% or full screen
- Workout preview card at top (category icon, title, time)
- **TOP FRIENDS** grid: 3-column, top 12 friends sorted by most recent DM, checkmark selection
- **GROUPS** list: all user's groups, with "Create a group" button
- Bottom bar: optional message text field + "Send to N" cobalt button
- Send: for each selected friend, `getOrCreateDM` + `sendMessage` with `WORKOUT_CARD::` payload
- For each selected group, sends to group's conversation_id

---

## 7. Group Chat vs DM

- `isGroup == true` on ConversationDTO distinguishes group chats from DMs
- Group chats have a `groupId` linking to the groups table
- Group chat display name = group name; DM display name = other participant's name
- Group chat avatar = group avatar_url; DM avatar = other participant's avatar
- ConversationsView (inbox) shows **DMs only** — group chats appear in GroupsView
- Group messages notify all non-muted, non-sender participants
- Group chat header shows member count in DM intro area

---

## 8. Web Implementation Notes

### What web needs to build
1. `/messages` (or `/inbox`) — conversation list page (DMs only, mirrors ConversationsView)
2. `/messages/[conversationId]` — chat view page (mirrors ChatView)
3. NewMessageSheet equivalent (modal or page)
4. Workout card rendering in chat (parse `WORKOUT_CARD::` format)

### Backend dependencies (RPCs already exist)
- `get_or_create_dm(other_user)` — for opening DMs
- `get_conversation_unread_counts(p_user_id, p_overrides)` — batch unread counts
- Direct table operations: fetchConversations (2-step select), fetchMessages, sendMessage (insert + notification), markConversationRead, togglePin, toggleMute, markAsUnread, deleteMessage, message reactions CRUD

### Realtime
- Web will need Supabase Realtime subscriptions for live message updates
- Three channels: messages (per-conversation), reactions (per-conversation), conversations (global for inbox)
- Consider whether SSR pages or client-only for chat (likely client-only given realtime needs)

### Key patterns to replicate
- Unread calculation: `lastMessageAt > lastReadAt AND lastSenderId != myId`
- Message grouping: consecutive same-sender, 60-min timestamp separator
- Jumbomoji detection: 1-3 emoji characters with no other content
- `WORKOUT_CARD::` parsing for rich workout cards in chat
- Notification throttle is server-side (web just inserts messages, notifications are handled by SupabaseService)

### What web can skip (iOS-only)
- Realtime subscriptions (can poll or use simpler refresh for v1)
- Skeleton loading states (can use simpler spinner)
- Swipe-back gesture
- Full-screen avatar tap overlay
- Context menu (can use click menu or hover actions instead)
