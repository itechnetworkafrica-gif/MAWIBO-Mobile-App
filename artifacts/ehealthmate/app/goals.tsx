import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { readJson, writeJson } from "@/lib/storage";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  createdAt: string;
}

const GOAL_CATEGORIES = [
  { id: "mood", label: "Mood", icon: "mood", color: "#3A7BD5" },
  { id: "sleep", label: "Sleep", icon: "bedtime", color: "#7C5DB8" },
  { id: "anxiety", label: "Anxiety", icon: "favorite", color: "#E07A5F" },
  { id: "fitness", label: "Movement", icon: "directions-walk", color: "#6FCF97" },
  { id: "social", label: "Social", icon: "people", color: "#5C97E0" },
  { id: "mindfulness", label: "Mind", icon: "self-improvement", color: "#E0A800" },
];

const SUGGESTIONS = [
  { title: "Log my mood every day this week", category: "mood" },
  { title: "Sleep by 10pm for 5 nights", category: "sleep" },
  { title: "Do box breathing once a day", category: "anxiety" },
  { title: "Walk 20 minutes three times this week", category: "fitness" },
  { title: "Call a friend or family member", category: "social" },
  { title: "Complete a daily check-in every morning", category: "mindfulness" },
];

export default function GoalsScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("mood");

  useEffect(() => {
    readJson<Goal[]>("ehm.goals.v1", []).then(setGoals);
  }, []);

  const persist = (updated: Goal[]) => {
    setGoals(updated);
    writeJson("ehm.goals.v1", updated);
  };

  const createGoal = () => {
    if (!title.trim()) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    persist([goal, ...goals]);
    setTitle("");
    setDescription("");
    setCategory("mood");
    setShowCreate(false);
  };

  const toggleComplete = (id: string) => {
    persist(goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  const deleteGoal = (id: string) => {
    Alert.alert("Delete goal?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => persist(goals.filter((g) => g.id !== id)),
      },
    ]);
  };

  const addSuggestion = (s: (typeof SUGGESTIONS)[0]) => {
    const goal: Goal = {
      id: Date.now().toString(),
      title: s.title,
      description: "",
      category: s.category,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    persist([goal, ...goals]);
  };

  const active = goals.filter((g) => !g.completed);
  const done = goals.filter((g) => g.completed);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.header,
          { backgroundColor: "#3A7BD5", paddingTop: insets.top + 14 },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Goal Tracker</Text>
          <Text style={styles.headerSub}>
            {active.length} active · {done.length} completed
          </Text>
        </View>
        <Pressable
          onPress={() => setShowCreate(true)}
          style={[styles.addBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
        >
          <MaterialIcons name="add" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {active.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
              ACTIVE GOALS
            </Text>
            {active.map((goal) => {
              const cat = GOAL_CATEGORIES.find((c) => c.id === goal.category);
              return (
                <Pressable key={goal.id} onLongPress={() => deleteGoal(goal.id)}>
                  <View
                    style={[
                      styles.goalCard,
                      { backgroundColor: c.card, borderColor: c.border },
                    ]}
                  >
                    <Pressable
                      onPress={() => toggleComplete(goal.id)}
                      style={[
                        styles.checkbox,
                        { borderColor: cat?.color ?? c.primary },
                      ]}
                      hitSlop={8}
                    >
                      {goal.completed ? (
                        <MaterialIcons
                          name="check"
                          size={16}
                          color={cat?.color ?? c.primary}
                        />
                      ) : null}
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.goalTitle, { color: c.foreground }]}>
                        {goal.title}
                      </Text>
                      {goal.description ? (
                        <Text style={[styles.goalDesc, { color: c.mutedForeground }]}>
                          {goal.description}
                        </Text>
                      ) : null}
                      <View style={styles.goalMeta}>
                        <View
                          style={[styles.catPill, { backgroundColor: (cat?.color ?? c.primary) + "22" }]}
                        >
                          <MaterialIcons
                            name={(cat?.icon ?? "flag") as keyof typeof MaterialIcons.glyphMap}
                            size={12}
                            color={cat?.color ?? c.primary}
                          />
                          <Text style={[styles.catPillText, { color: cat?.color ?? c.primary }]}>
                            {cat?.label ?? goal.category}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Pressable onPress={() => deleteGoal(goal.id)} hitSlop={8}>
                      <MaterialIcons name="more-vert" size={20} color={c.mutedForeground} />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : null}

        {goals.length === 0 ? (
          <>
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: c.primarySoft }]}>
                <MaterialIcons name="flag" size={32} color={c.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: c.foreground }]}>
                No goals yet
              </Text>
              <Text style={[styles.emptySub, { color: c.mutedForeground }]}>
                Set small, meaningful wellness goals and track your progress.
              </Text>
            </View>
            <PrimaryButton
              label="Create your first goal"
              icon="add"
              onPress={() => setShowCreate(true)}
            />
            <View style={{ height: 22 }} />
          </>
        ) : null}

        <View style={{ height: 22 }} />
        <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
          SUGGESTED GOALS
        </Text>
        {SUGGESTIONS.map((s) => {
          const cat = GOAL_CATEGORIES.find((c) => c.id === s.category);
          const alreadyAdded = goals.some((g) => g.title === s.title);
          return (
            <Pressable
              key={s.title}
              onPress={() => !alreadyAdded && addSuggestion(s)}
              disabled={alreadyAdded}
              style={({ pressed }) => [
                styles.suggestionCard,
                {
                  backgroundColor: c.card,
                  borderColor: c.border,
                  opacity: alreadyAdded ? 0.5 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <View
                style={[styles.suggestIcon, { backgroundColor: (cat?.color ?? c.primary) + "22" }]}
              >
                <MaterialIcons
                  name={(cat?.icon ?? "flag") as keyof typeof MaterialIcons.glyphMap}
                  size={20}
                  color={cat?.color ?? c.primary}
                />
              </View>
              <Text style={[styles.suggestText, { color: c.foreground }]}>
                {s.title}
              </Text>
              {alreadyAdded ? (
                <MaterialIcons name="check" size={18} color={c.mutedForeground} />
              ) : (
                <MaterialIcons name="add" size={18} color={c.primary} />
              )}
            </Pressable>
          );
        })}

        {done.length > 0 ? (
          <>
            <View style={{ height: 22 }} />
            <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
              COMPLETED
            </Text>
            {done.map((goal) => (
              <Pressable key={goal.id} onLongPress={() => deleteGoal(goal.id)}>
                <View
                  style={[
                    styles.goalCard,
                    { backgroundColor: c.card, borderColor: c.border, opacity: 0.7 },
                  ]}
                >
                  <Pressable
                    onPress={() => toggleComplete(goal.id)}
                    style={[styles.checkbox, { borderColor: c.secondary, backgroundColor: c.secondarySoft }]}
                    hitSlop={8}
                  >
                    <MaterialIcons name="check" size={16} color={c.secondary} />
                  </Pressable>
                  <Text style={[styles.goalTitle, { color: c.mutedForeground, flex: 1, textDecorationLine: "line-through" }]}>
                    {goal.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : null}
      </ScrollView>

      <Modal
        visible={showCreate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={[styles.root, { backgroundColor: c.background }]}>
          <View
            style={[
              styles.modalHeader,
              { backgroundColor: c.card, borderBottomColor: c.border, paddingTop: insets.top + 14 },
            ]}
          >
            <Pressable onPress={() => setShowCreate(false)} hitSlop={12} style={styles.modalClose}>
              <MaterialIcons name="close" size={24} color={c.foreground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: c.foreground }]}>New goal</Text>
            <Pressable
              onPress={createGoal}
              disabled={!title.trim()}
              style={[styles.saveBtn, { backgroundColor: c.primary, opacity: title.trim() ? 1 : 0.5 }]}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={[styles.inputLabel, { color: c.foreground }]}>Goal title</Text>
            <TextInput
              autoFocus
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Sleep by 10pm every weekday"
              placeholderTextColor={c.mutedForeground}
              style={[styles.textInput, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
            />
            <View style={{ height: 14 }} />
            <Text style={[styles.inputLabel, { color: c.foreground }]}>Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Why does this matter to you?"
              placeholderTextColor={c.mutedForeground}
              multiline
              style={[styles.textInput, styles.textArea, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]}
            />
            <View style={{ height: 16 }} />
            <Text style={[styles.inputLabel, { color: c.foreground }]}>Category</Text>
            <View style={styles.catGrid}>
              {GOAL_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[
                    styles.catOption,
                    {
                      backgroundColor: category === cat.id ? cat.color + "22" : c.muted,
                      borderColor: category === cat.id ? cat.color : c.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={cat.icon as keyof typeof MaterialIcons.glyphMap}
                    size={18}
                    color={category === cat.id ? cat.color : c.mutedForeground}
                  />
                  <Text style={[styles.catOptionText, { color: category === cat.id ? cat.color : c.mutedForeground }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFFFFF" },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  content: { padding: 16 },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.8, marginBottom: 10 },
  goalCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  goalTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 20, flex: 1 },
  goalDesc: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  goalMeta: { flexDirection: "row", marginTop: 8 },
  catPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  catPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  emptyState: { alignItems: "center", paddingVertical: 24, gap: 10, marginBottom: 20 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  suggestIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  suggestText: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  modalClose: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 17, flex: 1 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },
  inputLabel: { fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 8 },
  textInput: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  catOptionText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
});
