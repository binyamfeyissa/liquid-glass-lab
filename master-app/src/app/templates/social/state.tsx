import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useLocalSearchParams } from "expo-router";
import type { ImageSourcePropType } from "react-native";

/**
 * The whole template keeps its data in this one client-side store. There is
 * no backend and no persistence: state lives in memory for the session, so
 * liking a post on the feed updates its count on the post detail screen,
 * following someone updates both profiles, and a post written on the Create
 * tab appears at the top of the feed. Restarting the app resets the fixtures.
 */

export const ME_ID = "me";

/** The three backgrounds every screen can sit over. */
export type BackdropMode = "dark" | "light" | "image";

/** The five composed gradient styles a post / story media tile can wear. */
export const GRADIENTS: [string, string][] = [
  ["#f59e0b", "#ef4444"], // sunset
  ["#0ea5e9", "#2563eb"], // ocean
  ["#8b5cf6", "#ec4899"], // ultraviolet
  ["#10b981", "#0f766e"], // forest
  ["#64748b", "#0f172a"], // slate night
];

export const GRADIENT_NAMES = ["Sunset", "Ocean", "Ultraviolet", "Forest", "Slate"];

export interface User {
  id: string;
  name: string;
  handle: string;
  bio: string;
  /** Base follower count, not counting the signed-in user. */
  followers: number;
  following: number;
  gradient: number;
  /** Bundled portrait photo; the initials avatar is the fallback. */
  image?: number;
}

export interface Post {
  id: string;
  authorId: string;
  text: string;
  timeLabel: string;
  /** Index into GRADIENTS, or null for a text-only post. */
  gradient: number | null;
  /** Big word shown on the media tile (a place, a mood, a project). */
  mediaLabel?: string;
  /** Bundled photo for the post's media tile; the gradient plate is the fallback. */
  image?: ImageSourcePropType;
  tag?: string;
  /** Base like count, not counting the signed-in user. */
  likes: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  timeLabel: string;
  likes: number;
}

export interface StorySegment {
  text: string;
  gradient: number;
  /** Bundled photo for the story tile; the gradient plate is the fallback. */
  image?: ImageSourcePropType;
}

export interface Story {
  userId: string;
  segments: StorySegment[];
}

export type NotificationKind = "like" | "follow" | "mention" | "comment";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  actorId: string;
  text: string;
  timeLabel: string;
  read: boolean;
}

export interface Message {
  id: string;
  fromMe: boolean;
  text: string;
  timeLabel: string;
}

export interface Conversation {
  id: string;
  userId: string;
  unread: number;
  messages: Message[];
}

interface SocialState {
  me: User;
  users: User[];
  userById: (id: string) => User;

  posts: Post[];
  postById: (id: string) => Post | undefined;
  postsByUser: (userId: string) => Post[];
  createPost: (text: string, gradient: number | null) => Post;

  likedPostIds: string[];
  isPostLiked: (postId: string) => boolean;
  togglePostLike: (postId: string) => void;
  likeCountOf: (post: Post) => number;

  comments: Comment[];
  commentsFor: (postId: string) => Comment[];
  addComment: (postId: string, text: string) => void;
  likedCommentIds: string[];
  isCommentLiked: (commentId: string) => boolean;
  toggleCommentLike: (commentId: string) => void;
  commentLikeCountOf: (comment: Comment) => number;

  stories: Story[];

  followingIds: string[];
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => void;
  followerCountOf: (user: User) => number;
  myFollowingCount: number;

  notifications: AppNotification[];
  unreadNotifications: number;
  markAllNotificationsRead: () => void;

  conversations: Conversation[];
  conversationById: (id: string) => Conversation | undefined;
  totalUnreadMessages: number;
  openConversation: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  startConversationWith: (userId: string) => string;

  updateMyProfile: (name: string, bio: string) => void;

  backdrop: BackdropMode;
  setBackdrop: (value: BackdropMode) => void;
  /** Derived: true unless the backdrop is the broken-white light mode. */
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  pushNotifications: boolean;
  setPushNotifications: (value: boolean) => void;
  activityStatus: boolean;
  setActivityStatus: (value: boolean) => void;
}

const SocialContext = createContext<SocialState | null>(null);

