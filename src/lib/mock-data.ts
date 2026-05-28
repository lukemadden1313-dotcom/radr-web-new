// ================================================================
// Mock data for Radr web prototype
// TODO: Replace each usage with the appropriate Supabase RPC when backend is ready.
// ================================================================

export type MockUser = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  initials: string;
  gradient_seed: string;
  birthday_month?: string;
  joined_at?: string;
  bio?: string;
  parties_attended?: number;
  hosted_count?: number;
};

export type RSVPStatus = "going" | "maybe" | "cant";

export type WorkoutParticipant = {
  user_id: string;
  status: RSVPStatus;
  profile: {
    username: string;
    avatar_url: string | null;
  };
};

export type MockWorkout = {
  id: string;
  creator_id: string;
  creator_username: string;
  creator_full_name: string;
  creator_avatar_url: string | null;
  title: string;
  category: string;
  start_time: string;
  duration: number;
  location: string | null;
  description: string | null;
  open_to_join: boolean;
  booking_url: string | null;
  group_id: string | null;
  participants: WorkoutParticipant[];
  // Web-only display fields (not from backend)
  cover_image_url?: string;
  cover_gradient?: string;
};

export type MockGroup = {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  cover_photo_url: string | null;
  cover_gradient: string;
  member_count: number;
  members: MockUser[];
  upcoming_workouts: MockWorkout[];
  creator_id: string;
};

// Matches iOS NotificationCategory (NotificationManager.swift:13)
export type NotificationType =
  | "friend_request"
  | "friend_request_accepted"
  | "upcoming_activity"
  | "workout_update"
  | "workout_invite"
  | "friend_workout"
  | "workout_join"
  | "workout_reaction"
  | "workout_comment"
  | "new_message"
  | "calendar_error"
  | "profile_view"
  | "general";

// Flat notification model matching iOS AppNotification (NotificationManager.swift:86).
// `message` is pre-rendered — display it directly. Use `type` only for icon/color/routing.
export type MockNotification = {
  id: string;
  type: NotificationType;
  message: string;
  actor_id: string | null;
  entity_id: string | null;   // canonical target (workout ID, profile ID)
  related_id: string | null;  // context-dependent (conversation ID, etc.)
  is_read: boolean;
  created_at: string;
};

