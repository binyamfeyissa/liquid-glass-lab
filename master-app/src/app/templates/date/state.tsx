import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * The whole template keeps its data in this one client-side store. There is
 * no backend and no persistence: state lives in memory for the session, so
 * liking someone on Discover immediately creates the match on the Matches
 * tab and the chat thread the match screen opens. Restarting the app resets
 * the fixtures. Every profile is a fictional adult; "photos" are flat
 * composed panels with initials — no images of real people anywhere.
 */

export interface Profile {
  id: string;
  name: string;
  age: number;
  distanceKm: number;
  job: string;
  bio: string;
  interests: string[];
  /** Two warm colours for the composed "photo" panel. */
  colors: [string, string];
  /** Liking this profile in Discover is an instant match. */
  likesYouBack?: boolean;
  /** This profile shows up under "Likes you" until you decide. */
  likedYou?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string; // "me" or a profile id
  text: string;
  timeLabel: string;
}

export interface Match {
  profileId: string;
  matchedLabel: string;
  isNew: boolean;
}

export const INTERESTS = [
  "Hiking",
  "Coffee",
  "Photography",
  "Cooking",
  "Yoga",
  "Live music",
  "Reading",
  "Travel",
  "Film",
  "Running",
  "Art",
  "Dogs",
  "Climbing",
  "Dancing",
  "Tech",
  "Foodie",
] as const;

export const PROFILES: Profile[] = [
  // ——— The Discover deck ———
  {
    id: "maya",
    name: "Maya",
    age: 27,
    distanceKm: 3,
    job: "Architect",
    bio: "I sketch buildings by day and hunt down the city's best bakeries on weekends. Looking for someone who'll split the last croissant — or at least negotiate fairly.",
    interests: ["Coffee", "Art", "Travel", "Photography"],
    colors: ["#f59e0b", "#ef4444"],
    likesYouBack: true,
  },
  {
    id: "jordan",
    name: "Jordan",
    age: 30,
    distanceKm: 5,
    job: "Teacher",
    bio: "Year-six teacher, weekend trail runner. I will absolutely challenge you to a board game and lose graciously about 40% of the time.",
    interests: ["Running", "Reading", "Hiking"],
    colors: ["#38bdf8", "#6366f1"],
  },
  {
    id: "priya",
    name: "Priya",
    age: 26,
    distanceKm: 2,
    job: "Product designer",
    bio: "Design nerd, amateur chef, professional plant rescuer. My sourdough starter is called Clint Yeastwood and yes, I'm proud of that.",
    interests: ["Cooking", "Foodie", "Photography", "Art"],
    colors: ["#a78bfa", "#ec4899"],
  },
  {
    id: "sam",
    name: "Sam",
    age: 32,
    distanceKm: 8,
    job: "Sound engineer",
    bio: "I mix live gigs and collect vinyl I have no shelf space for. Best first date: a record fair and strong opinions about side B.",
    interests: ["Live music", "Film", "Tech"],
    colors: ["#34d399", "#0ea5e9"],
  },
  {
    id: "elena",
    name: "Elena",
    age: 29,
    distanceKm: 4,
    job: "Marine biologist",
    bio: "I study kelp forests and freedive whenever the water lets me. Tell me your favourite coastline and I'll plan the trip.",
    interests: ["Travel", "Hiking", "Photography", "Reading"],
    colors: ["#22d3ee", "#34d399"],
    likesYouBack: true,
  },
  {
    id: "noah",
    name: "Noah",
    age: 28,
    distanceKm: 6,
    job: "Chef",
    bio: "Sous-chef by night, farmers-market regular by morning. I judge a city by its noodle soups and I'm always mid-research.",
    interests: ["Cooking", "Foodie", "Travel"],
    colors: ["#fb923c", "#f43f5e"],
  },
  {
    id: "aisha",
    name: "Aisha",
    age: 31,
    distanceKm: 7,
    job: "Illustrator",
    bio: "Children's book illustrator with a studio full of half-finished sketchbooks. Dog person — my rescue spaniel, Fig, approves all matches.",
    interests: ["Art", "Dogs", "Reading", "Coffee"],
    colors: ["#f472b6", "#a78bfa"],
  },
  {
    id: "leo",
    name: "Leo",
    age: 35,
    distanceKm: 12,
    job: "Climbing instructor",
    bio: "I teach people to climb things safely and cook things questionably. Sundays are for long routes and longer lunches.",
    interests: ["Climbing", "Hiking", "Cooking"],
    colors: ["#facc15", "#fb923c"],
  },
  // ——— "Likes you" ———
  {
    id: "sofia",
    name: "Sofia",
    age: 25,
    distanceKm: 3,
    job: "Dance teacher",
    bio: "Salsa on Tuesdays, swing on Fridays, and a firm believer that every kitchen is a dance floor waiting to happen.",
    interests: ["Dancing", "Live music", "Coffee"],
    colors: ["#fb7185", "#f59e0b"],
    likedYou: true,
  },
  {
    id: "marcus",
    name: "Marcus",
    age: 33,
    distanceKm: 9,
    job: "Photographer",
    bio: "Documentary photographer, darkroom enthusiast. I develop film the slow way and make coffee the slower way.",
    interests: ["Photography", "Film", "Travel", "Coffee"],
    colors: ["#60a5fa", "#34d399"],
    likedYou: true,
  },
  {
    id: "hana",
    name: "Hana",
    age: 28,
    distanceKm: 5,
    job: "Yoga instructor",
    bio: "Sunrise classes, evening pottery, and a garden that's mostly tomatoes and optimism. Balance in all things — including dessert.",
    interests: ["Yoga", "Cooking", "Art"],
    colors: ["#4ade80", "#22d3ee"],
    likedYou: true,
  },
  // ——— Already matched when the app opens ———
  {
    id: "grace",
    name: "Grace",
    age: 30,
    distanceKm: 4,
    job: "Journalist",
    bio: "Features writer, pub-quiz anchor, firm believer in the long walk as a first date.",
    interests: ["Reading", "Film", "Running"],
    colors: ["#818cf8", "#e879f9"],
  },
  {
    id: "daniel",
    name: "Daniel",
    age: 34,
    distanceKm: 6,
    job: "Software engineer",
    bio: "Builds apps, restores old radios, and keeps a sourdough starter alive against all odds.",
    interests: ["Tech", "Cooking", "Live music"],
    colors: ["#38bdf8", "#4ade80"],
  },
];

