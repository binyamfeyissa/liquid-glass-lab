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
 * sending a message, creating a group or ending a call updates every screen
 * immediately. Restarting the app resets the fixtures.
 *
 * A note on the message thread UI: the published glacia-native 0.6.0 package
 * does not export a Message component family, so the thread is composed from
 * Glacia primitives (Glass bubbles, Avatar, Text) in `ui.tsx`, following the
 * classic Message / MessageBubble / MessageAvatar / MessageContent /
 * MessageTimestamp structure.
 */

export type Presence = "online" | "busy" | "offline";

export type BackdropMode = "dark" | "light" | "image";

export interface Contact {
  id: string;
  name: string;
  handle: string;
  about: string;
  presence: Presence;
  /** "Active now", "Last seen 2h ago", … */
  presenceLabel: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  /** "me" for the signed-in user, otherwise a contact id. */
  senderId: string;
  text: string;
  timeLabel: string;
  dayLabel: string;
}

export interface Conversation {
  id: string;
  kind: "direct" | "group";
  /** Direct chats only: the other person. */
  contactId?: string;
  /** Group chats only: the group name. */
  title?: string;
  memberIds: string[];
  unread: number;
}

export type CallKind = "voice" | "video";

export interface CallEntry {
  id: string;
  contactId: string;
  kind: CallKind;
  direction: "in" | "out";
  missed: boolean;
  timeLabel: string;
  durationLabel: string;
}

interface ChatState {
  me: { name: string; handle: string };
  myStatus: string;
  setMyStatus: (value: string) => void;

  contacts: Contact[];
  contactById: (id: string) => Contact;

  conversations: Conversation[];
  conversationById: (id: string) => Conversation | undefined;
  /** Display title: the contact's name for direct chats, the group name otherwise. */
  titleOf: (conversation: Conversation) => string;
  messagesOf: (conversationId: string) => ChatMessage[];
  lastMessageOf: (conversationId: string) => ChatMessage | undefined;
  /** Conversation id whose other side is currently "typing", if any. */
  typingIn: string | null;