export type MockRecommendation = {
  workout: MockWorkout;
  reason: string;
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function daysFromNow(days: number, hour = 8, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, hour = 8, minute = 0): string {
  return daysFromNow(-days, hour, minute);
}

function minutesAgo(mins: number): string {
  const d = new Date();
  d.setTime(d.getTime() - mins * 60 * 1000);
  return d.toISOString();
}

// ----------------------------------------------------------------
// Users
// ----------------------------------------------------------------

// TODO: replace with auth context / Supabase profile query
export const CURRENT_USER: MockUser = {
  id: "u-eli",
  full_name: "Eli Goldman",
  username: "eli",
  avatar_url: null,
  initials: "EG",
  gradient_seed: "E",
  birthday_month: "August",
  joined_at: "2024-07-15T00:00:00Z",
  parties_attended: 19,
  hosted_count: 4,
};

export const MOCK_FRIENDS: MockUser[] = [
  {
    id: "u-luke",
    full_name: "Luke Madden",
    username: "lukemadden",
    avatar_url: null,
    initials: "LM",
    gradient_seed: "L",
    birthday_month: "March",
    joined_at: "2024-06-01T00:00:00Z",
    parties_attended: 31,
    hosted_count: 8,
  },
  {
    id: "u-finn",
    full_name: "Finn Woelm",
    username: "finnwoelm",
    avatar_url: null,
    initials: "FW",
    gradient_seed: "F",
  },
  {
    id: "u-michael",
    full_name: "Michael Rapadas",
    username: "michaelrapadas",
    avatar_url: null,
    initials: "MR",
    gradient_seed: "M",
    birthday_month: "November",
    joined_at: "2024-08-20T00:00:00Z",
    parties_attended: 22,
    hosted_count: 6,
  },
  {
    id: "u-kyrah",
    full_name: "Kyrah Stewart",
    username: "kkrysp",
    avatar_url: null,
    initials: "KS",
    gradient_seed: "K",
    birthday_month: "January",
    joined_at: "2024-09-10T00:00:00Z",
    parties_attended: 14,
    hosted_count: 3,
  },
  {
    id: "u-danny",
    full_name: "Danny Bauer",
    username: "dannybauer",
    avatar_url: null,
    initials: "DB",
    gradient_seed: "D",
  },
  {
    id: "u-brandon",
    full_name: "Brandon Soxman",
    username: "soxy711",
    avatar_url: null,
    initials: "BS",
    gradient_seed: "B",
  },
  {
    id: "u-jb",
    full_name: "JB Smoove",
    username: "jbsmoove",
    avatar_url: null,
    initials: "JB",
    gradient_seed: "J",
  },
  {
    id: "u-kiera",
    full_name: "Kiera McNally",
    username: "kieramcnally",
    avatar_url: null,
    initials: "KM",
    gradient_seed: "K",
  },
  {
    id: "u-tye",
    full_name: "Tye Johnson",
    username: "tyejohnson",
    avatar_url: null,
    initials: "TJ",
    gradient_seed: "T",
  },
  {
    id: "u-charles",
    full_name: "Charles Okoye",
    username: "charlesokoye",
    avatar_url: null,
    initials: "CO",
    gradient_seed: "C",
  },
];

// Shorthand refs
const [luke, finn, michael, kyrah, danny, brandon, jb, kiera, tye, charles] =
  MOCK_FRIENDS;

// ----------------------------------------------------------------
// Groups
// ----------------------------------------------------------------

// TODO: replace with get_group_for_deep_link or expanded group RPC
export const MOCK_GROUPS: MockGroup[] = [
  {
    id: "g-cycle",
    name: "Cycle crew",
    description:
      "We ride at 6 AM. Indoor cycling enthusiasts across NYC — Peloton studios, SoulCycle, and the occasional outdoor century.",
    avatar_url: null,
    cover_photo_url: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600&h=400&fit=crop",
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #1a9e54 30%, #0C5DE9 70%, #093fb0 100%)",
    member_count: 14,
    members: [CURRENT_USER, luke, finn, kyrah, danny, brandon, kiera, tye],
    upcoming_workouts: [], // filled below
    creator_id: luke.id,
  },
  {
    id: "g-sunday",
    name: "Sunday runners",
    description:
      "Long runs every Sunday morning. Central Park loop, Brooklyn Bridge, or the West Side Highway — depends on the vibe.",
    avatar_url: null,
    cover_photo_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop",
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #3A7EF2 30%, #9A5AF0 70%, #6b3dbd 100%)",
    member_count: 9,
    members: [CURRENT_USER, michael, danny, jb, charles, brandon],
    upcoming_workouts: [],
    creator_id: michael.id,
  },
  {
    id: "g-climb",
    name: "Climb crew",
    description:
      "Bouldering and top-rope at VITAL and Brooklyn Boulders. All levels welcome — we send and we spot.",
    avatar_url: null,
    cover_photo_url: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop",
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #7a3dd4 30%, #2AD472 70%, #1a9e54 100%)",
    member_count: 7,
    members: [CURRENT_USER, finn, kyrah, tye, kiera],
    upcoming_workouts: [],
    creator_id: finn.id,
  },
];

const [cycleCrew, sundayRunners, climbCrew] = MOCK_GROUPS;

// ----------------------------------------------------------------
// Workouts
// ----------------------------------------------------------------

// Helper: build a WorkoutParticipant from a MockUser
function wp(user: MockUser, status: RSVPStatus = "going"): WorkoutParticipant {
  return {
    user_id: user.id,
    status,
    profile: { username: user.username, avatar_url: user.avatar_url },
  };
}

// TODO: replace with get_workout_for_deep_link or feed RPC
export const MOCK_WORKOUTS: MockWorkout[] = [
  {
    id: "w-good-sat",
    title: "Good Saturdays is back!!",
    start_time: daysFromNow(5, 9, 0),
    location: "Barry's Bootcamp, Chelsea",
    creator_id: luke.id,
    creator_username: luke.username,
    creator_full_name: luke.full_name,
    creator_avatar_url: luke.avatar_url,
    participants: [wp(CURRENT_USER), wp(luke), wp(finn), wp(kyrah), wp(danny), wp(brandon), wp(kiera)],
    description:
      "The legendary Saturday morning bootcamp returns. Bring energy, bring a friend, bring a towel. We go hard then we brunch.",
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #3A7EF2 30%, #5b9cf5 60%, #0A4FC5 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    category: "hiit",
    duration: 60,
  },
  {
    id: "w-central-park",
    title: "Central Park 6-miler",
    start_time: daysFromNow(1, 7, 0),
    location: "Engineers' Gate, East 90th St & 5th Ave",
    creator_id: michael.id,
    creator_username: michael.username,
    creator_full_name: michael.full_name,
    creator_avatar_url: michael.avatar_url,
    participants: [wp(CURRENT_USER), wp(michael), wp(danny), wp(jb), wp(charles)],
    description: "Easy Sunday pace. Full lower loop. Meet at Engineers' Gate, we roll out at 7:05 sharp.",
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #1fc262 30%, #0C5DE9 70%, #093fb0 100%)",
    group_id: sundayRunners.id,
    open_to_join: true,
    booking_url: null,
    category: "outdoorRun",
    duration: 55,
  },
  {
    id: "w-bouldering",
    title: "VITAL bouldering sesh",
    start_time: daysFromNow(2, 18, 30),
    location: "VITAL Climbing Gym, Williamsburg",
    creator_id: finn.id,
    creator_username: finn.username,
    creator_full_name: finn.full_name,
    creator_avatar_url: finn.avatar_url,
    participants: [wp(finn), wp(kyrah), wp(tye)],
    description: "Working V5-V7 problems this week. Bring shoes or rent at the desk. Cool-down beers at the bar after.",
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #7a3dd4 30%, #5b3d8f 60%, #3d2860 100%)",
    group_id: climbCrew.id,
    open_to_join: true,
    booking_url: null,
    category: "climbing",
    duration: 90,
  },
  {
    id: "w-peloton",
    title: "6 AM Peloton ride",
    start_time: daysFromNow(3, 6, 0),
    location: "Peloton Studios, Hudson Yards",
    creator_id: kiera.id,
    creator_username: kiera.username,
    creator_full_name: kiera.full_name,
    creator_avatar_url: kiera.avatar_url,
    participants: [wp(kiera), wp(luke), wp(brandon), wp(tye), wp(CURRENT_USER)],
    description: "Cody Rigsby live class. Get there 15 min early to clip in. Energy matching required.",
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #22b85f 30%, #4a8f6f 60%, #1a6b4a 100%)",
    group_id: cycleCrew.id,
    open_to_join: true,
    booking_url: "https://www.onepeloton.com/schedule/cycling",
    category: "indoorCycle",
    duration: 45,
  },
  {
    id: "w-yoga",
    title: "Vinyasa flow @ Sky Ting",
    start_time: daysFromNow(4, 12, 0),
    location: "Sky Ting Yoga, Tribeca",
    creator_id: kyrah.id,
    creator_username: kyrah.username,
    creator_full_name: kyrah.full_name,
    creator_avatar_url: kyrah.avatar_url,
    participants: [wp(kyrah), wp(kiera), wp(CURRENT_USER)],
    description: "Noon flow with Krissy. Bring your own mat or borrow one. Restorative vibes.",
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #b07af5 30%, #c39cff 60%, #7a3dd4 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    category: "yoga",
    duration: 60,
  },
  {
    id: "w-past-lift",
    title: "Upper body push day",
    start_time: daysAgo(2, 17, 0),
    location: "Equinox, Flatiron",
    creator_id: danny.id,
    creator_username: danny.username,
    creator_full_name: danny.full_name,
    creator_avatar_url: danny.avatar_url,
    participants: [wp(danny), wp(brandon), wp(CURRENT_USER)],
    description: "Bench, OHP, dips, and cable flys. 75-minute session. Bring your lifting shoes.",
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #0A4FC5 30%, #083da0 60%, #062d7a 100%)",
    group_id: null,
    open_to_join: false,
    booking_url: null,
    category: "traditionalStrength",
    duration: 75,
  },
  // --- Additional workouts for schedule density ---
  {
    id: "w-today-run",
    title: "Morning shake-out run",
    start_time: daysFromNow(0, 7, 30),
    location: "Hudson River Greenway, Chelsea Piers",
    creator_id: CURRENT_USER.id,
    creator_username: CURRENT_USER.username,
    creator_full_name: CURRENT_USER.full_name,
    creator_avatar_url: CURRENT_USER.avatar_url,
    participants: [wp(CURRENT_USER), wp(luke), wp(danny)],
    description: "Easy 3-miler along the river. All paces welcome.",
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #1fc262 50%, #0C5DE9 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    category: "outdoorRun",
    duration: 30,
  },
  {
    id: "w-today-evening",
    title: "Barry's Arms & Abs",
    start_time: daysFromNow(0, 18, 0),
    location: "Barry's Bootcamp, Noho",
    creator_id: kiera.id,
    creator_username: kiera.username,
    creator_full_name: kiera.full_name,
    creator_avatar_url: kiera.avatar_url,
    participants: [wp(kiera), wp(kyrah), wp(CURRENT_USER), wp(brandon)],
    description: "50-minute arms and abs class. Bring water.",
    cover_gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    category: "hiit",
    duration: 50,
  },
  {
    id: "w-tomorrow-climb",
    title: "Brooklyn Boulders sesh",
    start_time: daysFromNow(1, 18, 0),
    location: "Brooklyn Boulders, Gowanus",
    creator_id: tye.id,
    creator_username: tye.username,
    creator_full_name: tye.full_name,
    creator_avatar_url: tye.avatar_url,
    participants: [wp(tye), wp(finn), wp(kyrah), wp(CURRENT_USER)],
    description: "V4-V6 session. Bring chalk.",
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #7a3dd4 50%, #5b3d8f 100%)",
    group_id: climbCrew.id,
    open_to_join: true,
    booking_url: null,
    category: "climbing",
    duration: 90,
  },
  {
    id: "w-day2-yoga",
    title: "Sunrise flow on the roof",
    start_time: daysFromNow(2, 6, 30),
    location: "1 Hotel Brooklyn Bridge, Rooftop",
    creator_id: kyrah.id,
    creator_username: kyrah.username,
    creator_full_name: kyrah.full_name,
    creator_avatar_url: kyrah.avatar_url,
    participants: [wp(kyrah), wp(kiera), wp(CURRENT_USER)],
    description: "Rooftop vinyasa watching the sun come up over Manhattan. BYOM (bring your own mat).",
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #b07af5 50%, #c39cff 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    category: "yoga",
    duration: 60,
  },
  // --- Month-spread workouts for schedule grid ---
  {
    id: "w-last-week-run",
    title: "West Side Highway 5K",
    start_time: daysAgo(7, 7, 0),
    location: "Pier 40, Hudson River Park",
    creator_id: michael.id,
    creator_username: michael.username,
    creator_full_name: michael.full_name,
    creator_avatar_url: michael.avatar_url,
    participants: [wp(michael), wp(CURRENT_USER), wp(danny), wp(jb)],
    description: "Easy 5K along the river path. Meetup at Pier 40.",
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #3A7EF2 100%)",
    group_id: sundayRunners.id,
    open_to_join: true,
    booking_url: null,
    category: "outdoorRun",
    duration: 30,
  },
  {
    id: "w-last-week-strength",
    title: "Deadlift day",
    start_time: daysAgo(5, 16, 0),
    location: "Equinox, SoHo",
    creator_id: brandon.id,
    creator_username: brandon.username,
    creator_full_name: brandon.full_name,
    creator_avatar_url: brandon.avatar_url,
    participants: [wp(brandon), wp(danny), wp(CURRENT_USER)],
    description: "Heavy pulls. Work up to 3RM.",
    cover_gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    group_id: null,
    open_to_join: false,
    booking_url: null,
    category: "traditionalStrength",
    duration: 60,
  },
  {
    id: "w-next-week-cycle",
    title: "Citi Bike century attempt",
    start_time: daysFromNow(8, 6, 0),
    location: "Brooklyn Bridge, Manhattan side",
    creator_id: luke.id,
    creator_username: luke.username,
    creator_full_name: luke.full_name,
    creator_avatar_url: luke.avatar_url,
    participants: [wp(luke), wp(finn), wp(CURRENT_USER), wp(brandon), wp(tye)],
    description: "100-mile Citi Bike ride. We're either legends or idiots. Probably both.",
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #1fc262 100%)",
    group_id: cycleCrew.id,
    open_to_join: true,
    booking_url: null,
    category: "outdoorCycle",
    duration: 360,
  },
  {
    id: "w-next-week-hiit",
    title: "Rumble Boxing",
    start_time: daysFromNow(9, 18, 30),
    location: "Rumble Boxing, FiDi",
    creator_id: kiera.id,
    creator_username: kiera.username,
    creator_full_name: kiera.full_name,
    creator_avatar_url: kiera.avatar_url,
    participants: [wp(kiera), wp(kyrah), wp(CURRENT_USER)],
    description: "Full-body boxing workout. 10 rounds. Gloves provided.",
    cover_gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    category: "hiit",
    duration: 45,
  },
  {
    id: "w-mid-month-climb",
    title: "VITAL comp night",
    start_time: daysFromNow(12, 19, 0),
    location: "VITAL Climbing Gym, Williamsburg",
    creator_id: finn.id,
    creator_username: finn.username,
    creator_full_name: finn.full_name,
    creator_avatar_url: finn.avatar_url,
    participants: [wp(finn), wp(tye), wp(kyrah), wp(CURRENT_USER), wp(kiera)],
    description: "Monthly bouldering comp. All levels. Beer after.",
    cover_gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    group_id: climbCrew.id,
    open_to_join: true,
    booking_url: null,
    category: "climbing",
    duration: 120,
  },
  {
    id: "w-mid-month-yoga",
    title: "Y7 candlelight flow",
    start_time: daysFromNow(14, 20, 0),
    location: "Y7 Studio, Flatiron",
    creator_id: kyrah.id,
    creator_username: kyrah.username,
    creator_full_name: kyrah.full_name,
    creator_avatar_url: kyrah.avatar_url,
    participants: [wp(kyrah), wp(kiera), wp(CURRENT_USER)],
    description: "Hip-hop vinyasa by candlelight. Heated room. Bring a towel.",
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #7a3dd4 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    category: "yoga",
    duration: 60,
  },
  {
    id: "w-late-month-run",
    title: "Prospect Park tempo",
    start_time: daysFromNow(18, 6, 30),
    location: "Grand Army Plaza, Prospect Park",
    creator_id: charles.id,
    creator_username: charles.username,
    creator_full_name: charles.full_name,
    creator_avatar_url: charles.avatar_url,
    participants: [wp(charles), wp(michael), wp(danny), wp(CURRENT_USER)],
    description: "5-mile tempo run around the park loop. Pacing for 7:30/mi.",
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #093fb0 100%)",
    group_id: sundayRunners.id,
    open_to_join: true,
    booking_url: null,
    category: "outdoorRun",
    duration: 40,
  },
  {
    id: "w-end-month-strength",
    title: "Leg day from hell",
    start_time: daysFromNow(22, 17, 0),
    location: "Equinox, Flatiron",
    creator_id: danny.id,
    creator_username: danny.username,
    creator_full_name: danny.full_name,
    creator_avatar_url: danny.avatar_url,
    participants: [wp(danny), wp(brandon), wp(CURRENT_USER), wp(luke)],
    description: "Squats, lunges, leg press, calf raises. You've been warned.",
    cover_gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
    group_id: null,
    open_to_join: false,
    booking_url: null,
    category: "traditionalStrength",
    duration: 75,
  },
];

// Wire up group → upcoming workouts
cycleCrew.upcoming_workouts = MOCK_WORKOUTS.filter(
  (w) => w.group_id === cycleCrew.id && new Date(w.start_time) > new Date(),
);
sundayRunners.upcoming_workouts = MOCK_WORKOUTS.filter(
  (w) => w.group_id === sundayRunners.id && new Date(w.start_time) > new Date(),
);
climbCrew.upcoming_workouts = MOCK_WORKOUTS.filter(
  (w) => w.group_id === climbCrew.id && new Date(w.start_time) > new Date(),
);

// ----------------------------------------------------------------
// Notifications
// ----------------------------------------------------------------

// Resolve notification actor from actor_id
export function getNotificationActor(n: MockNotification): MockUser | undefined {
  if (!n.actor_id) return undefined;
  return getAllKnownUsers().find((u) => u.id === n.actor_id);
}

// Resolve notification link href from type + entity_id/related_id
export function getNotificationLink(n: MockNotification): string {
  switch (n.type) {
    case "friend_request": {
      const actor = getNotificationActor(n);
      return actor ? `/profile/${actor.username}` : "#";
    }
    case "friend_request_accepted":
    case "profile_view": {
      const actor = getNotificationActor(n);
      return actor ? `/profile/${actor.username}` : "#";
    }
    case "workout_join":
    case "workout_update":
    case "workout_invite":
    case "friend_workout":
    case "workout_reaction":
    case "workout_comment":
    case "upcoming_activity":
      return n.entity_id ? `/workouts/${n.entity_id}` : "#";
    case "new_message":
      return n.related_id ? `/messages/${n.related_id}` : "#";
    default:
      return "#";
  }
}

// TODO: replace with notifications RPC
export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "n1",
    type: "workout_join",
    message: "Finn joined your workout Good Saturdays is back!!",
    actor_id: finn.id,
    entity_id: "w-good-sat",
    related_id: null,
    is_read: false,
    created_at: daysAgo(0, 14, 22),
  },
  {
    id: "n2",
    type: "workout_invite",
    message: "Luke invited you to Good Saturdays is back!!",
    actor_id: luke.id,
    entity_id: "w-good-sat",
    related_id: null,
    is_read: false,
    created_at: daysAgo(0, 10, 5),
  },
  {
    id: "n3",
    type: "friend_request",
    message: "Charles sent you a friend request",
    actor_id: charles.id,
    entity_id: null,
    related_id: null,
    is_read: false,
    created_at: daysAgo(1, 9, 30),
  },
  {
    id: "n4",
    type: "workout_comment",
    message: "Kyrah commented on VITAL bouldering sesh",
    actor_id: kyrah.id,
    entity_id: "w-bouldering",
    related_id: null,
    is_read: true,
    created_at: daysAgo(1, 8, 0),
  },
  {
    id: "n5",
    type: "workout_reaction",
    message: "Kyrah reacted to VITAL bouldering sesh",
    actor_id: kyrah.id,
    entity_id: "w-bouldering",
    related_id: null,
    is_read: true,
    created_at: daysAgo(2, 16, 45),
  },
  {
    id: "n6",
    type: "upcoming_activity",
    message: "Central Park 6-miler starts in 1 hour",
    actor_id: null,
    entity_id: "w-central-park",
    related_id: null,
    is_read: false,
    created_at: daysAgo(0, 6, 0),
  },
  {
    id: "n7",
    type: "friend_workout",
    message: "Brandon posted a new workout: Deadlift day",
    actor_id: brandon.id,
    entity_id: "w-last-week-strength",
    related_id: null,
    is_read: true,
    created_at: daysAgo(2, 20, 10),
  },
  {
    id: "n8",
    type: "friend_request_accepted",
    message: "Tye accepted your friend request",
    actor_id: tye.id,
    entity_id: null,
    related_id: null,
    is_read: true,
    created_at: daysAgo(3, 11, 0),
  },
  {
    id: "n9",
    type: "workout_join",
    message: "Danny joined your workout Morning shake-out run",
    actor_id: danny.id,
    entity_id: "w-today-run",
    related_id: null,
    is_read: false,
    created_at: daysAgo(0, 7, 0),
  },
  {
    id: "n10",
    type: "profile_view",
    message: "Michael viewed your profile",
    actor_id: michael.id,
    entity_id: null,
    related_id: null,
    is_read: true,
    created_at: daysAgo(4, 15, 0),
  },
];