const ME: User = {
  id: ME_ID,
  name: "Alex Rivera",
  image: require("./assets/img/alex-rivera.jpg"),
  handle: "@alexmakes",
  bio: "Building glass things. Design engineer, weekend ceramicist, chronic poster.",
  followers: 1248,
  following: 182,
  gradient: 2,
};

const USERS: User[] = [
  ME,
  { id: "maya", image: require("./assets/img/maya-chen.jpg"), name: "Maya Chen", handle: "@maya.builds", bio: "Product designer. Previously fintech, now indie. I post process, not polish.", followers: 8931, following: 412, gradient: 0 },
  { id: "daniel", image: require("./assets/img/daniel-osei.jpg"), name: "Daniel Osei", handle: "@danielosei", bio: "Photographer of cities that never sleep. Prints in the link.", followers: 22140, following: 308, gradient: 1 },
  { id: "priya", image: require("./assets/img/priya-nair.jpg"), name: "Priya Nair", handle: "@priyareads", bio: "Essayist. One book a week, one thread about it. Host of the Marginalia podcast.", followers: 5402, following: 690, gradient: 3 },
  { id: "sara", image: require("./assets/img/sara-lindqvist.jpg"), name: "Sara Lindqvist", handle: "@saralnd", bio: "Trail runner & route cartographer. Chasing light in the far north.", followers: 3177, following: 254, gradient: 4 },
  { id: "tom", image: require("./assets/img/tom-alvarez.jpg"), name: "Tom Alvarez", handle: "@tomascooks", bio: "Chef. Small kitchen, loud flavours. Recipe tests every Friday.", followers: 12804, following: 521, gradient: 0 },
  { id: "june", image: require("./assets/img/june-park.jpg"), name: "June Park", handle: "@junepark", bio: "Electronic musician. Modular synths and field recordings.", followers: 4760, following: 389, gradient: 2 },
  { id: "leo", image: require("./assets/img/leo-kim.jpg"), name: "Leo Kim", handle: "@leobuilds", bio: "Robotics tinkerer. If it has wheels, I've probably crashed it.", followers: 2013, following: 447, gradient: 1 },
];

const SEED_POSTS: Post[] = [
  {
    id: "p1",
    image: require("./assets/img/post-ship-it.jpg"),
    authorId: "maya",
    text: "Shipped the new onboarding today. Three screens, no tutorial carousel, and activation is already up 18%. Deleting steps is the best design tool there is.",
    timeLabel: "12m",
    gradient: 2,
    mediaLabel: "Ship it",
    tag: "design",
    likes: 342,
  },
  {
    id: "p2",
    image: require("./assets/img/post-lisbon.jpg"),
    authorId: "daniel",
    text: "Lisbon at 6am, before the trams start arguing with the hills. Some cities you visit; this one you tune into.",
    timeLabel: "48m",
    gradient: 0,
    mediaLabel: "Lisbon",
    tag: "travel",
    likes: 1204,
  },
  {
    id: "p3",
    authorId: "priya",
    text: "Finished 'The Making of Prince of Persia' journals. Jordan Mechner kept a diary while building the game in the 80s and it reads like a thriller about rotoscoping. Full thread below.",
    timeLabel: "2h",
    gradient: null,
    tag: "books",
    likes: 518,
  },
  {
    id: "p4",
    image: require("./assets/img/post-trail.jpg"),
    authorId: "sara",
    text: "68km across the Kungsleden this weekend. Weather window held for exactly one summit photo. Worth every frozen toe.",
    timeLabel: "4h",
    gradient: 3,
    mediaLabel: "68 km",
    tag: "trail",
    likes: 867,
  },
  {
    id: "p5",
    image: require("./assets/img/post-noodles.jpg"),
    authorId: "tom",
    text: "Friday recipe test: charred scallion oil noodles. Five ingredients, eleven minutes, zero leftovers. Recipe drops tonight.",
    timeLabel: "6h",
    gradient: 0,
    mediaLabel: "Noodles",
    tag: "food",
    likes: 693,
  },
  {
    id: "p6",
    image: require("./assets/img/post-harbour.jpg"),
    authorId: "june",
    text: "Recorded the harbour at dawn — gulls, rigging, one very committed foghorn — and granulated it into a pad. New track 'Low Water' is up.",
    timeLabel: "9h",
    gradient: 1,
    mediaLabel: "Low Water",
    tag: "music",
    likes: 429,
  },
  {
    id: "p7",
    image: require("./assets/img/post-glass.jpg"),
    authorId: ME_ID,
    text: "Week three of the glass component library. The refraction finally behaves on scroll. Screenshots soon, code sooner.",
    timeLabel: "1d",
    gradient: 2,
    mediaLabel: "Glass",
    tag: "design",
    likes: 96,
  },
];

