import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { useColors } from "@/hooks/useColors";
import { useCommunity, SEED_MEMBERS, type DmMessage } from "@/contexts/CommunityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

const AUTO_REPLIES: Record<string, string[]> = {
  "seed-fk": ["Thank you for reaching out! I appreciate the support.", "Box breathing really helped me a lot. Have you tried it?", "We are all in this together. How are you doing today?", "I find journaling really helpful. Do you journal?", "This community means so much to me. Thank you for connecting."],
  "seed-mt": ["Thanks for the message! Smart Match was truly life-changing for me.", "Keep going — seeking help is the bravest thing you can do.", "I am glad we connected. Do not hesitate to reach out anytime.", "Mental health is health. We have to keep saying it.", "Have you tried the breathing exercises? They really help."],
  "seed-cw": ["Your feelings are always valid. I am here if you need to talk.", "Healing takes time. Be patient with yourself.", "Thank you for connecting. This community means everything.", "I always say: one day at a time. You are doing great.", "Sending you strength and light today."],
  "seed-jb": ["Sleep really does change everything, doesn't it?", "The Sleep Coach tool is genuinely helpful. Try it tonight.", "One good night of sleep and everything feels more manageable.", "I have been tracking my sleep for two weeks now. Big difference.", "How has your sleep been lately?"],
  "seed-af": ["Journaling changed my life. Start small — one sentence is enough.", "Seven days in a row feels amazing. You can do it too!", "Writing down feelings is surprisingly powerful.", "What do you like to write about? I love morning pages.", "Keep going. The streak builds on itself."],
  "seed-ms": ["Family dynamics are hard, but we keep talking. That is how change happens.", "Your courage to ask is already inspiring others here.", "This community is proof that we are not alone.", "Have you spoken to a counsellor? It really helped me.", "Thank you for sharing. It takes courage."],
  "seed-ae": ["As a community health worker, I see how much this app helps people.", "Please reach out anytime. Support is always here.", "Mental health is health. Full stop.", "You are not alone. There are more of us than you think.", "Keep going. Recovery is possible for everyone."],
  "seed-rb": ["Self-care is not selfish. We have to take care of ourselves to care for others.", "You are not alone in this journey.", "Thank you for the kind words. It means a lot.", "My children have taught me that showing emotions is strength.", "One step at a time. You are doing better than you think."],
};

function getAutoReply(memberId: string): string {
  const replies = AUTO_REPLIES[memberId] ?? ["Thank you for your message. I appreciate you reaching out."];
  return replies[Math.floor(Math.random() * replies.length)]!;
}