// ----------------------------------------------------------------
// Recommendations
// ----------------------------------------------------------------

// TODO: replace with recommendation engine RPC
export const MOCK_RECOMMENDATIONS: MockRecommendation[] = [
  {
    workout: MOCK_WORKOUTS[1],
    reason: "Sunday runners \u00b7 3 friends going",
  },
  {
    workout: MOCK_WORKOUTS[2],
    reason: "Finn posted in Climb crew",
  },
  {
    workout: MOCK_WORKOUTS[3],
    reason: "You\u2019re in Cycle crew",
  },
  {
    workout: MOCK_WORKOUTS[4],
    reason: "Kyrah is hosting near you",
  },
];

// ----------------------------------------------------------------
// Invites (pending response from current user)
// ----------------------------------------------------------------

// TODO: replace with pending invites RPC
export const MOCK_INVITES: MockWorkout[] = [
  MOCK_WORKOUTS[0], // Good Saturdays
  MOCK_WORKOUTS[3], // Peloton ride
];

// ----------------------------------------------------------------
// Dashboard-specific data
// ----------------------------------------------------------------

export const USER_STATS = {
  friends: 42,
  groups: 4,
  workouts_this_month: 16,
};

export const FRIEND_REQUESTS_COUNT: number = 2;

export const DISCOVERABLE_FRIENDS = {
  count: 14,
  preview_avatars: [finn, kyrah],
};