const SEED_COMMENTS: Comment[] = [
  { id: "c1", postId: "p1", authorId: "priya", text: "The 'delete a step' audit is criminally underrated. What did you cut?", timeLabel: "8m", likes: 24 },
  { id: "c2", postId: "p1", authorId: ME_ID, text: "Congrats! Onboarding is where products go to be honest.", timeLabel: "5m", likes: 6 },
  { id: "c3", postId: "p1", authorId: "leo", text: "18% from removing friction. Saving this for our next planning fight.", timeLabel: "2m", likes: 11 },
  { id: "c4", postId: "p2", authorId: "sara", text: "That light. Lisbon mornings should be illegal to sleep through.", timeLabel: "31m", likes: 18 },
  { id: "c5", postId: "p2", authorId: "june", text: "Tuning into a city is exactly the phrase. Stealing it for a track title.", timeLabel: "20m", likes: 9 },
  { id: "c6", postId: "p3", authorId: "maya", text: "The rotoscoping chapters rewired my brain about constraints.", timeLabel: "1h", likes: 14 },
  { id: "c7", postId: "p4", authorId: "daniel", text: "One photo, 68 kilometres of context. Perfect ratio.", timeLabel: "3h", likes: 7 },
  { id: "c8", postId: "p5", authorId: ME_ID, text: "Eleven minutes is my entire personality in a recipe. Waiting for the drop.", timeLabel: "5h", likes: 4 },
];

const SEED_STORIES: Story[] = [
  {
    userId: "maya",
    segments: [
      { text: "Launch day. Deep breath.", gradient: 2, image: require("./assets/img/story-maya-launch.jpg") },
      { text: "The team wall of sticky notes that got us here.", gradient: 0, image: require("./assets/img/story-maya-notes.jpg") },
      { text: "We did it. Activation +18%.", gradient: 3, image: require("./assets/img/story-maya-win.jpg") },
    ],
  },
  {
    userId: "daniel",
    segments: [
      { text: "Lisbon, 6:02am.", gradient: 0, image: require("./assets/img/story-daniel-lisbon.jpg") },
      { text: "Tram 28, empty for once.", gradient: 1, image: require("./assets/img/story-daniel-tram.jpg") },
    ],
  },
  {
    userId: "sara",
    segments: [
      { text: "Summit. Finally.", gradient: 3, image: require("./assets/img/story-sara-summit.jpg") },
      { text: "The descent is a different sport.", gradient: 4, image: require("./assets/img/story-sara-descent.jpg") },
    ],
  },
  {
    userId: "tom",
    segments: [{ text: "Test kitchen Friday. Oil's hot.", gradient: 0, image: require("./assets/img/story-tom-kitchen.jpg") }],
  },
  {
    userId: "june",
    segments: [
      { text: "Harbour recordings, take one.", gradient: 1, image: require("./assets/img/story-june-harbour.jpg") },
      { text: "The foghorn is the lead vocalist now.", gradient: 2, image: require("./assets/img/story-june-foghorn.jpg") },
    ],
  },
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", kind: "like", actorId: "maya", text: "liked your post about the glass component library", timeLabel: "4m", read: false },
  { id: "n2", kind: "follow", actorId: "leo", text: "started following you", timeLabel: "26m", read: false },
  { id: "n3", kind: "comment", actorId: "priya", text: "commented: The 'delete a step' audit is criminally underrated", timeLabel: "1h", read: false },
  { id: "n4", kind: "mention", actorId: "daniel", text: "mentioned you in a post about morning light", timeLabel: "3h", read: true },
  { id: "n5", kind: "like", actorId: "june", text: "and 41 others liked your post about the glass component library", timeLabel: "5h", read: true },
  { id: "n6", kind: "follow", actorId: "sara", text: "started following you", timeLabel: "1d", read: true },
];

