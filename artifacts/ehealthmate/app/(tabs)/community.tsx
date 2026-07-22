import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { useColors } from "@/hooks/useColors";
import { useCommunity, type CommunityPost, type CommunityMember } from "@/contexts/CommunityContext";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useBottomTabPadding } from "@/hooks/useBottomTabPadding";

type Tab = "feed" | "members" | "saved";

const CATEGORIES = ["All", "Anxiety", "Sleep", "Recovery", "Motivation", "Journal", "Community"];
const POST_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

const IMAGE_TAGS: Record<string, { icon: string; color: string; label: string }> = {
  heart: { icon: "favorite", color: "#E07A5F", label: "Sending love" },
  journal: { icon: "edit-note", color: "#E0A800", label: "Journal moment" },
  sunrise: { icon: "wb-sunny", color: "#F59E0B", label: "New day" },
  meditation: { icon: "self-improvement", color: "#7C5DB8", label: "Mindful" },
  walk: { icon: "directions-walk", color: "#6FCF97", label: "Movement" },
  sleep: { icon: "bedtime", color: "#5C6BC0", label: "Rest" },
};

function ImageTagBanner({ tag }: { tag: string }) {
  const info = IMAGE_TAGS[tag];
  if (!info) return null;
  return (
    <View style={[imageBannerS.root, { backgroundColor: info.color + "18", borderColor: info.color + "44" }]}>
      <View style={[imageBannerS.icon, { backgroundColor: info.color + "28" }]}>
        <MaterialIcons name={info.icon as keyof typeof MaterialIcons.glyphMap} size={32} color={info.color} />
      </View>
      <Text style={[imageBannerS.label, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}
const imageBannerS = StyleSheet.create({
  root: { marginHorizontal: 14, marginBottom: 10, borderRadius: 12, borderWidth: 1, alignItems: "center", paddingVertical: 16, gap: 8 },
  icon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: "Inter_700Bold", fontSize: 13 },
});

function PostCard({ post, onLike, onSave, onOpenComments }: { post: CommunityPost; onLike: () => void; onSave: () => void; onOpenComments: () => void }) {
  const c = useColors();
  return (
    <View style={[styles.postCard, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.postHeader}>
        <View style={[styles.postAvatar, { backgroundColor: post.authorColor + "22" }]}>
          <Text style={[styles.postAvatarText, { color: post.authorColor }]}>{post.authorInitials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.postAuthor, { color: c.foreground }]}>{post.authorName}</Text>
          <Text style={[styles.postTime, { color: c.mutedForeground }]}>{post.timestamp}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: c.primarySoft }]}>
          <Text style={[styles.categoryText, { color: c.primary }]}>{post.category}</Text>
        </View>
      </View>
      <Text style={[styles.postContent, { color: c.foreground }]}>{post.content}</Text>
      {post.postImageUri ? (
        <Image source={{ uri: post.postImageUri }} style={styles.postRealImage} resizeMode="cover" />
      ) : post.imageTag ? <ImageTagBanner tag={post.imageTag} /> : null}
      <View style={[styles.postActions, { borderTopColor: c.border }]}>
        <Pressable onPress={onLike} style={styles.actionBtn} hitSlop={8}>
          <MaterialIcons name={post.liked ? "favorite" : "favorite-border"} size={20} color={post.liked ? "#E03E3E" : c.mutedForeground} />
          <Text style={[styles.actionCount, { color: post.liked ? "#E03E3E" : c.mutedForeground }]}>{post.likes}</Text>
        </Pressable>
        <Pressable onPress={onOpenComments} style={styles.actionBtn} hitSlop={8}>
          <MaterialIcons name="chat-bubble-outline" size={20} color={c.mutedForeground} />
          <Text style={[styles.actionCount, { color: c.mutedForeground }]}>{post.replyCount}</Text>
        </Pressable>
        <Pressable onPress={onSave} style={styles.actionBtn} hitSlop={8}>
          <MaterialIcons name={post.saved ? "bookmark" : "bookmark-border"} size={20} color={post.saved ? c.primary : c.mutedForeground} />
          <Text style={[styles.actionCount, { color: post.saved ? c.primary : c.mutedForeground }]}>Save</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => Alert.alert("Share", "Sharing coming soon.")} style={styles.actionBtn} hitSlop={8}>
          <MaterialIcons name="share" size={20} color={c.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

function MemberCard({ member, onMessage }: { member: CommunityMember; onMessage: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onMessage} style={({ pressed }) => [styles.memberCard, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.88 : 1 }]}>
      <View style={styles.memberAvatarWrap}>
        <View style={[styles.memberAvatar, { backgroundColor: member.color + "22" }]}>
          <Text style={[styles.memberAvatarText, { color: member.color }]}>{member.initials}</Text>
        </View>
        <View style={[styles.onlineDot, { backgroundColor: member.online ? "#27AE60" : c.border, borderColor: c.card }]} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.memberName, { color: c.foreground }]} numberOfLines={1}>{member.name}</Text>
        <Text style={[styles.memberCounty, { color: c.mutedForeground }]} numberOfLines={1}>{member.county} · {member.joinedLabel}</Text>
        <Text style={[styles.memberBio, { color: c.mutedForeground }]} numberOfLines={2}>{member.bio}</Text>
      </View>
      <View style={[styles.messageBtn, { backgroundColor: c.primarySoft }]}>
        <MaterialIcons name="chat" size={18} color={c.primary} />
      </View>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { posts, postComments, members, createPost, toggleLike, toggleSave, addComment } = useCommunity();
  const { profile } = useApp();
  const { user } = useAuth();
  const { addNotification, markAllRead } = useNotifications();
  const bottomPad = useBottomTabPadding(24);

  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [draftCategory, setDraftCategory] = useState("Community");
  const [draftImageTag, setDraftImageTag] = useState("");
  const [draftImageUri, setDraftImageUri] = useState<string | null>(null);
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  const authorName = user?.username ?? profile.name ?? "You";

  const filtered = useMemo(() =>
    activeFilter === "All" ? posts : posts.filter((p) => p.category === activeFilter),
    [posts, activeFilter],
  );

  const savedPosts = useMemo(() => posts.filter((p) => p.saved), [posts]);
  const onlineCount = members.filter((m) => m.online).length;

  const onPickPostImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow MAWIBO to access your photos to share images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setDraftImageUri(result.assets[0].uri);
      setDraftImageTag("");
    }
  };

  const onSubmitPost = () => {
    if (!draftContent.trim()) return;
    createPost(draftContent.trim(), draftCategory, authorName, draftImageTag || undefined, draftImageUri ?? undefined);
    setDraftContent(""); setDraftCategory("Community"); setDraftImageTag(""); setDraftImageUri(null); setShowCreate(false);
    setTimeout(() => {
      const names = ["Fatu K.", "Moses E.", "Comfort W.", "Amara S."];
      const name = names[Math.floor(Math.random() * names.length)];
      addNotification({
        type: "like",
        title: `${name} liked your post`,
        body: "Your new post is getting attention in the community.",
        icon: "favorite",
        color: "#E07A5F",
      });
    }, 5000);
  };

  const onSubmitComment = () => {
    if (!commentDraft.trim() || !commentsPostId) return;
    addComment(commentsPostId, commentDraft.trim(), authorName);
    setCommentDraft("");
    setTimeout(() => {
      addNotification({
        type: "comment",
        title: "Someone replied to the thread",
        body: "A community member responded in the same thread.",
        icon: "chat-bubble",
        color: "#3A7BD5",
      });
    }, 8000);
  };

  const onLikePost = (postId: string) => {
    toggleLike(postId);
  };

  React.useEffect(() => {
    markAllRead();
  }, []);

  const commentsData = commentsPostId ? (postComments[commentsPostId] ?? []) : [];
  const commentsPost = commentsPostId ? posts.find((p) => p.id === commentsPostId) : null;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.card, paddingTop: insets.top + 10, borderBottomColor: c.border }]}>
        <View style={[styles.headerLeft, { backgroundColor: c.primary }]}>
          <MaterialIcons name="people" size={16} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: c.foreground }]}>Community</Text>
          <Text style={[styles.headerSub, { color: c.mutedForeground }]}>{onlineCount} online · Liberia health circle</Text>
        </View>
        <Pressable onPress={() => setShowCreate(true)} style={[styles.createBtn, { backgroundColor: c.primary }]}>
          <MaterialIcons name="edit" size={16} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Post</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        {(["feed", "members", "saved"] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setActiveTab(t)} style={[styles.tabBtn, { borderBottomColor: activeTab === t ? c.primary : "transparent" }]}>
            <Text style={[styles.tabBtnText, { color: activeTab === t ? c.primary : c.mutedForeground }]}>
              {t === "feed" ? "Feed" : t === "members" ? `Members (${members.length})` : `Saved (${savedPosts.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Feed tab */}
      {activeTab === "feed" && (
        <>
          <View style={[styles.filterBar, { backgroundColor: c.card, borderBottomColor: c.border }]}>
            <FlatList
              data={CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(c) => c}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item }) => {
                const active = item === activeFilter;
                return (
                  <Pressable onPress={() => setActiveFilter(item)} style={[styles.filterPill, { backgroundColor: active ? c.primary : "transparent" }]}>
                    <Text style={[styles.filterText, { color: active ? "#FFFFFF" : c.mutedForeground }]}>{item}</Text>
                  </Pressable>
                );
              }}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(p) => p.id}
            contentContainerStyle={[styles.feed, { paddingBottom: bottomPad }]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Pressable onPress={() => setShowCreate(true)} style={[styles.composeBar, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={[styles.composeAvatar, { backgroundColor: c.primarySoft }]}>
                  <Text style={[styles.composeAvatarText, { color: c.primary }]}>{authorName.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={[styles.composePlaceholder, { color: c.mutedForeground }]}>Share something with the community...</Text>
                <MaterialIcons name="send" size={20} color={c.primary} />
              </Pressable>
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="people" size={40} color={c.mutedForeground} />
                <Text style={[styles.emptyText, { color: c.mutedForeground }]}>No posts in this category yet.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onLike={() => onLikePost(item.id)}
                onSave={() => toggleSave(item.id)}
                onOpenComments={() => setCommentsPostId(item.id)}
              />
            )}
          />
        </>
      )}

      {/* Members tab */}
      {activeTab === "members" && (
        <FlatList
          data={members}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.feed, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.membersHeader, { backgroundColor: c.card, borderColor: c.border }]}>
              <MaterialIcons name="people" size={20} color={c.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.membersHeaderTitle, { color: c.foreground }]}>{members.length} community members</Text>
                <Text style={[styles.membersHeaderSub, { color: c.mutedForeground }]}>{onlineCount} online right now · Tap to message</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <MemberCard member={item} onMessage={() => router.push(`/dm/${item.id}` as never)} />
          )}
        />
      )}

      {/* Saved tab */}
      {activeTab === "saved" && (
        <FlatList
          data={savedPosts}
          keyExtractor={(p) => p.id}
          contentContainerStyle={[styles.feed, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="bookmark-border" size={40} color={c.mutedForeground} />
              <Text style={[styles.emptyText, { color: c.mutedForeground }]}>No saved posts yet.</Text>
              <Text style={[styles.emptyHint, { color: c.mutedForeground }]}>Tap the bookmark icon on any post.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={() => onLikePost(item.id)}
              onSave={() => toggleSave(item.id)}
              onOpenComments={() => setCommentsPostId(item.id)}
            />
          )}
        />
      )}

      {/* Create post modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCreate(false)}>
        <View style={[styles.root, { backgroundColor: c.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: c.card, borderBottomColor: c.border, paddingTop: insets.top + 14 }]}>
            <Pressable onPress={() => setShowCreate(false)} hitSlop={12} style={styles.modalClose}>
              <MaterialIcons name="close" size={24} color={c.foreground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: c.foreground }]}>New post</Text>
            <Pressable onPress={onSubmitPost} disabled={!draftContent.trim()}
              style={[styles.submitBtn, { backgroundColor: c.primary, opacity: draftContent.trim() ? 1 : 0.5 }]}>
              <Text style={styles.submitBtnText}>Share</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.createBody} keyboardShouldPersistTaps="handled">
            <View style={styles.createAuthorRow}>
              <View style={[styles.composeAvatar, { backgroundColor: c.primarySoft }]}>
                <Text style={[styles.composeAvatarText, { color: c.primary }]}>{authorName.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={[styles.createAuthor, { color: c.foreground }]}>{authorName}</Text>
                <Text style={[styles.createAudience, { color: c.mutedForeground }]}>Posting to Liberia Health Circle</Text>
              </View>
            </View>
            <TextInput
              autoFocus
              value={draftContent}
              onChangeText={setDraftContent}
              placeholder="What's on your mind? Share a tip, experience, or encouragement..."
              placeholderTextColor={c.mutedForeground}
              multiline
              style={[styles.createInput, { color: c.foreground }]}
              maxLength={500}
            />
            <Text style={[styles.catLabel, { color: c.mutedForeground }]}>Category</Text>
            <View style={styles.catGrid}>
              {POST_CATEGORIES.map((cat) => (
                <Pressable key={cat} onPress={() => setDraftCategory(cat)}
                  style={[styles.catPill, { backgroundColor: draftCategory === cat ? c.primary : c.muted, borderColor: draftCategory === cat ? c.primary : c.border }]}>
                  <Text style={[styles.catPillText, { color: draftCategory === cat ? "#FFFFFF" : c.mutedForeground }]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ height: 16 }} />
            <Text style={[styles.catLabel, { color: c.mutedForeground }]}>Add image (optional)</Text>
            {draftImageUri ? (
              <View style={styles.pickedImageWrap}>
                <Image source={{ uri: draftImageUri }} style={styles.pickedImage} resizeMode="cover" />
                <Pressable onPress={() => setDraftImageUri(null)} style={styles.removeImageBtn}>
                  <MaterialIcons name="close" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <>
                <Pressable onPress={onPickPostImage} style={[styles.photoPickerBtn, { backgroundColor: c.primarySoft, borderColor: c.primary + "44" }]}>
                  <MaterialIcons name="add-photo-alternate" size={22} color={c.primary} />
                  <Text style={[styles.photoPickerText, { color: c.primary }]}>Upload a photo from your device</Text>
                </Pressable>
                <Text style={[styles.catLabel, { color: c.mutedForeground, marginTop: 12 }]}>Or pick a mood icon</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageTagRow}>
                  <Pressable
                    onPress={() => setDraftImageTag("")}
                    style={[styles.imageTagPill, { backgroundColor: !draftImageTag ? c.primary : c.muted, borderColor: !draftImageTag ? c.primary : c.border }]}
                  >
                    <Text style={[styles.catPillText, { color: !draftImageTag ? "#FFFFFF" : c.mutedForeground }]}>None</Text>
                  </Pressable>
                  {Object.entries(IMAGE_TAGS).map(([key, info]) => (
                    <Pressable key={key} onPress={() => setDraftImageTag(key)}
                      style={[styles.imageTagPill, { backgroundColor: draftImageTag === key ? info.color : c.muted, borderColor: draftImageTag === key ? info.color : c.border }]}>
                      <MaterialIcons name={info.icon as keyof typeof MaterialIcons.glyphMap} size={16} color={draftImageTag === key ? "#FFFFFF" : info.color} />
                      <Text style={[styles.catPillText, { color: draftImageTag === key ? "#FFFFFF" : c.mutedForeground }]}>{info.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Comments modal */}
      <Modal visible={!!commentsPostId} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCommentsPostId(null)}>
        <View style={[styles.root, { backgroundColor: c.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: c.card, borderBottomColor: c.border, paddingTop: insets.top + 14 }]}>
            <Pressable onPress={() => setCommentsPostId(null)} hitSlop={12} style={styles.modalClose}>
              <MaterialIcons name="close" size={24} color={c.foreground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: c.foreground }]}>
              Replies ({commentsData.length})
            </Text>
          </View>
          {commentsPost && (
            <View style={[styles.commentsOriginal, { backgroundColor: c.muted, borderBottomColor: c.border }]}>
              <Text style={[styles.commentsOriginalAuthor, { color: c.primary }]}>{commentsPost.authorName}</Text>
              <Text style={[styles.commentsOriginalText, { color: c.foreground }]} numberOfLines={3}>{commentsPost.content}</Text>
            </View>
          )}
          <FlatList
            data={commentsData}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ padding: 14, gap: 12 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="chat-bubble-outline" size={32} color={c.mutedForeground} />
                <Text style={[styles.emptyText, { color: c.mutedForeground }]}>No replies yet. Be the first!</Text>
              </View>
            }
            renderItem={({ item: comment }) => (
              <View style={[styles.commentCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={[styles.commentAvatar, { backgroundColor: comment.authorColor + "22" }]}>
                  <Text style={[styles.commentAvatarText, { color: comment.authorColor }]}>{comment.authorInitials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentAuthor, { color: c.foreground }]}>{comment.authorName}</Text>
                    <Text style={[styles.commentTime, { color: c.mutedForeground }]}>{comment.timestamp}</Text>
                  </View>
                  <Text style={[styles.commentText, { color: c.foreground }]}>{comment.text}</Text>
                </View>
              </View>
            )}
          />
          <View style={[styles.commentInputBar, { backgroundColor: c.card, borderTopColor: c.border, paddingBottom: insets.bottom + 8 }]}>
            <TextInput
              value={commentDraft}
              onChangeText={setCommentDraft}
              placeholder="Write a reply..."
              placeholderTextColor={c.mutedForeground}
              style={[styles.commentInput, { backgroundColor: c.muted, color: c.foreground }]}
            />
            <Pressable onPress={onSubmitComment} disabled={!commentDraft.trim()} style={[styles.commentSendBtn, { backgroundColor: commentDraft.trim() ? c.primary : c.muted }]}>
              <MaterialIcons name="send" size={18} color={commentDraft.trim() ? "#FFFFFF" : c.mutedForeground} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerLeft: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 20, letterSpacing: -0.3 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  createBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#FFFFFF" },
  tabBar: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 13, borderBottomWidth: 2.5 },
  tabBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  filterBar: { borderBottomWidth: StyleSheet.hairlineWidth },
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  feed: { padding: 14, gap: 10 },
  composeBar: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 2 },
  composeAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  composeAvatarText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  composePlaceholder: { fontFamily: "Inter_400Regular", fontSize: 14, flex: 1 },
  postCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, paddingBottom: 8 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  postAvatarText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  postAuthor: { fontFamily: "Inter_700Bold", fontSize: 14 },
  postTime: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  postContent: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, paddingHorizontal: 14, paddingBottom: 12 },
  postActions: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, minHeight: 36 },
  actionCount: { fontFamily: "Inter_500Medium", fontSize: 13 },
  membersHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginBottom: 6 },
  membersHeaderTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  membersHeaderSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  memberCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  memberAvatarWrap: { position: "relative" },
  memberAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  memberAvatarText: { fontFamily: "Inter_700Bold", fontSize: 18 },
  onlineDot: { position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  memberName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  memberCounty: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  memberBio: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4, lineHeight: 17 },
  messageBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  emptyHint: { fontFamily: "Inter_400Regular", fontSize: 13 },
  modalHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  modalClose: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 17, flex: 1 },
  submitBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  submitBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#FFFFFF" },
  createBody: { padding: 16, gap: 0 },
  createAuthorRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  createAuthor: { fontFamily: "Inter_700Bold", fontSize: 15 },
  createAudience: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  createInput: { fontFamily: "Inter_400Regular", fontSize: 16, lineHeight: 24, minHeight: 100, textAlignVertical: "top", marginBottom: 20 },
  catLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 10 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catPillText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  imageTagRow: { paddingBottom: 8, gap: 8 },
  imageTagPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  postRealImage: { width: "100%", height: 200, marginBottom: 4 },
  pickedImageWrap: { position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 12 },
  pickedImage: { width: "100%", height: 180 },
  removeImageBtn: { position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  photoPickerBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, borderStyle: "dashed" as const, marginBottom: 4 },
  photoPickerText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  commentsOriginal: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  commentsOriginalAuthor: { fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 4 },
  commentsOriginalText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  commentCard: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  commentAvatarText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  commentAuthor: { fontFamily: "Inter_700Bold", fontSize: 13, flex: 1 },
  commentTime: { fontFamily: "Inter_400Regular", fontSize: 11 },
  commentText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  commentInputBar: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderTopWidth: StyleSheet.hairlineWidth },
  commentInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, fontFamily: "Inter_400Regular", fontSize: 14 },
  commentSendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