  sendMessage: (conversationId: string, text: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  markRead: (conversationId: string) => void;
  /** Opens (or creates) the 1:1 conversation with a contact; returns its id. */
  directConversationFor: (contactId: string) => string;
  /** Creates a group conversation and returns its id. */
  createGroup: (title: string, memberIds: string[]) => string;

  calls: CallEntry[];
  logCall: (entry: Omit<CallEntry, "id">) => void;

  /** The three backgrounds. Every Glacia `isDark` prop derives from it. */
  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  readReceipts: boolean;
  setReadReceipts: (value: boolean) => void;
  showLastSeen: boolean;
  setShowLastSeen: (value: boolean) => void;
}

const ChatContext = createContext<ChatState | null>(null);

export const CONTACTS: Contact[] = [
  { id: "lena", name: "Lena Fischer", handle: "@lena", about: "Product designer · Berlin. Glass half full.", presence: "online", presenceLabel: "Active now" },
  { id: "marcus", name: "Marcus Webb", handle: "@marcus", about: "Ops lead. Coffee first, questions later.", presence: "busy", presenceLabel: "Active 12m ago" },
  { id: "priya", name: "Priya Nair", handle: "@priya", about: "iOS engineer · she/her", presence: "online", presenceLabel: "Active now" },
  { id: "tomas", name: "Tom Alvarez", handle: "@tomas", about: "Probably on a mountain somewhere.", presence: "offline", presenceLabel: "Last seen yesterday" },
  { id: "sara", name: "Sara Lindqvist", handle: "@sara", about: "Illustrator & type nerd", presence: "online", presenceLabel: "Active now" },
  { id: "daniel", name: "Daniel Osei", handle: "@daniel", about: "Founder, Northwind", presence: "offline", presenceLabel: "Last seen 2h ago" },
  { id: "june", name: "June Park", handle: "@june", about: "Design systems, all day", presence: "online", presenceLabel: "Active now" },
  { id: "omar", name: "Omar Haddad", handle: "@omar", about: "Trail runner · Beirut → Lisbon", presence: "offline", presenceLabel: "Last seen Mon" },
];

const SEED_CONVERSATIONS: Conversation[] = [
  { id: "conv-design", kind: "group", title: "Design Crit", memberIds: ["lena", "june", "sara"], unread: 3 },
  { id: "conv-lena", kind: "direct", contactId: "lena", memberIds: ["lena"], unread: 2 },
  { id: "conv-priya", kind: "direct", contactId: "priya", memberIds: ["priya"], unread: 1 },
  { id: "conv-marcus", kind: "direct", contactId: "marcus", memberIds: ["marcus"], unread: 0 },
  { id: "conv-hike", kind: "group", title: "Weekend Hike", memberIds: ["marcus", "tomas", "omar"], unread: 0 },
  { id: "conv-daniel", kind: "direct", contactId: "daniel", memberIds: ["daniel"], unread: 0 },
];

const M = (
  id: string,
  conversationId: string,
  senderId: string,
  text: string,
  timeLabel: string,
  dayLabel: string,
): ChatMessage => ({ id, conversationId, senderId, text, timeLabel, dayLabel });

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  "conv-lena": [
    M("m1", "conv-lena", "lena", "Morning! Did you see the new glass build?", "9:12 AM", "Yesterday"),
    M("m2", "conv-lena", "me", "Just installed it. The refraction on the tab bar is unreal", "9:15 AM", "Yesterday"),
    M("m3", "conv-lena", "lena", "Right?? Wait until you see it over a busy photo background", "9:16 AM", "Yesterday"),
    M("m4", "conv-lena", "me", "Sending you the screenshots tonight", "9:20 AM", "Yesterday"),
    M("m5", "conv-lena", "lena", "Perfect. Also — are we still on for the crit at 3?", "10:02 AM", "Today"),
    M("m6", "conv-lena", "lena", "I moved it to the big room so we can use the wall screen", "10:02 AM", "Today"),
  ],
  "conv-design": [
    M("m10", "conv-design", "june", "Posted the new empty-state explorations in the file", "8:47 AM", "Today"),
    M("m11", "conv-design", "sara", "The one with the floating card is my favourite", "8:52 AM", "Today"),
    M("m12", "conv-design", "lena", "Agreed. Let's bring that one to the crit today", "8:55 AM", "Today"),
    M("m13", "conv-design", "me", "I'll add the motion notes before lunch", "9:01 AM", "Today"),
    M("m14", "conv-design", "june", "Thank you! Also can we look at the paywall sheet?", "9:03 AM", "Today"),
    M("m15", "conv-design", "sara", "Yes — I have two options for that one", "9:04 AM", "Today"),
    M("m16", "conv-design", "lena", "Great, adding both to the agenda", "9:05 AM", "Today"),
  ],
  "conv-priya": [
    M("m20", "conv-priya", "me", "The export finally passed on CI", "Yesterday", "Yesterday"),
    M("m21", "conv-priya", "priya", "Finally! Was it the worklets plugin again?", "Yesterday", "Yesterday"),
    M("m22", "conv-priya", "me", "It always is. Double-applied in the babel config", "Yesterday", "Yesterday"),
    M("m23", "conv-priya", "priya", "Ship it before it changes its mind", "8:30 AM", "Today"),
  ],
  "conv-marcus": [
    M("m30", "conv-marcus", "marcus", "Budget sheet is updated with Q1 numbers", "Mon", "Monday"),
    M("m31", "conv-marcus", "me", "Thanks — I'll review tonight", "Mon", "Monday"),
    M("m32", "conv-marcus", "marcus", "No rush. The board pack goes out Friday", "Mon", "Monday"),
  ],
  "conv-hike": [
    M("m40", "conv-hike", "tomas", "Weather looks clear for Saturday", "Sun", "Sunday"),
    M("m41", "conv-hike", "omar", "I'll bring the coffee kit", "Sun", "Sunday"),
    M("m42", "conv-hike", "me", "Meet at the trailhead at 7?", "Sun", "Sunday"),
    M("m43", "conv-hike", "marcus", "7 works. Don't forget the permit, Tom", "Sun", "Sunday"),
  ],
  "conv-daniel": [
    M("m50", "conv-daniel", "daniel", "Investor update went out this morning", "Fri", "Friday"),
    M("m51", "conv-daniel", "me", "Saw it — the growth chart tells the story well", "Fri", "Friday"),
  ],
};

const SEED_CALLS: CallEntry[] = [
  { id: "c1", contactId: "lena", kind: "video", direction: "in", missed: false, timeLabel: "Today · 10:02 AM", durationLabel: "12:24" },
  { id: "c2", contactId: "marcus", kind: "voice", direction: "in", missed: true, timeLabel: "Today · 8:15 AM", durationLabel: "Missed" },
  { id: "c3", contactId: "priya", kind: "voice", direction: "out", missed: false, timeLabel: "Yesterday · 6:40 PM", durationLabel: "3:18" },
  { id: "c4", contactId: "tomas", kind: "video", direction: "in", missed: true, timeLabel: "Yesterday · 1:05 PM", durationLabel: "Missed" },
  { id: "c5", contactId: "sara", kind: "voice", direction: "in", missed: false, timeLabel: "Mon · 11:20 AM", durationLabel: "8:47" },
  { id: "c6", contactId: "daniel", kind: "voice", direction: "out", missed: false, timeLabel: "Sun · 9:03 AM", durationLabel: "1:12" },
];

/** Canned replies the "other side" sends back, rotated per conversation. */
const REPLIES = [
  "Ha, exactly.",
  "Okay that makes sense — let's do it.",
  "Can you send me the link again?",
  "Nice. I'll take a look tonight.",
  "Deal. Adding it to my list now.",
  "Wait, that's actually a great idea.",
];

let counter = 1000;
const nextId = () => `x${++counter}`;