export const profileById = (id: string): Profile =>
  PROFILES.find((p) => p.id === id) ?? PROFILES[0];

const SEED_CHATS: Record<string, ChatMessage[]> = {
  grace: [
    { id: "g1", senderId: "grace", text: "Okay, the quiz night rematch is ON. My team has been training. By training I mean arguing about capitals.", timeLabel: "Tue 20:14" },
    { id: "g2", senderId: "me", text: "Bold. We lost by two points and I'm still not over the geography round.", timeLabel: "Tue 20:22" },
    { id: "g3", senderId: "grace", text: "Then Saturday, loser buys coffee at that place near the market?", timeLabel: "Tue 20:23" },
  ],
  daniel: [
    { id: "d1", senderId: "me", text: "The radio lives! It only picks up one station but it lives.", timeLabel: "Mon 19:02" },
    { id: "d2", senderId: "daniel", text: "One station is all you need if it's the right one. Bring it Saturday, I'll bring the sourdough.", timeLabel: "Mon 19:40" },
  ],
};

/** Warm, generic replies the match sends back a moment after you write. */
const REPLY_POOL = [
  "Haha, okay, that's a strong answer",
  "Tell me more — I'm intrigued.",
  "That's exactly the kind of plan I can get behind.",
  "Ha! Fair. Coffee sometime this week?",
  "You might be my favourite match already, just saying.",
  "Ooh, good question. Give me a second to think of an equally good answer.",
];

export interface MyProfile {
  name: string;
  age: number;
  bio: string;
  interests: string[];
}

type Decision = "like" | "pass" | "super";

/** The three backgrounds every screen offers: graphite, broken white, photo. */
export type BackdropMode = "dark" | "light" | "image";

