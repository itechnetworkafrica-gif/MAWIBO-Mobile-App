import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useChat } from "@/contexts/ChatContext";
import { Header } from "@/components/Header";
import type { ChatMessage } from "@/lib/aiClient";

const SUGGESTIONS = [
  { text: "I feel anxious today", icon: "sentiment-very-dissatisfied" },
  { text: "Help me sleep better", icon: "bedtime" },
  { text: "I had a hard day", icon: "cloud" },
  { text: "How do I calm down?", icon: "air" },
  { text: "I feel lonely", icon: "favorite-border" },
  { text: "Give me a coping tip", icon: "lightbulb" },
] as const;

function TypingDots({ color }: { color: string }) {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - i * 180),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={dotStyles.row}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[dotStyles.dot, { backgroundColor: color, opacity: d, transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }]} />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

function MessageBubble({ item, primaryColor, cardColor, borderColor, foreground, mutedForeground }: {
  item: ChatMessage;
  primaryColor: string;
  cardColor: string;
  borderColor: string;
  foreground: string;
  mutedForeground: string;
}) {
  const isUser = item.role === "user";
  return (
    <View style={[bStyles.row, isUser ? bStyles.rowUser : bStyles.rowAi]}>
      {!isUser && (
        <View style={[bStyles.avatar, { backgroundColor: primaryColor + "22" }]}>
          <MaterialIcons name="psychology" size={16} color={primaryColor} />
        </View>
      )}
      <View style={bStyles.bubbleCol}>
        <View style={[
          bStyles.bubble,
          isUser
            ? { backgroundColor: primaryColor, borderBottomRightRadius: 4 }
            : { backgroundColor: cardColor, borderBottomLeftRadius: 4, borderColor, borderWidth: StyleSheet.hairlineWidth },
        ]}>
          <Text style={[bStyles.text, { color: isUser ? "#FFFFFF" : foreground }]}>{item.content}</Text>
        </View>
        <Text style={[bStyles.ts, { color: mutedForeground, textAlign: isUser ? "right" : "left" }]}>
          {new Date(item.createdAt ?? Date.now()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </View>
  );
}

const bStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 2 },
  rowUser: { justifyContent: "flex-end" },
  rowAi: { justifyContent: "flex-start" },
  bubbleCol: { maxWidth: "80%", gap: 3 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  bubble: { paddingVertical: 11, paddingHorizontal: 15, borderRadius: 18 },
  text: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  ts: { fontFamily: "Inter_400Regular", fontSize: 10, paddingHorizontal: 4 },
});