// ----------------------------------------------------------------
// Friend states & friend-finding data
// Aligned to iOS FriendRequest.RequestStatus + FriendshipDTO model
// See docs/ios-canonical/friends.md
// ----------------------------------------------------------------

export type FriendStatus = "none" | "request_sent" | "request_received" | "friends";

export type MockFriendRequest = {
  id: string;
  user: MockUser;
  mutual_friends_count: number;
  created_at: string;
};

export type MockSuggestedUser = {
  user: MockUser;
  mutual_friends_count: number;
  mutual_friend_avatars: MockUser[];
};

// Non-friend users for suggested/search results
const SUGGESTED_USERS_RAW: MockUser[] = [
  { id: "u-nina", full_name: "Nina Patel", username: "ninapatel", avatar_url: null, initials: "NP", gradient_seed: "N" },
  { id: "u-marcus", full_name: "Marcus Chen", username: "marcuschen", avatar_url: null, initials: "MC", gradient_seed: "M2" },
  { id: "u-sofia", full_name: "Sofia Reyes", username: "sofiareyes", avatar_url: null, initials: "SR", gradient_seed: "S" },
  { id: "u-omar", full_name: "Omar Hassan", username: "omarhassan", avatar_url: null, initials: "OH", gradient_seed: "O" },
  { id: "u-alex", full_name: "Alex Kim", username: "alexkim", avatar_url: null, initials: "AK", gradient_seed: "A" },
  { id: "u-priya", full_name: "Priya Sharma", username: "priyasharma", avatar_url: null, initials: "PS", gradient_seed: "P" },
  { id: "u-jordan", full_name: "Jordan Blake", username: "jordanblake", avatar_url: null, initials: "JBL", gradient_seed: "J2" },
  { id: "u-maya", full_name: "Maya Torres", username: "mayatorres", avatar_url: null, initials: "MT", gradient_seed: "M3" },
  { id: "u-ethan", full_name: "Ethan Brooks", username: "ethanbrooks", avatar_url: null, initials: "EB", gradient_seed: "E2" },
  { id: "u-chloe", full_name: "Chloe Nguyen", username: "chloeng", avatar_url: null, initials: "CN", gradient_seed: "C2" },
  { id: "u-liam", full_name: "Liam O'Brien", username: "liamobrien", avatar_url: null, initials: "LO", gradient_seed: "L2" },
  { id: "u-ava", full_name: "Ava Martinez", username: "avamartinez", avatar_url: null, initials: "AM", gradient_seed: "A2" },
  { id: "u-noah", full_name: "Noah Davis", username: "noahdavis", avatar_url: null, initials: "ND", gradient_seed: "N2" },
  { id: "u-zara", full_name: "Zara Williams", username: "zarawilliams", avatar_url: null, initials: "ZW", gradient_seed: "Z" },
];