export default function DmScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { dmThreads, sendDm } = useCommunity();
  const { user } = useAuth();
  const { profile } = useApp();

  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList<DmMessage>>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const member = SEED_MEMBERS.find((m) => m.id === userId);
  const thread = dmThreads[userId ?? ""] ?? [];
  const myName = user?.username ?? profile.name ?? "You";

  useEffect(() => {
    if (thread.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [thread.length]);

  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !userId) return;
    setText("");
    sendDm(userId, trimmed);
    triggerReply(userId);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const triggerReply = (uid: string) => {
    setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    const delay = 1500 + Math.random() * 1200;
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      sendDm(uid, getAutoReply(uid), undefined, undefined, false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200);
    }, delay);
  };

  const onPickImage = async () => {
    if (!userId) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow MAWIBO to access your photo library to share images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      sendDm(userId, "", uri, "image");
      triggerReply(userId);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 300);
    }
  };

  const onCall = () => {
    if (!userId) return;
    router.push(`/call/${userId}` as never);
  };

  const onVideoCall = () => {
    if (!userId) return;
    router.push(`/video-call/${userId}` as never);
  };

  if (!member) {
    return (
      <View style={[styles.root, { backgroundColor: c.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: c.mutedForeground }]}>Member not found.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.emptyText, { color: c.primary }]}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const renderMessage = ({ item, index }: { item: DmMessage; index: number }) => {
    const fromMe = item.fromMe;
    const displayText = item.text;
    const prevItem = index > 0 ? thread[index - 1] : null;
    const prevFromMe = prevItem ? prevItem.fromMe : null;
    const showAvatar = !fromMe && prevFromMe !== false;
    const isLast = index === thread.length - 1;

    return (
      <View style={{ marginBottom: 2 }}>
        <View style={[styles.msgRow, { justifyContent: fromMe ? "flex-end" : "flex-start" }]}>
          {!fromMe ? (
            showAvatar ? (
              <View style={[styles.msgAvatar, { backgroundColor: member.color + "22" }]}>
                <Text style={[styles.msgAvatarText, { color: member.color }]}>{member.initials}</Text>
              </View>
            ) : <View style={styles.msgAvatarGap} />
          ) : null}

          <View style={{ maxWidth: "75%", gap: 3 }}>
            {item.mediaUri && item.mediaType === "image" ? (
              <View style={[
                styles.imageBubble,
                fromMe
                  ? { alignSelf: "flex-end", borderBottomRightRadius: 4 }
                  : { alignSelf: "flex-start", borderBottomLeftRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: c.border },
              ]}>
                <Image source={{ uri: item.mediaUri }} style={styles.sharedImage} resizeMode="cover" />
                <View style={[styles.imageTime, { backgroundColor: "rgba(0,0,0,0.45)" }]}>
                  <Text style={styles.imageTimeText}>{item.timestamp}</Text>
                  {fromMe && isLast && <MaterialIcons name="done-all" size={12} color="rgba(255,255,255,0.9)" />}
                </View>
              </View>
            ) : null}
            {displayText ? (
              <View style={[
                styles.bubble,
                fromMe
                  ? { backgroundColor: c.primary, borderBottomRightRadius: 4, alignSelf: "flex-end" }
                  : { backgroundColor: c.card, borderColor: c.border, borderWidth: StyleSheet.hairlineWidth, borderBottomLeftRadius: 4, alignSelf: "flex-start" },
              ]}>
                <Text style={[styles.bubbleText, { color: fromMe ? "#FFFFFF" : c.foreground }]}>{displayText}</Text>
                <View style={styles.bubbleMeta}>
                  <Text style={[styles.bubbleTime, { color: fromMe ? "rgba(255,255,255,0.65)" : c.mutedForeground }]}>
                    {item.timestamp}
                  </Text>
                  {fromMe && isLast && (
                    <MaterialIcons name="done-all" size={13} color="rgba(255,255,255,0.75)" />
                  )}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.bottom}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border, paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBack} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={22} color={c.foreground} />
        </Pressable>
        <Pressable onPress={() => {}} style={styles.headerInfo}>
          <View style={[styles.headerAvatar, { backgroundColor: member.color + "22" }]}>
            <Text style={[styles.headerAvatarText, { color: member.color }]}>{member.initials}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.headerName, { color: c.foreground }]} numberOfLines={1}>{member.name}</Text>
            <View style={styles.headerStatus}>
              <View style={[styles.onlineDot, { backgroundColor: member.online ? "#27AE60" : c.border }]} />
              <Text style={[styles.headerSub, { color: c.mutedForeground }]}>
                {isTyping ? "typing…" : member.online ? "Online" : "Offline"} · {member.county}
              </Text>
            </View>
          </View>
        </Pressable>
        <Pressable onPress={onCall} style={[styles.callBtn, { backgroundColor: "#27AE60" + "22" }]}>
          <MaterialIcons name="call" size={20} color="#27AE60" />
        </Pressable>
        <Pressable onPress={onVideoCall} style={[styles.callBtn, { backgroundColor: c.primarySoft }]}>
          <MaterialIcons name="videocam" size={20} color={c.primary} />
        </Pressable>
      </View>

      {/* Messages */}
      {thread.length === 0 ? (
        <View style={styles.emptyThread}>
          <View style={[styles.emptyAvatarLg, { backgroundColor: member.color + "22" }]}>
            <Text style={[styles.emptyAvatarText, { color: member.color }]}>{member.initials}</Text>
          </View>
          <Text style={[styles.emptyName, { color: c.foreground }]}>{member.name}</Text>
          <Text style={[styles.emptyBio, { color: c.mutedForeground }]}>{member.bio}</Text>
          <View style={[styles.emptyMeta, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.onlineDot, { backgroundColor: member.online ? "#27AE60" : c.border }]} />
            <Text style={[styles.emptyHint, { color: c.mutedForeground }]}>
              {member.online ? "Online" : "Offline"} · {member.county} · {member.joinedLabel}
            </Text>
          </View>
          <Text style={[styles.startHint, { color: c.mutedForeground }]}>
            Say hello to start the conversation.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={thread}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.threadContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={renderMessage}
          ListFooterComponent={isTyping ? (
            <View style={[styles.msgRow, { justifyContent: "flex-start", marginTop: 6 }]}>
              <View style={[styles.msgAvatar, { backgroundColor: member.color + "22" }]}>
                <Text style={[styles.msgAvatarText, { color: member.color }]}>{member.initials}</Text>
              </View>
              <View style={[styles.typingBubble, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={[styles.typingDot, { backgroundColor: c.mutedForeground }]} />
                <View style={[styles.typingDot, { backgroundColor: c.mutedForeground }]} />
                <View style={[styles.typingDot, { backgroundColor: c.mutedForeground }]} />
              </View>
            </View>
          ) : null}
        />
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { backgroundColor: c.card, borderTopColor: c.border, paddingBottom: insets.bottom + 8 }]}>
        <Pressable onPress={onPickImage} style={[styles.attachBtn, { backgroundColor: c.muted }]} hitSlop={4}>
          <MaterialIcons name="image" size={22} color={c.primary} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Message ${member.name.split(" ")[0]}…`}
          placeholderTextColor={c.mutedForeground}
          style={[styles.textInput, { backgroundColor: c.muted, color: c.foreground }]}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={onSend}
        />
        <Pressable
          onPress={onSend}
          disabled={!text.trim()}
          style={[styles.sendBtn, { backgroundColor: text.trim() ? c.primary : c.muted }]}
        >
          <MaterialIcons name="send" size={20} color={text.trim() ? "#FFFFFF" : c.mutedForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 10, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBack: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerAvatarText: { fontFamily: "Inter_700Bold", fontSize: 15 },
  headerName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  headerStatus: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  callBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  threadContent: { padding: 14, paddingBottom: 8, gap: 8 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  msgAvatarGap: { width: 30, flexShrink: 0 },
  msgAvatarText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  bubbleMeta: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 },
  bubbleTime: { fontFamily: "Inter_400Regular", fontSize: 10 },
  imageBubble: { borderRadius: 16, overflow: "hidden" },
  sharedImage: { width: 220, height: 180 },
  imageTime: {
    position: "absolute", bottom: 8, right: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  imageTimeText: { fontFamily: "Inter_400Regular", fontSize: 10, color: "#FFFFFF" },
  typingBubble: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 18, borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  typingDot: { width: 6, height: 6, borderRadius: 3, opacity: 0.6 },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    paddingHorizontal: 10, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  attachBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  textInput: {
    flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    fontFamily: "Inter_400Regular", fontSize: 15, maxHeight: 120,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  emptyThread: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 },
  emptyAvatarLg: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyAvatarText: { fontFamily: "Inter_700Bold", fontSize: 28 },
  emptyName: { fontFamily: "Inter_700Bold", fontSize: 18 },
  emptyBio: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyMeta: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  emptyHint: { fontFamily: "Inter_400Regular", fontSize: 12 },
  startHint: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 15 },
});