export default function AIMateScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { messages, pending, error, send, clear, showCrisis, dismissCrisis } = useChat();
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const sendScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length, pending]);

  const handleSend = (msg?: string) => {
    const value = (msg ?? text).trim();
    if (!value || pending) return;
    setText("");
    send(value);
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.88, useNativeDriver: true, speed: 40 }),
      Animated.spring(sendScale, { toValue: 1, useNativeDriver: true, speed: 40 }),
    ]).start();
  };

  const headerHeight = insets.top + 72;
  const keyboardOffset = Platform.OS === "ios" ? headerHeight : 0;
  const inputBarPadding = Math.max(insets.bottom, 8) + 4;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Header
        title="AI Mate"
        subtitle="A friendly listener — not a doctor"
        variant="primary"
        right={
          messages.length > 0 ? (
            <Pressable onPress={clear} hitSlop={8} style={styles.clearBtn}>
              <MaterialIcons name="delete-outline" size={20} color="#FFFFFF" />
            </Pressable>
          ) : null
        }
      />

      {/* Crisis banner */}
      {showCrisis ? (
        <View style={[styles.crisisBanner, { backgroundColor: c.destructiveSoft, borderColor: c.destructive }]}>
          <View style={[styles.crisisIconWrap, { backgroundColor: c.destructive + "22" }]}>
            <MaterialIcons name="emergency" size={20} color={c.destructive} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.crisisTitle, { color: c.destructive }]}>You are not alone</Text>
            <Text style={[styles.crisisBody, { color: c.foreground }]}>Reach out for help right now.</Text>
          </View>
          <Pressable onPress={() => { dismissCrisis(); router.push("/(tabs)/support"); }}
            style={[styles.crisisBtn, { backgroundColor: c.destructive }]}>
            <Text style={styles.crisisBtnText}>Get help</Text>
          </Pressable>
        </View>
      ) : null}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={keyboardOffset}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              {/* Welcome card */}
              <View style={[styles.welcomeCard, { backgroundColor: c.primary }]}>
                <View style={styles.welcomeBubble} />
                <View style={[styles.welcomeAvatarWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <MaterialIcons name="psychology" size={36} color="#FFFFFF" />
                </View>
                <Text style={styles.welcomeTitle}>Hi, I am AI Mate</Text>
                <Text style={styles.welcomeBody}>
                  I am here to listen, support, and offer small ideas. Nothing you share leaves this app.
                </Text>
                <View style={[styles.welcomeTag, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                  <MaterialIcons name="lock" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.welcomeTagText}>Private &amp; secure · offline mode</Text>
                </View>
              </View>

              {/* Suggestions */}
              <Text style={[styles.suggestLabel, { color: c.mutedForeground }]}>Try saying…</Text>
              <View style={styles.suggestGrid}>
                {SUGGESTIONS.map((s) => (
                  <Pressable key={s.text} onPress={() => handleSend(s.text)}
                    style={({ pressed }) => [styles.suggestChip, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}>
                    <MaterialIcons name={s.icon as keyof typeof MaterialIcons.glyphMap} size={16} color={c.primary} />
                    <Text style={[styles.suggestText, { color: c.foreground }]}>{s.text}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <MessageBubble
              item={item}
              primaryColor={c.primary}
              cardColor={c.card}
              borderColor={c.border}
              foreground={c.foreground}
              mutedForeground={c.mutedForeground}
            />
          )}
          ListFooterComponent={
            pending ? (
              <View style={[bStyles.row, bStyles.rowAi]}>
                <View style={[bStyles.avatar, { backgroundColor: c.primary + "22" }]}>
                  <MaterialIcons name="psychology" size={16} color={c.primary} />
                </View>
                <View style={[bStyles.bubble, { backgroundColor: c.card, borderColor: c.border, borderWidth: StyleSheet.hairlineWidth, borderBottomLeftRadius: 4 }]}>
                  <TypingDots color={c.primary} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Error bar */}
        {error ? (
          <View style={[styles.errorBar, { backgroundColor: c.destructiveSoft }]}>
            <MaterialIcons name="error-outline" size={16} color={c.destructive} />
            <Text style={[styles.errorText, { color: c.destructive }]}>{error}</Text>
          </View>
        ) : null}

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: c.card, borderTopColor: c.border, paddingBottom: inputBarPadding }]}>
          <View style={[styles.inputWrap, { backgroundColor: c.background, borderColor: c.border }]}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Share what is on your mind..."
              placeholderTextColor={c.mutedForeground}
              style={[styles.input, { color: c.foreground }]}
              multiline
              maxLength={500}
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
              returnKeyType="send"
            />
          </View>
          <Pressable
            onPress={() => handleSend()}
            disabled={!text.trim() || pending}
            onPressIn={() => Animated.spring(sendScale, { toValue: 0.88, useNativeDriver: true, speed: 40 }).start()}
            onPressOut={() => Animated.spring(sendScale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()}
          >
            <Animated.View style={[
              styles.sendBtn,
              { backgroundColor: text.trim() && !pending ? c.primary : c.muted, transform: [{ scale: sendScale }] },
            ]}>
              {pending ? (
                <ActivityIndicator size="small" color={c.primary} />
              ) : (
                <MaterialIcons name="send" size={20} color={text.trim() ? "#FFFFFF" : c.mutedForeground} />
              )}
            </Animated.View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  clearBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },

  crisisBanner: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 14, borderWidth: 1.5 },
  crisisIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  crisisTitle: { fontFamily: "Inter_700Bold", fontSize: 13 },
  crisisBody: { fontFamily: "Inter_400Regular", fontSize: 12 },
  crisisBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  crisisBtnText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 12 },

  listContent: { padding: 16, gap: 8, paddingBottom: 12 },

  emptyWrap: { alignItems: "center", paddingTop: 20, paddingHorizontal: 0 },
  welcomeCard: { width: "100%", borderRadius: 22, padding: 22, marginBottom: 24, alignItems: "center", overflow: "hidden" },
  welcomeBubble: { position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  welcomeAvatarWrap: { width: 68, height: 68, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  welcomeTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#FFFFFF", marginBottom: 8 },
  welcomeBody: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 19, marginBottom: 14 },
  welcomeTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  welcomeTagText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.8)" },

  suggestLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 12, alignSelf: "flex-start" },
  suggestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  suggestChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 30, borderWidth: 1 },
  suggestText: { fontFamily: "Inter_500Medium", fontSize: 13 },

  errorBar: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 },

  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  inputWrap: { flex: 1, borderRadius: 22, borderWidth: 1, paddingHorizontal: 4 },
  input: { flex: 1, minHeight: 42, maxHeight: 120, paddingHorizontal: 12, paddingVertical: 10, fontFamily: "Inter_400Regular", fontSize: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 2 },
});