// TODO: replace with get_incoming_friend_requests RPC when backend ready
export const MOCK_INCOMING_REQUESTS: MockFriendRequest[] = [
  {
    id: "fr-1",
    user: SUGGESTED_USERS_RAW[0], // Nina Patel
    mutual_friends_count: 4,
    created_at: "2026-05-26T14:30:00Z",
  },
  {
    id: "fr-2",
    user: SUGGESTED_USERS_RAW[1], // Marcus Chen
    mutual_friends_count: 2,
    created_at: "2026-05-25T09:15:00Z",
  },
];

// TODO: replace with get_outgoing_friend_requests RPC when backend ready
export const MOCK_OUTGOING_REQUESTS: MockFriendRequest[] = [
  {
    id: "fr-3",
    user: SUGGESTED_USERS_RAW[2], // Sofia Reyes
    mutual_friends_count: 1,
    created_at: "2026-05-27T08:00:00Z",
  },
];

// TODO: replace with get_suggested_users RPC when backend ready
export const MOCK_SUGGESTED_USERS: MockSuggestedUser[] = SUGGESTED_USERS_RAW.slice(3).map(
  (user, i) => ({
    user,
    mutual_friends_count: [5, 3, 7, 2, 8, 1, 4, 6, 3, 2, 5][i] ?? 1,
    mutual_friend_avatars: MOCK_FRIENDS.slice(0, Math.min(3, [2, 1, 3, 1, 3, 1, 2, 2, 1, 1, 2][i] ?? 1)),
  }),
);

// TODO: replace with search_users RPC when backend ready
export function searchUsers(query: string): MockUser[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getAllKnownUsers().filter(
    (u) =>
      u.full_name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q),
  ).slice(0, 20);
}

// TODO: replace with get_incoming_friend_requests RPC when backend ready
export function getIncomingFriendRequests(): MockFriendRequest[] {
  return MOCK_INCOMING_REQUESTS;
}

// TODO: replace with get_outgoing_friend_requests RPC when backend ready
export function getOutgoingFriendRequests(): MockFriendRequest[] {
  return MOCK_OUTGOING_REQUESTS;
}

// TODO: replace with get_suggested_users RPC when backend ready
export function getSuggestedUsers(): MockSuggestedUser[] {
  return MOCK_SUGGESTED_USERS;
}

// TODO: replace with backend friendship lookup
export function getFriendStatus(userId: string): FriendStatus {
  if (MOCK_FRIENDS.some((f) => f.id === userId)) return "friends";
  if (MOCK_INCOMING_REQUESTS.some((r) => r.user.id === userId)) return "request_received";
  if (MOCK_OUTGOING_REQUESTS.some((r) => r.user.id === userId)) return "request_sent";
  return "none";
}

// ----------------------------------------------------------------
// Activity cover photos (Unsplash)
// ----------------------------------------------------------------

// Keys match iOS WorkoutCategory camelCase keys
export const ACTIVITY_COVER_PHOTOS: Record<string, string> = {
  outdoorRun: "https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&q=80&auto=format&fit=crop",
  indoorRun: "https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&q=80&auto=format&fit=crop",
  outdoorCycle: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80&auto=format&fit=crop",
  indoorCycle: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80&auto=format&fit=crop",
  climbing: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80&auto=format&fit=crop",
  yoga: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80&auto=format&fit=crop",
  traditionalStrength: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&auto=format&fit=crop",
  functionalStrength: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&auto=format&fit=crop",
  hiit: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&auto=format&fit=crop",
  trackAndField: "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=600&q=80&auto=format&fit=crop",
  outdoorWalk: "https://images.unsplash.com/photo-1502163140606-888448ae8cfe?w=600&q=80&auto=format&fit=crop",
  boxing: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&q=80&auto=format&fit=crop",
  basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80&auto=format&fit=crop",
};

export function coverPhotoForActivity(categoryKey: string): string {
  return ACTIVITY_COVER_PHOTOS[categoryKey] ?? ACTIVITY_COVER_PHOTOS["outdoorRun"];
}

// Build a MockUser from the flattened creator fields on a workout.
// Consumers that need a MockUser for the host (avatar, profile link) use this.
export function getWorkoutHost(w: MockWorkout): MockUser {
  const first = (w.creator_full_name || "?").charAt(0).toUpperCase();
  return {
    id: w.creator_id,
    full_name: w.creator_full_name,
    username: w.creator_username,
    avatar_url: w.creator_avatar_url,
    initials: first,
    gradient_seed: first,
  };
}

// TODO: replace with get_workout RPC when backend ready
export function getWorkoutById(id: string): MockWorkout | undefined {
  return MOCK_WORKOUTS.find((w) => w.id === id);
}

// Get the display name for a workout's category (maps key to ACTIVITIES list)
export function categoryDisplayName(key: string): string {
  const activity = ACTIVITIES.find((a) => a.key === key);
  return activity?.displayName ?? key;
}

// ----------------------------------------------------------------
// Profile helpers
// ----------------------------------------------------------------

// Aggregates every MockUser across all mock data sources, deduped by id.
// This is the lookup surface for profile pages — anyone visible anywhere should be visitable.
// TODO: replace with get_profile_by_username RPC when backend ready
export function getAllKnownUsers(): MockUser[] {
  const seen = new Map<string, MockUser>();
  const add = (u: MockUser | undefined | null) => {
    if (u && u.id && !seen.has(u.id)) seen.set(u.id, u);
  };

  add(CURRENT_USER);
  MOCK_FRIENDS.forEach(add);
  SUGGESTED_USERS_RAW.forEach(add);
  MOCK_INCOMING_REQUESTS.forEach((r) => add(r.user));
  MOCK_OUTGOING_REQUESTS.forEach((r) => add(r.user));
  MOCK_WORKOUTS.forEach((w) => {
    add(getWorkoutHost(w));
  });
  MOCK_GROUPS.forEach((g) => {
    g.members.forEach(add);
  });
  MOCK_CONVERSATIONS.forEach((c) => {
    c.participants.forEach(add);
  });

  return Array.from(seen.values());
}

export function getUserByUsername(username: string): MockUser | undefined {
  const normalized = username.replace(/^@/, "").toLowerCase();
  return getAllKnownUsers().find(
    (u) => u.username.replace(/^@/, "").toLowerCase() === normalized,
  );
}

// TODO: replace with get_mutual_friends RPC when backend ready
export function getMutualFriends(otherUser: MockUser): MockUser[] {
  return MOCK_FRIENDS.filter(
    (u) => u.id !== otherUser.id && u.id !== CURRENT_USER.id,
  ).slice(0, 6);
}