const REPLIES = [
  "Ha — exactly. Tell me more?",
  "Okay that's genuinely a great point.",
  "Sending you the link when I'm back at my desk.",
  "We should make this a real plan this weekend.",
  "Wait, that's brilliant. Stealing it.",
];

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-maya",
    userId: "maya",
    unread: 2,
    messages: [
      { id: "m1", fromMe: false, text: "The onboarding numbers are in — up 18%!", timeLabel: "10:12" },
      { id: "m2", fromMe: false, text: "Your 'delete a step' comment became our team motto btw", timeLabel: "10:12" },
      { id: "m3", fromMe: true, text: "Deserved. What got cut in the end?", timeLabel: "10:20" },
    ],
  },
  {
    id: "conv-daniel",
    userId: "daniel",
    unread: 0,
    messages: [
      { id: "m4", fromMe: false, text: "Print shop confirmed — the Lisbon series ships Friday", timeLabel: "Tue" },
      { id: "m5", fromMe: true, text: "Put me down for the 6am tram one. Large.", timeLabel: "Tue" },
    ],
  },
  {
    id: "conv-june",
    userId: "june",
    unread: 1,
    messages: [
      { id: "m6", fromMe: false, text: "Sent you the harbour stems. The foghorn is… a lot", timeLabel: "Mon" },
    ],
  },
  {
    id: "conv-tom",
    userId: "tom",
    unread: 0,
    messages: [
      { id: "m7", fromMe: true, text: "Friday's noodles were elite. Recipe when?", timeLabel: "Sun" },
      { id: "m8", fromMe: false, text: "Tonight. Clear your evening and your sinuses.", timeLabel: "Sun" },
    ],
  },
];

let counter = 100;
const nextId = () => `x${++counter}`;