interface KindredState {
  backdrop: BackdropMode;
  setBackdrop: (v: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;

  /** Remaining deck, already filtered by discovery settings. */
  deck: Profile[];
  like: (id: string) => void;
  pass: (id: string) => void;
  superLike: (id: string) => void;
  resetDeck: () => void;
  superLikesLeft: number;

  /** The match overlay Discover shows right after a mutual like. */
  pendingMatch: Profile | null;
  clearPendingMatch: () => void;

  matches: Match[];
  markMatchSeen: (profileId: string) => void;

  /** Profiles who liked you and are still waiting on a decision. */
  likesYou: Profile[];
  likeBack: (id: string) => void;
  dismissLike: (id: string) => void;

  chats: Record<string, ChatMessage[]>;
  sendMessage: (profileId: string, text: string) => void;
  lastMessageOf: (profileId: string) => ChatMessage | undefined;

  myProfile: MyProfile;
  setMyProfile: (patch: Partial<MyProfile>) => void;
  toggleMyInterest: (interest: string) => void;

  ageMin: number;
  ageMax: number;
  setAgeMin: (v: number) => void;
  setAgeMax: (v: number) => void;
  maxDistanceKm: number;
  setMaxDistanceKm: (v: number) => void;
  showMe: boolean;
  setShowMe: (v: boolean) => void;

  notifyMatches: boolean;
  setNotifyMatches: (v: boolean) => void;
  notifyMessages: boolean;
  setNotifyMessages: (v: boolean) => void;
  notifyLikes: boolean;
  setNotifyLikes: (v: boolean) => void;
}

const KindredContext = createContext<KindredState | null>(null);

function nowLabel(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `Today ${hh}:${mm}`;
}

let messageSeq = 0;
const nextMessageId = () => `m${++messageSeq}`;

export function KindredProvider({ children }: { children: ReactNode }) {
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [matches, setMatches] = useState<Match[]>([
    { profileId: "grace", matchedLabel: "Matched on Tuesday", isNew: false },
    { profileId: "daniel", matchedLabel: "Matched on Monday", isNew: true },
  ]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(SEED_CHATS);
  const [superLikesLeft, setSuperLikesLeft] = useState(3);
  const [pendingMatchId, setPendingMatchId] = useState<string | null>(null);
  const replyTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [myProfile, setMyProfileState] = useState<MyProfile>({
    name: "Alex",
    age: 29,
    bio: "Product manager who'd rather be outside. Trail runs, slow mornings, and a camera roll that's 80% other people's dogs.",
    interests: ["Hiking", "Coffee", "Photography", "Dogs"],
  });

  const [ageMin, setAgeMinState] = useState(24);
  const [ageMax, setAgeMaxState] = useState(38);
  const [maxDistanceKm, setMaxDistanceKm] = useState(25);
  const [showMe, setShowMe] = useState(true);
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(false);

  const matchedIds = useMemo(
    () => new Set(matches.map((m) => m.profileId)),
    [matches],
  );

  const deck = useMemo(
    () =>
      PROFILES.filter(
        (p) =>
          !p.likedYou &&
          !matchedIds.has(p.id) &&
          !(p.id in decisions) &&
          p.age >= ageMin &&
          p.age <= ageMax &&
          p.distanceKm <= maxDistanceKm,
      ),
    [decisions, matchedIds, ageMin, ageMax, maxDistanceKm],
  );

  const likesYou = useMemo(
    () =>
      PROFILES.filter(
        (p) => p.likedYou && !(p.id in decisions) && !matchedIds.has(p.id),
      ),
    [decisions, matchedIds],
  );

  const addMatch = useCallback((profileId: string) => {
    setMatches((prev) =>
      prev.some((m) => m.profileId === profileId)
        ? prev
        : [
            { profileId, matchedLabel: "Matched just now", isNew: true },
            ...prev,
          ],
    );
    setChats((prev) =>
      prev[profileId] ? prev : { ...prev, [profileId]: [] },
    );
  }, []);

  const decide = useCallback(
    (id: string, decision: Decision, celebrate = true) => {
      setDecisions((prev) => ({ ...prev, [id]: decision }));
      if (decision !== "pass") {
        const profile = profileById(id);
        if (profile.likesYouBack || profile.likedYou) {
          addMatch(id);
          // The match overlay belongs to Discover; a like-back from the
          // Likes tab goes straight to the chat instead.
          if (celebrate) setPendingMatchId(id);
        }
      }
    },
    [addMatch],
  );

  const like = useCallback((id: string) => decide(id, "like"), [decide]);
  const pass = useCallback((id: string) => decide(id, "pass"), [decide]);
  const superLike = useCallback(
    (id: string) => {
      setSuperLikesLeft((n) => Math.max(0, n - 1));
      decide(id, "super");
    },
    [decide],
  );
  const likeBack = useCallback(
    (id: string) => decide(id, "like", false),
    [decide],
  );
  const dismissLike = useCallback((id: string) => decide(id, "pass"), [decide]);

  const resetDeck = useCallback(() => {
    // Matches stay matched; everyone else comes back for another look.
    setDecisions((prev) => {
      const next: Record<string, Decision> = {};
      for (const [id, d] of Object.entries(prev)) {
        if (matchedIds.has(id)) next[id] = d;
      }
      return next;
    });
  }, [matchedIds]);

  const markMatchSeen = useCallback((profileId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.profileId === profileId ? { ...m, isNew: false } : m)),
    );
  }, []);

  const sendMessage = useCallback((profileId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setChats((prev) => ({
      ...prev,
      [profileId]: [
        ...(prev[profileId] ?? []),
        {
          id: nextMessageId(),
          senderId: "me",
          text: trimmed,
          timeLabel: nowLabel(),
        },
      ],
    }));
    // One canned reply, a moment later — like a real (if prompt) match.
    if (replyTimers.current[profileId]) {
      clearTimeout(replyTimers.current[profileId]);
    }
    replyTimers.current[profileId] = setTimeout(() => {
      setChats((prev) => {
        const thread = prev[profileId] ?? [];
        const reply =
          REPLY_POOL[thread.length % REPLY_POOL.length] ?? REPLY_POOL[0];
        return {
          ...prev,
          [profileId]: [
            ...thread,
            {
              id: nextMessageId(),
              senderId: profileId,
              text: reply,
              timeLabel: nowLabel(),
            },
          ],
        };
      });
    }, 1500);
  }, []);

  const lastMessageOf = useCallback(
    (profileId: string) => {
      const thread = chats[profileId];
      return thread && thread.length > 0
        ? thread[thread.length - 1]
        : undefined;
    },
    [chats],
  );

  const setMyProfile = useCallback((patch: Partial<MyProfile>) => {
    setMyProfileState((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleMyInterest = useCallback((interest: string) => {
    setMyProfileState((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  }, []);

  // Keep the age window sane: min never reaches max, max never drops to min.
  const setAgeMin = useCallback(
    (v: number) => setAgeMinState(Math.min(v, ageMax - 1)),
    [ageMax],
  );
  const setAgeMax = useCallback(
    (v: number) => setAgeMaxState(Math.max(v, ageMin + 1)),
    [ageMin],
  );

  const value: KindredState = {
    backdrop,
    setBackdrop,
    darkMode,
    setDarkMode,
    deck,
    like,
    pass,
    superLike,
    resetDeck,
    superLikesLeft,
    pendingMatch: pendingMatchId ? profileById(pendingMatchId) : null,
    clearPendingMatch: () => setPendingMatchId(null),
    matches,
    markMatchSeen,
    likesYou,
    likeBack,
    dismissLike,
    chats,
    sendMessage,
    lastMessageOf,
    myProfile,
    setMyProfile,
    toggleMyInterest,
    ageMin,
    ageMax,
    setAgeMin,
    setAgeMax,
    maxDistanceKm,
    setMaxDistanceKm,
    showMe,
    setShowMe,
    notifyMatches,
    setNotifyMatches,
    notifyMessages,
    setNotifyMessages,
    notifyLikes,
    setNotifyLikes,
  };

  return (
    <KindredContext.Provider value={value}>{children}</KindredContext.Provider>
  );
}

export function useKindred(): KindredState {
  const ctx = useContext(KindredContext);
  if (!ctx) throw new Error("useKindred must be used inside KindredProvider");
  return ctx;
}