export function nowLabel(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(SEED_MESSAGES);
  const [calls, setCalls] = useState<CallEntry[]>(SEED_CALLS);
  const [typingIn, setTypingIn] = useState<string | null>(null);
  const [myStatus, setMyStatus] = useState("Building interfaces out of glass");
  const [backdrop, setBackdrop] = useState<BackdropMode>("dark");
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const replyCount = useRef<Record<string, number>>({});

  const contactById = useCallback((id: string) => {
    const found = CONTACTS.find((c) => c.id === id);
    if (!found) throw new Error(`Unknown contact ${id}`);
    return found;
  }, []);

  const conversationById = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  );

  const titleOf = useCallback(
    (conversation: Conversation) =>
      conversation.kind === "group"
        ? (conversation.title ?? "Group")
        : contactById(conversation.contactId ?? "").name,
    [contactById],
  );

  const messagesOf = useCallback(
    (conversationId: string) => messages[conversationId] ?? [],
    [messages],
  );

  const lastMessageOf = useCallback(
    (conversationId: string) => {
      const list = messages[conversationId] ?? [];
      return list[list.length - 1];
    },
    [messages],
  );

  const moveToTop = useCallback((conversationId: string) => {
    setConversations((prev) => {
      const conv = prev.find((c) => c.id === conversationId);
      if (!conv) return prev;
      return [conv, ...prev.filter((c) => c.id !== conversationId)];
    });
  }, []);

  const scheduleReply = useCallback(
    (conversationId: string) => {
      const typingTimer = setTimeout(() => setTypingIn(conversationId), 800);
      const replyTimer = setTimeout(() => {
        setTypingIn((current) => (current === conversationId ? null : current));
        setConversations((prev) => {
          const conv = prev.find((c) => c.id === conversationId);
          if (!conv) return prev;
          const n = (replyCount.current[conversationId] ?? 0) + 1;
          replyCount.current[conversationId] = n;
          const senderId =
            conv.kind === "direct"
              ? (conv.contactId ?? conv.memberIds[0])
              : conv.memberIds[(n - 1) % conv.memberIds.length];
          const reply: ChatMessage = {
            id: nextId(),
            conversationId,
            senderId,
            text: REPLIES[(n - 1) % REPLIES.length],
            timeLabel: nowLabel(),
            dayLabel: "Today",
          };
          setMessages((msgs) => ({
            ...msgs,
            [conversationId]: [...(msgs[conversationId] ?? []), reply],
          }));
          return prev;
        });
        moveToTop(conversationId);
      }, 2600);
      timers.current.push(typingTimer, replyTimer);
    },
    [moveToTop],
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const message: ChatMessage = {
        id: nextId(),
        conversationId,
        senderId: "me",
        text: trimmed,
        timeLabel: nowLabel(),
        dayLabel: "Today",
      };
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), message],
      }));
      moveToTop(conversationId);
      scheduleReply(conversationId);
    },
    [moveToTop, scheduleReply],
  );

  const deleteMessage = useCallback((conversationId: string, messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] ?? []).filter((m) => m.id !== messageId),
    }));
  }, []);

  const markRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)),
    );
  }, []);

  const directConversationFor = useCallback((contactId: string) => {
    const id = `conv-${contactId}`;
    setConversations((prev) => {
      if (prev.some((c) => c.id === id)) return prev;
      const created: Conversation = {
        id,
        kind: "direct",
        contactId,
        memberIds: [contactId],
        unread: 0,
      };
      return [created, ...prev];
    });
    setMessages((prev) => (prev[id] ? prev : { ...prev, [id]: [] }));
    return id;
  }, []);

  const createGroup = useCallback((title: string, memberIds: string[]) => {
    const id = `group-${nextId()}`;
    const created: Conversation = {
      id,
      kind: "group",
      title: title.trim(),
      memberIds,
      unread: 0,
    };
    setConversations((prev) => [created, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [id]: [
        {
          id: nextId(),
          conversationId: id,
          senderId: "me",
          text: `Created the group ${title.trim()}`,
          timeLabel: nowLabel(),
          dayLabel: "Today",
        },
      ],
    }));
    return id;
  }, []);

  const logCall = useCallback((entry: Omit<CallEntry, "id">) => {
    setCalls((prev) => [{ ...entry, id: nextId() }, ...prev]);
  }, []);

  const value = useMemo<ChatState>(
    () => ({
      me: { name: "Alex Carter", handle: "@alex" },
      myStatus,
      setMyStatus,
      contacts: CONTACTS,
      contactById,
      conversations,
      conversationById,
      titleOf,
      messagesOf,
      lastMessageOf,
      typingIn,
      sendMessage,
      deleteMessage,
      markRead,
      directConversationFor,
      createGroup,
      calls,
      logCall,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      notifications,
      setNotifications,
      readReceipts,
      setReadReceipts,
      showLastSeen,
      setShowLastSeen,
    }),
    [
      myStatus,
      contactById,
      conversations,
      conversationById,
      titleOf,
      messagesOf,
      lastMessageOf,
      typingIn,
      sendMessage,
      deleteMessage,
      markRead,
      directConversationFor,
      createGroup,
      calls,
      logCall,
      backdrop,
      darkMode,
      notifications,
      readReceipts,
      showLastSeen,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatState {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