// TODO: replace with get_shared_workouts RPC when backend ready
export function getSharedWorkouts(otherUser: MockUser): MockWorkout[] {
  return MOCK_WORKOUTS.filter(
    (w) =>
      w.participants.some((p) => p.user_id === CURRENT_USER.id) &&
      w.participants.some((p) => p.user_id === otherUser.id),
  );
}

// TODO: replace with RPC
export function getWorkoutsHostedByUser(user: MockUser): MockWorkout[] {
  return MOCK_WORKOUTS.filter((w) => w.creator_id === user.id);
}

// TODO: replace with RPC
export function getWorkoutsUserCouldJoin(otherUser: MockUser): MockWorkout[] {
  const now = new Date();
  return MOCK_WORKOUTS.filter(
    (w) =>
      new Date(w.start_time) >= now &&
      w.participants.some((p) => p.user_id === otherUser.id) &&
      !w.participants.some((p) => p.user_id === CURRENT_USER.id),
  );
}

// ----------------------------------------------------------------
// Canonical activity list (from iOS Models.swift)
// ----------------------------------------------------------------

export type Activity = {
  key: string;
  displayName: string;
  icon: string;
};

export const ACTIVITIES: Activity[] = [
  { key: "americanFootball", displayName: "American Football", icon: "\ud83c\udfc8" },
  { key: "archery", displayName: "Archery", icon: "\ud83c\udfaf" },
  { key: "australianFootball", displayName: "Australian Football", icon: "\ud83c\udfc9" },
  { key: "badminton", displayName: "Badminton", icon: "\ud83c\udff8" },
  { key: "barre", displayName: "Barre", icon: "\ud83e\ude70" },
  { key: "baseball", displayName: "Baseball", icon: "\u26be" },
  { key: "basketball", displayName: "Basketball", icon: "\ud83c\udfc0" },
  { key: "bowling", displayName: "Bowling", icon: "\ud83c\udfb3" },
  { key: "boxing", displayName: "Boxing", icon: "\ud83e\udd4a" },
  { key: "climbing", displayName: "Climbing", icon: "\ud83e\uddd7" },
  { key: "cooldown", displayName: "Cooldown", icon: "\ud83e\uddca" },
  { key: "coreTraining", displayName: "Core Training", icon: "\ud83d\udcaa" },
  { key: "cricket", displayName: "Cricket", icon: "\ud83c\udfcf" },
  { key: "crossCountrySkiing", displayName: "Cross Country Skiing", icon: "\u26f7\ufe0f" },
  { key: "crossTraining", displayName: "Cross Training", icon: "\ud83c\udfcb\ufe0f" },
  { key: "curling", displayName: "Curling", icon: "\ud83e\udd4c" },
  { key: "dance", displayName: "Dance", icon: "\ud83d\udc83" },
  { key: "discSports", displayName: "Disc Sports", icon: "\ud83e\udd4f" },
  { key: "downhillSkiing", displayName: "Downhill Skiing", icon: "\u26f7\ufe0f" },
  { key: "elliptical", displayName: "Elliptical", icon: "\ud83c\udfc3" },
  { key: "equestrianSports", displayName: "Equestrian Sports", icon: "\ud83d\udc34" },
  { key: "fencing", displayName: "Fencing", icon: "\ud83e\udd3a" },
  { key: "fishing", displayName: "Fishing", icon: "\ud83c\udfa3" },
  { key: "fitnessGaming", displayName: "Fitness Gaming", icon: "\ud83c\udfae" },
  { key: "flexibility", displayName: "Flexibility", icon: "\ud83e\udd38" },
  { key: "functionalStrength", displayName: "Functional Strength Training", icon: "\ud83c\udfcb\ufe0f" },
  { key: "golf", displayName: "Golf", icon: "\u26f3" },
  { key: "gymnastics", displayName: "Gymnastics", icon: "\ud83e\udd38" },
  { key: "handCycling", displayName: "Hand Cycling", icon: "\ud83d\udeb4" },
  { key: "handball", displayName: "Handball", icon: "\ud83e\udd3e" },
  { key: "hiit", displayName: "High Intensity Interval Training", icon: "\ud83d\udd25" },
  { key: "hike", displayName: "Hiking", icon: "\ud83e\udd7e" },
  { key: "hunting", displayName: "Hunting", icon: "\ud83c\udff9" },
  { key: "hyrox", displayName: "Hyrox", icon: "\ud83d\udcaa" },
  { key: "indoorCycle", displayName: "Indoor Cycle", icon: "\ud83d\udeb4" },
  { key: "indoorHockey", displayName: "Indoor Hockey", icon: "\ud83c\udfd2" },
  { key: "indoorRowing", displayName: "Indoor Rowing", icon: "\ud83d\udea3" },
  { key: "indoorRun", displayName: "Indoor Run", icon: "\ud83c\udfc3" },
  { key: "indoorSkating", displayName: "Indoor Skating", icon: "\u26f8\ufe0f" },
  { key: "indoorSoccer", displayName: "Indoor Soccer", icon: "\u26bd" },
  { key: "indoorWalk", displayName: "Indoor Walk", icon: "\ud83d\udeb6" },
  { key: "jumpRope", displayName: "Jump Rope", icon: "\ud83e\udea2" },
  { key: "kickboxing", displayName: "Kickboxing", icon: "\ud83e\udd4b" },
  { key: "lacrosse", displayName: "Lacrosse", icon: "\ud83e\udd4d" },
  { key: "martialArts", displayName: "Martial Arts", icon: "\ud83e\udd4b" },
  { key: "mindAndBody", displayName: "Mind & Body", icon: "\ud83e\uddd8" },
  { key: "mixedCardio", displayName: "Mixed Cardio", icon: "\u2764\ufe0f" },
  { key: "openWaterSwim", displayName: "Open Water Swim", icon: "\ud83c\udf0a" },
  { key: "outdoorCycle", displayName: "Outdoor Cycle", icon: "\ud83d\udeb4" },
  { key: "outdoorHockey", displayName: "Outdoor Hockey", icon: "\ud83c\udfd2" },
  { key: "outdoorRowing", displayName: "Outdoor Rowing", icon: "\ud83d\udea3" },
  { key: "outdoorRun", displayName: "Outdoor Run", icon: "\ud83c\udfc3" },
  { key: "outdoorSkating", displayName: "Outdoor Skating", icon: "\u26f8\ufe0f" },
  { key: "outdoorSoccer", displayName: "Outdoor Soccer", icon: "\u26bd" },
  { key: "outdoorWalk", displayName: "Outdoor Walk", icon: "\ud83d\udeb6" },
  { key: "padel", displayName: "P\u00e1del", icon: "\ud83c\udfbe" },
  { key: "paddling", displayName: "Paddling", icon: "\ud83d\udef6" },
  { key: "pickleball", displayName: "Pickleball", icon: "\ud83c\udfd3" },
  { key: "pilates", displayName: "Pilates", icon: "\ud83e\udd38" },
  { key: "play", displayName: "Play", icon: "\ud83e\udd3e" },
  { key: "poolSwim", displayName: "Pool Swim", icon: "\ud83c\udfca" },
  { key: "racquetball", displayName: "Racquetball", icon: "\ud83c\udfbe" },
  { key: "rolling", displayName: "Rolling", icon: "\ud83d\udef9" },
  { key: "rugby", displayName: "Rugby", icon: "\ud83c\udfc9" },
  { key: "sailing", displayName: "Sailing", icon: "\u26f5" },
  { key: "snowSports", displayName: "Snow Sports", icon: "\ud83c\udfbf" },
  { key: "snowboarding", displayName: "Snowboarding", icon: "\ud83c\udfc2" },
  { key: "socialDance", displayName: "Social Dance", icon: "\ud83d\udc83" },
  { key: "softball", displayName: "Softball", icon: "\ud83e\udd4e" },
  { key: "squash", displayName: "Squash", icon: "\ud83c\udfbe" },
  { key: "stairs", displayName: "Stairs", icon: "\ud83e\ude9c" },
  { key: "stairStepper", displayName: "Stair Stepper", icon: "\ud83e\ude9c" },
  { key: "stepTraining", displayName: "Step Training", icon: "\ud83e\ude9c" },
  { key: "surfing", displayName: "Surfing", icon: "\ud83c\udfc4" },
  { key: "tableTennis", displayName: "Table Tennis", icon: "\ud83c\udfd3" },
  { key: "taiChi", displayName: "Tai Chi", icon: "\ud83e\uddd8" },
  { key: "tennis", displayName: "Tennis", icon: "\ud83c\udfbe" },
  { key: "trackAndField", displayName: "Track & Field", icon: "\ud83c\udfc3" },
  { key: "traditionalStrength", displayName: "Traditional Strength Training", icon: "\ud83c\udfcb\ufe0f" },
  { key: "volleyball", displayName: "Volleyball", icon: "\ud83c\udfd0" },
  { key: "wrestling", displayName: "Wrestling", icon: "\ud83e\udd3c" },
  { key: "yoga", displayName: "Yoga", icon: "\ud83e\uddd8" },
];