export function SocialProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<User>(ME);
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS);
  const [likedPostIds, setLikedPostIds] = useState<string[]>(["p2"]);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>(["maya", "daniel"]);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  // The host (template list) passes its current backdrop mode as a route
  // param (`backdrop`) when opening a template, so the template opens on
  // the same background the owner just picked. Standalone there is no
  // param and the template keeps its dark default. Read once on mount
  // (lazy initialiser) so navigating inside the template never resets it.
  const params = useLocalSearchParams();
  const [backdrop, setBackdrop] = useState<BackdropMode>(() => {
    const p = params.backdrop;
    const v = Array.isArray(p) ? p[0] : p;
    return v === "dark" || v === "light" || v === "image" ? v : "dark";
  });
  const darkMode = backdrop !== "light";
  const setDarkMode = useCallback((value: boolean) => {
    setBackdrop(value ? "dark" : "light");
  }, []);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);

  const userById = useCallback(
    (id: string) => (id === ME_ID ? me : USERS.find((u) => u.id === id) ?? USERS[0]),
    [me],
  );

  const postById = useCallback((id: string) => posts.find((p) => p.id === id), [posts]);
  const postsByUser = useCallback(
    (userId: string) => posts.filter((p) => p.authorId === userId),
    [posts],
  );

  const createPost = useCallback((text: string, gradient: number | null) => {
    const tagMatch = text.match(/#(\w+)/);
    const post: Post = {
      id: nextId(),
      authorId: ME_ID,
      text: text.trim(),
      timeLabel: "now",
      gradient,
      mediaLabel: gradient !== null ? "New post" : undefined,
      tag: tagMatch ? tagMatch[1].toLowerCase() : undefined,
      likes: 0,
    };
    setPosts((prev) => [post, ...prev]);
    return post;
  }, []);

  const isPostLiked = useCallback(
    (postId: string) => likedPostIds.includes(postId),
    [likedPostIds],
  );
  const togglePostLike = useCallback((postId: string) => {
    setLikedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId],
    );
  }, []);
  const likeCountOf = useCallback(
    (post: Post) => post.likes + (likedPostIds.includes(post.id) ? 1 : 0),
    [likedPostIds],
  );

  const commentsFor = useCallback(
    (postId: string) => comments.filter((c) => c.postId === postId),
    [comments],
  );
  const addComment = useCallback((postId: string, text: string) => {
    const comment: Comment = {
      id: nextId(),
      postId,
      authorId: ME_ID,
      text: text.trim(),
      timeLabel: "now",
      likes: 0,
    };
    setComments((prev) => [...prev, comment]);
  }, []);
  const isCommentLiked = useCallback(
    (commentId: string) => likedCommentIds.includes(commentId),
    [likedCommentIds],
  );
  const toggleCommentLike = useCallback((commentId: string) => {
    setLikedCommentIds((prev) =>
      prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId],
    );
  }, []);
  const commentLikeCountOf = useCallback(
    (comment: Comment) => comment.likes + (likedCommentIds.includes(comment.id) ? 1 : 0),
    [likedCommentIds],
  );

  const isFollowing = useCallback(
    (userId: string) => followingIds.includes(userId),
    [followingIds],
  );
  const toggleFollow = useCallback((userId: string) => {
    setFollowingIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }, []);
  const followerCountOf = useCallback(
    (user: User) => user.followers + (followingIds.includes(user.id) ? 1 : 0),
    [followingIds],
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const conversationById = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  );

  const openConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const mine: Message = {
      id: nextId(),
      fromMe: true,
      text: text.trim(),
      timeLabel: "now",
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, mine] } : c,
      ),
    );
    // Simulated reply: the other person answers shortly after.
    const replyIndex = Math.floor(Math.random() * REPLIES.length);
    setTimeout(() => {
      const reply: Message = {
        id: nextId(),
        fromMe: false,
        text: REPLIES[replyIndex],
        timeLabel: "now",
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, messages: [...c.messages, reply] } : c,
        ),
      );
    }, 1400);
  }, []);

  const startConversationWith = useCallback(
    (userId: string) => {
      const existing = conversations.find((c) => c.userId === userId);
      if (existing) return existing.id;
      const id = `conv-${userId}`;
      setConversations((prev) => [
        { id, userId, unread: 0, messages: [] },
        ...prev,
      ]);
      return id;
    },
    [conversations],
  );

  const updateMyProfile = useCallback((name: string, bio: string) => {
    setMe((prev) => ({ ...prev, name: name.trim() || prev.name, bio: bio.trim() }));
  }, []);

  const value = useMemo<SocialState>(() => {
    const unreadNotifications = notifications.filter((n) => !n.read).length;
    const totalUnreadMessages = conversations.reduce((sum, c) => sum + c.unread, 0);
    return {
      me,
      users: [me, ...USERS.slice(1)],
      userById,
      posts,
      postById,
      postsByUser,
      createPost,
      likedPostIds,
      isPostLiked,
      togglePostLike,
      likeCountOf,
      comments,
      commentsFor,
      addComment,
      likedCommentIds,
      isCommentLiked,
      toggleCommentLike,
      commentLikeCountOf,
      stories: SEED_STORIES,
      followingIds,
      isFollowing,
      toggleFollow,
      followerCountOf,
      myFollowingCount: me.following + (followingIds.length - 2),
      notifications,
      unreadNotifications,
      markAllNotificationsRead,
      conversations,
      conversationById,
      totalUnreadMessages,
      openConversation,
      sendMessage,
      startConversationWith,
      updateMyProfile,
      backdrop,
      setBackdrop,
      darkMode,
      setDarkMode,
      pushNotifications,
      setPushNotifications,
      activityStatus,
      setActivityStatus,
    };
  }, [
    me,
    userById,
    posts,
    postById,
    postsByUser,
    createPost,
    likedPostIds,
    isPostLiked,
    togglePostLike,
    likeCountOf,
    comments,
    commentsFor,
    addComment,
    likedCommentIds,
    isCommentLiked,
    toggleCommentLike,
    commentLikeCountOf,
    followingIds,
    isFollowing,
    toggleFollow,
    followerCountOf,
    notifications,
    markAllNotificationsRead,
    conversations,
    conversationById,
    openConversation,
    sendMessage,
    startConversationWith,
    updateMyProfile,
    backdrop,
    darkMode,
    setDarkMode,
    pushNotifications,
    activityStatus,
  ]);

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial(): SocialState {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used inside SocialProvider");
  return ctx;
}
