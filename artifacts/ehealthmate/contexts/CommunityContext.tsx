import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { readJson, writeJson } from "@/lib/storage";

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  category: string;
  timestamp: string;
  ts: number;
  likes: number;
  liked: boolean;
  saved: boolean;
  isOwn?: boolean;
  imageTag?: string;
  postImageUri?: string;
  replyCount: number;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  text: string;
  timestamp: string;
  ts: number;
}

export interface CommunityMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  county: string;
  bio: string;
  online: boolean;
  joinedLabel: string;
}

export interface DmMessage {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: string;
  ts: number;
  mediaUri?: string;
  mediaType?: "image";
  read?: boolean;
}

export const SEED_MEMBERS: CommunityMember[] = [
  { id: "seed-fk", name: "Fatu Koroma", initials: "FK", color: "#3A7BD5", county: "Montserrado", bio: "Sharing my anxiety recovery journey one day at a time.", online: true, joinedLabel: "Member since Jan 2025" },
  { id: "seed-mt", name: "Moses Togba", initials: "MT", color: "#6FCF97", county: "Nimba", bio: "Mental health advocate. It is okay to not be okay.", online: true, joinedLabel: "Member since Feb 2025" },
  { id: "seed-cw", name: "Comfort Williams", initials: "CW", color: "#7C5DB8", county: "Bong", bio: "Healing is not linear. Be kind to yourself.", online: false, joinedLabel: "Member since Dec 2024" },
  { id: "seed-jb", name: "James Barclay", initials: "JB", color: "#E07A5F", county: "Margibi", bio: "Improving my sleep and sharing what works.", online: false, joinedLabel: "Member since Mar 2025" },
  { id: "seed-af", name: "Adama Fofana", initials: "AF", color: "#5C97E0", county: "Lofa", bio: "7-day journal streak and counting.", online: true, joinedLabel: "Member since Feb 2025" },
  { id: "seed-ms", name: "Miatta Sirleaf", initials: "MS", color: "#E0A800", county: "Grand Cape Mount", bio: "Trying to bridge the gap between tradition and mental health.", online: false, joinedLabel: "Member since Nov 2024" },
  { id: "seed-ae", name: "Abu Emmanuel", initials: "AE", color: "#27AE60", county: "Sinoe", bio: "Community health worker. Here to support.", online: true, joinedLabel: "Member since Apr 2025" },
  { id: "seed-rb", name: "Rose Bestman", initials: "RB", color: "#E03E3E", county: "Grand Bassa", bio: "Mother of three. Learning to take care of myself too.", online: false, joinedLabel: "Member since Jan 2025" },
];