export function getSuggestedActivities(): Activity[] {
  const suggested = ["outdoorRun", "outdoorSoccer", "yoga"];
  return suggested
    .map((key) => ACTIVITIES.find((a) => a.key === key))
    .filter((a): a is Activity => a !== undefined);
}

export function getActivityByKey(key: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.key === key);
}

// ----------------------------------------------------------------
// Messages & Conversations
// ----------------------------------------------------------------

export type MockReaction = {
  emoji: string;
  user_id: string;
};

export type MockMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  reply_to_id?: string;
  reactions: MockReaction[];
  is_read: boolean;
};

export type MockConversation = {
  id: string;
  is_group: boolean;
  participants: MockUser[];
  last_message: MockMessage | null;
  unread_count: number;
  is_pinned: boolean;
  is_muted: boolean;
  updated_at: string;
};

// Workout-card message encoding (matches iOS WORKOUT_CARD:: format)
export function encodeWorkoutCard(w: MockWorkout): string {
  return [
    "WORKOUT_CARD",
    w.id,
    w.title,
    w.start_time,
    w.location ?? "",
    w.category ?? "other",
    w.creator_id,
    w.booking_url ?? "",
  ].join("::");
}

export type ParsedWorkoutCard = {
  workout_id: string;
  title: string;
  start_time: string;
  location: string;
  category: string;
  creator_id: string;
  booking_url: string;
};

export function parseWorkoutCard(text: string): ParsedWorkoutCard | null {
  if (!text.startsWith("WORKOUT_CARD::")) return null;
  const parts = text.split("::");
  if (parts.length < 7) return null;
  return {
    workout_id: parts[1],
    title: parts[2],
    start_time: parts[3],
    location: parts[4],
    category: parts[5],
    creator_id: parts[6],
    booking_url: parts[7] ?? "",
  };
}

export function isJumbomoji(text: string): boolean {
  if (!text || text.length === 0) return false;
  const trimmed = text.trim();
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const graphemes = Array.from(segmenter.segment(trimmed));
    if (graphemes.length === 0 || graphemes.length > 3) return false;
    const emojiRegex = /\p{Extended_Pictographic}/u;
    return graphemes.every((g) => emojiRegex.test(g.segment));
  }
  const emojiRegex = /^(\p{Extended_Pictographic}|\s){1,12}$/u;
  return emojiRegex.test(trimmed) && trimmed.length > 0;
}

// Central Park 6-miler workout card text
const _cpWorkoutCard = encodeWorkoutCard(MOCK_WORKOUTS.find((w) => w.id === "w-central-park")!);
// VITAL bouldering workout card text
const _vitalWorkoutCard = encodeWorkoutCard(MOCK_WORKOUTS.find((w) => w.id === "w-bouldering")!);
// Peloton ride workout card text
const _pelotonWorkoutCard = encodeWorkoutCard(MOCK_WORKOUTS.find((w) => w.id === "w-peloton")!);