const SEED_POSTS: CommunityPost[] = [
  {
    id: "seed-1", authorId: "seed-fk", authorName: "Fatu K.", authorInitials: "FK", authorColor: "#3A7BD5",
    content: "I tried the box breathing exercise for the first time yesterday during a really stressful moment. I could not believe how quickly it helped. Just four counts in, hold, out, hold — and my heart rate came down. Grateful for this app.",
    category: "Anxiety", timestamp: "2 hours ago", ts: Date.now() - 7200000, likes: 14, liked: false, saved: false, replyCount: 3,
  },
  {
    id: "seed-2", authorId: "seed-mt", authorName: "Moses T.", authorInitials: "MT", authorColor: "#6FCF97",
    content: "Has anyone used the Smart Match feature to find a doctor? I described my symptoms and it matched me with a psychiatrist in Monrovia. First time I have ever spoken to a mental health professional. It was hard but worth it.",
    category: "Recovery", timestamp: "5 hours ago", ts: Date.now() - 18000000, likes: 22, liked: false, saved: false, replyCount: 8,
  },
  {
    id: "seed-3", authorId: "seed-cw", authorName: "Comfort W.", authorInitials: "CW", authorColor: "#7C5DB8",
    content: "Reminder to anyone reading this: your feelings are valid. You do not need to justify why you feel the way you feel. Healing is not linear. Be kind to yourself today.",
    category: "Motivation", timestamp: "Yesterday", ts: Date.now() - 86400000, likes: 47, liked: false, saved: false, replyCount: 12, imageTag: "heart",
  },
  {
    id: "seed-4", authorId: "seed-jb", authorName: "James B.", authorInitials: "JB", authorColor: "#E07A5F",
    content: "Sleep has been really hard lately. The AI Sleep Coach gave me a personalised plan — no screens 1 hour before bed, consistent wake time, and a short body scan before sleeping. One week in and I am already sleeping longer.",
    category: "Sleep", timestamp: "2 days ago", ts: Date.now() - 172800000, likes: 19, liked: false, saved: false, replyCount: 5,
  },
  {
    id: "seed-5", authorId: "seed-af", authorName: "Adama F.", authorInitials: "AF", authorColor: "#5C97E0",
    content: "I kept my 7-day journal streak this week. Writing helps me understand why I feel things, not just that I feel them. If you have never tried journaling, start with just one sentence a day.",
    category: "Journal", timestamp: "3 days ago", ts: Date.now() - 259200000, likes: 31, liked: false, saved: false, replyCount: 7, imageTag: "journal",
  },
  {
    id: "seed-6", authorId: "seed-ms", authorName: "Miatta S.", authorInitials: "MS", authorColor: "#E0A800",
    content: "Question for the community — how do you explain to family members that mental health is just as important as physical health? In my household it is still seen as weakness. I would love advice.",
    category: "Community", timestamp: "4 days ago", ts: Date.now() - 345600000, likes: 38, liked: false, saved: false, replyCount: 21,
  },
];

const SEED_COMMENTS: Record<string, PostComment[]> = {
  "seed-1": [
    { id: "c1", authorName: "Moses T.", authorInitials: "MT", authorColor: "#6FCF97", text: "Box breathing saved me during my last panic attack too. 4 counts is the key.", timestamp: "1 hour ago", ts: Date.now() - 3600000 },
    { id: "c2", authorName: "Comfort W.", authorInitials: "CW", authorColor: "#7C5DB8", text: "I do this before every difficult phone call now. Completely changed how I handle stress.", timestamp: "45 min ago", ts: Date.now() - 2700000 },
    { id: "c3", authorName: "Abu E.", authorInitials: "AE", authorColor: "#27AE60", text: "Try the Breathing tool in the Tools tab — it guides you through it step by step.", timestamp: "30 min ago", ts: Date.now() - 1800000 },
  ],
  "seed-3": [
    { id: "c4", authorName: "Fatu K.", authorInitials: "FK", authorColor: "#3A7BD5", text: "I needed to read this today. Thank you Comfort.", timestamp: "20 hours ago", ts: Date.now() - 72000000 },
    { id: "c5", authorName: "James B.", authorInitials: "JB", authorColor: "#E07A5F", text: "Healing is not linear is something I repeat to myself every morning.", timestamp: "18 hours ago", ts: Date.now() - 64800000 },
  ],
  "seed-6": [
    { id: "c6", authorName: "Adama F.", authorInitials: "AF", authorColor: "#5C97E0", text: "I share articles like the ones in this app and slowly they are starting to listen.", timestamp: "3 days ago", ts: Date.now() - 259200000 },
    { id: "c7", authorName: "Rose B.", authorInitials: "RB", authorColor: "#E03E3E", text: "It took my husband getting sick for my family to take mental health seriously. We have to keep talking.", timestamp: "3 days ago", ts: Date.now() - 255600000 },
  ],
};

interface CommunityContextValue {
  posts: CommunityPost[];
  postComments: Record<string, PostComment[]>;
  members: CommunityMember[];
  dmThreads: Record<string, DmMessage[]>;
  createPost: (content: string, category: string, authorName: string, imageTag?: string, postImageUri?: string) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string, authorName: string) => void;
  sendDm: (memberId: string, text: string, mediaUri?: string, mediaType?: "image", fromMe?: boolean) => void;
  addMember: (member: CommunityMember) => void;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

const COMMUNITY_KEY = "community_posts_v2";
const COMMENTS_KEY = "community_comments_v1";
const DM_KEY = "community_dms_v1";

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<CommunityPost[]>(SEED_POSTS);
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>(SEED_COMMENTS);
  const [dmThreads, setDmThreads] = useState<Record<string, DmMessage[]>>({});
  const [extraMembers, setExtraMembers] = useState<CommunityMember[]>([]);

  const members = useMemo(() => [...SEED_MEMBERS, ...extraMembers], [extraMembers]);

  useEffect(() => {
    readJson<CommunityPost[]>(COMMUNITY_KEY, SEED_POSTS).then((saved) => {
      if (saved && saved.length > 0) {
        const ownPosts = saved.filter((p) => p.isOwn);
        const merged = [...ownPosts, ...SEED_POSTS];
        const seen = new Set<string>();
        setPosts(merged.filter((p) => !seen.has(p.id) && seen.add(p.id)));
      }
    });
    readJson<Record<string, PostComment[]>>(COMMENTS_KEY, SEED_COMMENTS).then((c) => {
      if (c) setPostComments({ ...SEED_COMMENTS, ...c });
    });
    readJson<Record<string, DmMessage[]>>(DM_KEY, {}).then((d) => {
      if (d) setDmThreads(d);
    });
  }, []);

  const createPost = useCallback(
    (content: string, category: string, authorName: string, imageTag?: string, postImageUri?: string) => {
      const initials = authorName.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "ME";
      const COLORS = ["#3A7BD5", "#6FCF97", "#7C5DB8", "#E07A5F", "#E0A800"];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]!;
      const post: CommunityPost = {
        id: `own-${Date.now()}`, authorId: "me", authorName: authorName.trim() || "You",
        authorInitials: initials, authorColor: color, content, category,
        timestamp: "Just now", ts: Date.now(), likes: 0, liked: false, saved: false,
        isOwn: true, replyCount: 0, imageTag, postImageUri,
      };
      setPosts((prev) => {
        const next = [post, ...prev];
        writeJson(COMMUNITY_KEY, next);
        return next;
      });
    },
    [],
  );

  const toggleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p,
      ),
    );
  }, []);

  const toggleSave = useCallback((postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p)));
  }, []);

  const addComment = useCallback((postId: string, text: string, authorName: string) => {
    const initials = authorName.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "ME";
    const comment: PostComment = {
      id: `comment-${Date.now()}`, authorName: authorName.trim() || "You",
      authorInitials: initials, authorColor: "#3A7BD5", text,
      timestamp: "Just now", ts: Date.now(),
    };
    setPostComments((prev) => {
      const next = { ...prev, [postId]: [...(prev[postId] ?? []), comment] };
      writeJson(COMMENTS_KEY, next);
      return next;
    });
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p)));
  }, []);

  const sendDm = useCallback((memberId: string, text: string, mediaUri?: string, mediaType?: "image", fromMe: boolean = true) => {
    const msg: DmMessage = {
      id: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, fromMe, text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ts: Date.now(), mediaUri, mediaType, read: !fromMe,
    };
    setDmThreads((prev) => {
      const next = { ...prev, [memberId]: [...(prev[memberId] ?? []), msg] };
      writeJson(DM_KEY, next);
      return next;
    });
  }, []);

  const addMember = useCallback((member: CommunityMember) => {
    setExtraMembers((prev) => {
      if (prev.some((m) => m.id === member.id)) return prev;
      return [...prev, member];
    });
  }, []);

  const value = useMemo(
    () => ({ posts, postComments, members, dmThreads, createPost, toggleLike, toggleSave, addComment, sendDm, addMember }),
    [posts, postComments, members, dmThreads, createPost, toggleLike, toggleSave, addComment, sendDm, addMember],
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be within CommunityProvider");
  return ctx;
}