// TODO: replace with get_messages_for_conversation RPC, paginated
export const MOCK_MESSAGES: MockMessage[] = [
  // --- Luke conversation (conv-luke) — 12 messages ---
  { id: "m-l01", conversation_id: "conv-luke", sender_id: luke.id, text: "yo are you running central park sunday?", created_at: minutesAgo(2880), reactions: [], is_read: true },
  { id: "m-l02", conversation_id: "conv-luke", sender_id: CURRENT_USER.id, text: "100%. what time?", created_at: minutesAgo(2875), reactions: [], is_read: true },
  { id: "m-l03", conversation_id: "conv-luke", sender_id: luke.id, text: "michael said 7am at engineers gate", created_at: minutesAgo(2870), reactions: [], is_read: true },
  { id: "m-l04", conversation_id: "conv-luke", sender_id: CURRENT_USER.id, text: "perfect. 6 miler?", created_at: minutesAgo(2865), reply_to_id: "m-l03", reactions: [], is_read: true },
  { id: "m-l05", conversation_id: "conv-luke", sender_id: luke.id, text: "yeah full lower loop", created_at: minutesAgo(2860), reactions: [], is_read: true },
  { id: "m-l06", conversation_id: "conv-luke", sender_id: luke.id, text: _cpWorkoutCard, created_at: minutesAgo(1440), reactions: [], is_read: true },
  { id: "m-l07", conversation_id: "conv-luke", sender_id: CURRENT_USER.id, text: "lets go. adding it to my calendar", created_at: minutesAgo(1410), reactions: [{ emoji: "\ud83d\udc4d", user_id: luke.id }], is_read: true },
  { id: "m-l08", conversation_id: "conv-luke", sender_id: luke.id, text: "bet", created_at: minutesAgo(1405), reactions: [], is_read: true },
  { id: "m-l09", conversation_id: "conv-luke", sender_id: CURRENT_USER.id, text: "should we warm up at the gate or just start running?", created_at: minutesAgo(360), reactions: [], is_read: true },
  { id: "m-l10", conversation_id: "conv-luke", sender_id: luke.id, text: "warm up for sure. dynamic stretches", created_at: minutesAgo(330), reactions: [], is_read: true },
  { id: "m-l11", conversation_id: "conv-luke", sender_id: CURRENT_USER.id, text: "just confirmed with michael. we're locked in", created_at: minutesAgo(125), reactions: [], is_read: true },
  { id: "m-l12", conversation_id: "conv-luke", sender_id: luke.id, text: "Sweeeet", created_at: minutesAgo(120), reactions: [{ emoji: "\u2764\ufe0f", user_id: CURRENT_USER.id }], is_read: true },

  // --- Kyrah conversation (conv-kyrah) — 5 messages ---
  { id: "m-k01", conversation_id: "conv-kyrah", sender_id: kyrah.id, text: "have you been climbing lately?", created_at: minutesAgo(300), reactions: [], is_read: true },
  { id: "m-k02", conversation_id: "conv-kyrah", sender_id: CURRENT_USER.id, text: "not since last week. need to get back in there", created_at: minutesAgo(270), reactions: [], is_read: true },
  { id: "m-k03", conversation_id: "conv-kyrah", sender_id: kyrah.id, text: "finn just posted a VITAL sesh, you should come", created_at: minutesAgo(240), reactions: [], is_read: false },
  { id: "m-k04", conversation_id: "conv-kyrah", sender_id: CURRENT_USER.id, text: "say less", created_at: minutesAgo(210), reactions: [], is_read: true },
  { id: "m-k05", conversation_id: "conv-kyrah", sender_id: CURRENT_USER.id, text: _vitalWorkoutCard, created_at: minutesAgo(180), reactions: [], is_read: true },

  // --- Michael conversation (conv-michael) — 4 messages ---
  { id: "m-m01", conversation_id: "conv-michael", sender_id: CURRENT_USER.id, text: "good run today", created_at: minutesAgo(180), reactions: [], is_read: true },
  { id: "m-m02", conversation_id: "conv-michael", sender_id: michael.id, text: "crushed it. new PR pace", created_at: minutesAgo(150), reactions: [], is_read: true },
  { id: "m-m03", conversation_id: "conv-michael", sender_id: CURRENT_USER.id, text: "lets gooo", created_at: minutesAgo(120), reactions: [{ emoji: "\ud83d\udd25", user_id: michael.id }], is_read: true },
  { id: "m-m04", conversation_id: "conv-michael", sender_id: michael.id, text: "\ud83d\udd25", created_at: minutesAgo(60), reactions: [], is_read: false },

  // --- Brandon conversation (conv-brandon) — 3 messages ---
  { id: "m-b01", conversation_id: "conv-brandon", sender_id: CURRENT_USER.id, text: "you going to danny's deadlift session?", created_at: minutesAgo(1560), reactions: [], is_read: true },
  { id: "m-b02", conversation_id: "conv-brandon", sender_id: brandon.id, text: "thinking about it", created_at: minutesAgo(1500), reactions: [], is_read: true },
  { id: "m-b03", conversation_id: "conv-brandon", sender_id: brandon.id, text: "lmk if you're in", created_at: minutesAgo(1440), reactions: [], is_read: true },

  // --- JB conversation (conv-jb) — 3 messages ---
  { id: "m-j01", conversation_id: "conv-jb", sender_id: jb.id, text: "you need to try this peloton class", created_at: minutesAgo(2880), reactions: [], is_read: true },
  { id: "m-j02", conversation_id: "conv-jb", sender_id: jb.id, text: _pelotonWorkoutCard, created_at: minutesAgo(2870), reactions: [], is_read: true },
  { id: "m-j03", conversation_id: "conv-jb", sender_id: CURRENT_USER.id, text: "booking it now", created_at: minutesAgo(2820), reactions: [], is_read: true },

  // --- Charles conversation (conv-charles) — 3 messages ---
  { id: "m-c01", conversation_id: "conv-charles", sender_id: CURRENT_USER.id, text: "great run on sunday. prospect park was perfect", created_at: minutesAgo(4320), reactions: [], is_read: true },
  { id: "m-c02", conversation_id: "conv-charles", sender_id: charles.id, text: "need to do that more often", created_at: minutesAgo(4260), reactions: [], is_read: true },
  { id: "m-c03", conversation_id: "conv-charles", sender_id: charles.id, text: "\ud83d\ude4f\ud83d\ude4f", created_at: minutesAgo(4200), reactions: [], is_read: true },
];

// TODO: replace with get_conversations RPC when backend ready
export const MOCK_CONVERSATIONS: MockConversation[] = [
  { id: "conv-luke", is_group: false, participants: [CURRENT_USER, luke], last_message: null, unread_count: 0, is_pinned: true, is_muted: false, updated_at: minutesAgo(120) },
  { id: "conv-michael", is_group: false, participants: [CURRENT_USER, michael], last_message: null, unread_count: 1, is_pinned: false, is_muted: false, updated_at: minutesAgo(60) },
  { id: "conv-kyrah", is_group: false, participants: [CURRENT_USER, kyrah], last_message: null, unread_count: 1, is_pinned: false, is_muted: false, updated_at: minutesAgo(180) },
  { id: "conv-brandon", is_group: false, participants: [CURRENT_USER, brandon], last_message: null, unread_count: 0, is_pinned: false, is_muted: false, updated_at: minutesAgo(1440) },
  { id: "conv-jb", is_group: false, participants: [CURRENT_USER, jb], last_message: null, unread_count: 0, is_pinned: false, is_muted: false, updated_at: minutesAgo(2820) },
  { id: "conv-charles", is_group: false, participants: [CURRENT_USER, charles], last_message: null, unread_count: 0, is_pinned: false, is_muted: false, updated_at: minutesAgo(4200) },
];

// Wire last_message from MOCK_MESSAGES (same pattern as group → upcoming_workouts)
for (const conv of MOCK_CONVERSATIONS) {
  const msgs = MOCK_MESSAGES.filter((m) => m.conversation_id === conv.id);
  conv.last_message = msgs[msgs.length - 1] ?? null;
}

// ----------------------------------------------------------------
// Conversation helpers
// ----------------------------------------------------------------

export function getConversationsForUser(): MockConversation[] {
  return [...MOCK_CONVERSATIONS].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
  // TODO: replace with get_conversations RPC when backend ready
}

export function getConversation(id: string): MockConversation | undefined {
  return MOCK_CONVERSATIONS.find((c) => c.id === id);
  // TODO: replace with get_conversation RPC
}

export function getMessagesForConversation(conversationId: string): MockMessage[] {
  return MOCK_MESSAGES
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  // TODO: replace with get_messages_for_conversation RPC, paginated
}

export function getOtherParticipant(conv: MockConversation): MockUser | undefined {
  if (conv.is_group) return undefined;
  return conv.participants.find((p) => p.id !== CURRENT_USER.id);
}

// findDMWith: helper for finding existing DMs. Currently unused on web (messaging deferred to iOS app).
// Kept for potential future use if web messaging is reintroduced.
export function findDMWith(otherUser: MockUser): MockConversation | undefined {
  return MOCK_CONVERSATIONS.find(
    (c) => !c.is_group && c.participants.some((p) => p.id === otherUser.id),
  );
  // TODO: replace with get_or_create_dm RPC when backend ready
}

export function getTotalUnreadCount(): number {
  return MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unread_count, 0);
}
