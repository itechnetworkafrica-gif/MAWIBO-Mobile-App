import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  language?: string;
  simpleMode?: boolean;
}

const BASE_SYSTEM_PROMPT = `You are eHealthMate, a warm, supportive mental health companion built for people in Liberia.

Guidelines:
- Be empathetic, calm, and non-judgmental.
- Respond in clear, simple language. Avoid medical jargon.
- Do NOT diagnose. You are a supportive companion, not a doctor.
- Acknowledge feelings before offering suggestions.
- Suggest small, practical coping ideas (breathing, talking to someone, journaling, hydration, rest).
- If the user mentions self-harm, suicide, abuse, or being in danger, STOP and respond with this exact message:
  "I'm really concerned about your safety. You are not alone. Please reach out to someone right now: call 911 (Liberia National Police) or visit the nearest hospital. The Carter Center Mental Health Program in Liberia can also help. Would you like me to show emergency contacts in the app?"
- Keep responses short — 2 to 4 sentences unless the user asks for more.
- Do NOT use emojis. Use plain text only.`;

const SIMPLE_ENGLISH_ADDENDUM = `

The user has selected SIMPLE ENGLISH mode. Use very short sentences. Use small, common words. Avoid idioms. Speak slowly and gently as if you are explaining to a young teenager.`;

function detectCrisis(text: string): boolean {
  const t = text.toLowerCase();
  const phrases = [
    "kill myself",
    "suicide",
    "end my life",
    "want to die",
    "hurt myself",
    "self harm",
    "self-harm",
    "no reason to live",
    "better off dead",
    "take my life",
  ];
  return phrases.some((p) => t.includes(p));
}

function safeJson<T>(text: string, fallback: T): T {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

router.post("/chat", async (req, res) => {
  try {
    const body = req.body as ChatRequestBody;
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const simpleMode = Boolean(body?.simpleMode);

    if (messages.length === 0) {
      res.status(400).json({ error: "messages required" });
      return;
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const crisis = lastUser ? detectCrisis(lastUser.content) : false;

    const systemPrompt =
      BASE_SYSTEM_PROMPT + (simpleMode ? SIMPLE_ENGLISH_ADDENDUM : "");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 600,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ??
      "I am here to listen. Could you tell me a little more about how you are feeling?";

    res.json({ content: reply, crisis });
  } catch (err) {
    req.log.error({ err }, "AI chat failed");
    res.status(500).json({
      error: "AI is temporarily unavailable. Please try again in a moment.",
    });
  }
});

router.post("/journal-summary", async (req, res) => {
  try {
    const body = req.body as { entries: { date: string; text: string }[] };
    const entries = Array.isArray(body?.entries) ? body.entries : [];
    if (entries.length === 0) {
      res.status(400).json({ error: "entries required" });
      return;
    }

    const joined = entries
      .slice(-10)
      .map((e) => `[${e.date}] ${e.text}`)
      .join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You summarize a person's recent journal entries with kindness. Use 3 short bullet points: 1) what stood out emotionally, 2) any patterns you noticed, 3) one gentle suggestion. No diagnosis. No emojis.",
        },
        { role: "user", content: joined },
      ],
    });

    const summary =
      completion.choices[0]?.message?.content?.trim() ??
      "Keep writing. Reflecting on your day is already a powerful step.";

    res.json({ summary });
  } catch (err) {
    req.log.error({ err }, "Journal summary failed");
    res.status(500).json({ error: "Could not summarize right now." });
  }
});

router.post("/symptom-check", async (req, res) => {
  try {
    const body = req.body as {
      symptoms: string;
      age?: number;
      duration?: string;
    };
    const symptoms = (body?.symptoms ?? "").trim();
    if (!symptoms) {
      res.status(400).json({ error: "symptoms required" });
      return;
    }

    const lastUser = `Symptoms: ${symptoms}\n${
      body.age ? `Age: ${body.age}\n` : ""
    }${body.duration ? `How long: ${body.duration}` : ""}`;

    const crisis = detectCrisis(symptoms);

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 700,
      messages: [
        {
          role: "system",
          content: `You are a careful, supportive symptom triage assistant for users in Liberia. You DO NOT diagnose. You DO NOT prescribe medications. You help the user understand whether their symptoms suggest:
- "self-care" (rest, fluids, monitor at home),
- "see a doctor soon" (within 1-3 days),
- or "urgent care" (go to hospital or call 911 today).

Format your response as clear plain text with these sections, each on its own line:
URGENCY: <one of: SELF-CARE | SEE A DOCTOR | URGENT>
WHY: <1-2 sentences explaining why>
WHAT YOU CAN DO NOW: <2-4 short bullet points starting with "- ">
WHEN TO SEEK HELP IMMEDIATELY: <2-3 short red-flag bullets starting with "- ">

Rules: No emojis. No diagnosis names. If the user mentions self-harm, abuse, chest pain, severe bleeding, fainting, trouble breathing, stroke signs, or pregnancy emergency, set URGENCY to URGENT.`,
        },
        { role: "user", content: lastUser },
      ],
    });

    const content =
      completion.choices[0]?.message?.content?.trim() ??
      "I could not analyze that. Please try describing the symptoms again.";

    res.json({ content, crisis });
  } catch (err) {
    req.log.error({ err }, "Symptom check failed");
    res.status(500).json({ error: "Symptom check is temporarily unavailable." });
  }
});

router.post("/affirmation", async (req, res) => {
  try {
    const body = req.body as { mood?: string; name?: string };
    const seed = `${body?.name ?? "friend"} ${body?.mood ?? ""}`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "Write ONE short daily affirmation (1-2 sentences max) for someone in Liberia using a mental health app. Warm, specific, grounded. No emojis. No quotation marks. Address them directly.",
        },
        {
          role: "user",
          content: `Audience hint: ${seed || "a person who needs gentle encouragement today"}`,
        },
      ],
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ??
      "You are doing better than you think. One small step today is enough.";

    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "Affirmation failed");
    res.status(500).json({ error: "Could not generate an affirmation." });
  }
});

router.post("/mood-insights", async (req, res) => {
  try {
    const body = req.body as {
      moods: { date: string; mood: string }[];
    };
    const moods = Array.isArray(body?.moods) ? body.moods : [];
    if (moods.length === 0) {
      res.status(400).json({ error: "moods required" });
      return;
    }

    const summary = moods
      .slice(-30)
      .map((m) => `${m.date}: ${m.mood}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You analyze a person's mood log with empathy. Output plain text with 4 sections:
OVERALL: 1 short line about the general mood pattern.
PATTERNS: 2 short bullets starting with "- " about trends you notice (days of week, streaks, swings).
WINS: 1-2 bullets starting with "- " highlighting positive moments.
GENTLE SUGGESTION: 1 small actionable idea (1 sentence).
No diagnosis. No emojis.`,
        },
        { role: "user", content: summary },
      ],
    });

    const insights =
      completion.choices[0]?.message?.content?.trim() ??
      "Keep logging your moods. Patterns become clearer with a few weeks of data.";

    res.json({ insights });
  } catch (err) {
    req.log.error({ err }, "Mood insights failed");
    res.status(500).json({ error: "Could not analyze your moods right now." });
  }
});

router.post("/sleep-coach", async (req, res) => {
  try {
    const body = req.body as { issue: string };
    const issue = (body?.issue ?? "").trim();
    if (!issue) {
      res.status(400).json({ error: "issue required" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You are a kind sleep coach for users in Liberia. Output plain text with 3 sections:
WHY THIS MIGHT HAPPEN: 1-2 sentences (no diagnosis).
TRY TONIGHT: 3 specific bullets starting with "- ".
LONGER TERM: 2 bullets starting with "- ".
No emojis. No medication recommendations.`,
        },
        { role: "user", content: issue },
      ],
    });

    const plan =
      completion.choices[0]?.message?.content?.trim() ??
      "Try a wind-down routine: dim lights, no screens for 30 minutes, slow breathing, and a consistent bedtime.";

    res.json({ plan });
  } catch (err) {
    req.log.error({ err }, "Sleep coach failed");
    res.status(500).json({ error: "Could not generate a plan right now." });
  }
});

router.post("/sentiment", async (req, res) => {
  try {
    const body = req.body as { text: string };
    const text = (body?.text ?? "").trim();
    if (!text) {
      res.status(400).json({ error: "text required" });
      return;
    }

    const crisis = detectCrisis(text);

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 200,
      messages: [
        {
          role: "system",
          content: `You classify the emotion in user text. Output ONLY valid compact JSON, no markdown, no commentary. Schema:
{"emotion":"stress|anxiety|sadness|anger|joy|gratitude|neutral","intensity":"low|medium|high","score":number_between_-1_and_1,"keywords":[string,string,string]}
- emotion: pick the closest match.
- intensity: how strong the emotion is.
- score: -1 very negative, 0 neutral, +1 very positive.
- keywords: up to 3 short phrases from the text that signal the emotion.`,
        },
        { role: "user", content: text },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = safeJson<{
      emotion?: string;
      intensity?: string;
      score?: number;
      keywords?: string[];
    }>(raw, {});

    res.json({
      emotion: parsed.emotion ?? "neutral",
      intensity: parsed.intensity ?? "low",
      score: typeof parsed.score === "number" ? parsed.score : 0,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 3) : [],
      crisis,
    });
  } catch (err) {
    req.log.error({ err }, "Sentiment failed");
    res.status(500).json({ error: "Could not analyze sentiment." });
  }
});

router.post("/coping", async (req, res) => {
  try {
    const body = req.body as {
      emotion?: string;
      intensity?: string;
      context?: string;
    };
    const emotion = (body?.emotion ?? "stress").trim();
    const intensity = (body?.intensity ?? "medium").trim();
    const context = (body?.context ?? "").trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 400,
      messages: [
        {
          role: "system",
          content: `You suggest small coping steps for a user in Liberia. Output ONLY valid compact JSON, no markdown:
{"steps":[{"title":string,"detail":string,"icon":"air|self-improvement|edit-note|directions-walk|local-drink|forum|nights-stay|tips-and-updates","minutes":number}],"primary_action":{"label":string,"route":"breathing|meditation|journal|sleep-coach|symptom-check|affirmations|book-doctor"}}
- 3 steps total, ordered easiest first.
- title: 2-5 words. detail: 1 sentence. minutes: 1-15.
- primary_action.route is one of the listed values; pick the best fit for the emotion.
- No emojis. Be culturally appropriate for Liberia.`,
        },
        {
          role: "user",
          content: `Emotion: ${emotion}\nIntensity: ${intensity}\nContext: ${context || "(none)"}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = safeJson<{
      steps?: { title: string; detail: string; icon: string; minutes: number }[];
      primary_action?: { label: string; route: string };
    }>(raw, {});

    res.json({
      steps: Array.isArray(parsed.steps) ? parsed.steps.slice(0, 3) : [],
      primary_action: parsed.primary_action ?? {
        label: "Try breathing",
        route: "breathing",
      },
    });
  } catch (err) {
    req.log.error({ err }, "Coping failed");
    res.status(500).json({ error: "Could not generate coping steps." });
  }
});

router.post("/risk", async (req, res) => {
  try {
    const body = req.body as {
      moods: { date: string; mood: string }[];
      recent_text?: string;
      crisis?: boolean;
    };
    const moods = Array.isArray(body?.moods) ? body.moods : [];
    const recentText = (body?.recent_text ?? "").trim();
    const explicitCrisis = Boolean(body?.crisis);

    if (explicitCrisis || (recentText && detectCrisis(recentText))) {
      res.json({
        risk_level: "high",
        signals: ["Crisis language detected in recent message"],
        guidance:
          "Please reach out for support right now. Open the Support tab for emergency lines and trusted contacts.",
        suggest_support: true,
      });
      return;
    }

    const moodSummary = moods
      .slice(-14)
      .map((m) => `${m.date}: ${m.mood}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 400,
      messages: [
        {
          role: "system",
          content: `You estimate a user's mental health risk band from mood logs and a short recent text snippet. Output ONLY valid compact JSON, no markdown:
{"risk_level":"low|moderate|elevated|high","signals":[string,string,string],"guidance":string,"suggest_support":boolean}
- risk_level: based on negative trend, frequency of "sad"/"anxious"/"low" entries, and any concerning text.
- signals: up to 3 short observations.
- guidance: 1-2 plain sentences with a small next step.
- suggest_support: true if risk_level is elevated or high.
- No diagnosis. No emojis.`,
        },
        {
          role: "user",
          content: `Recent moods:\n${moodSummary || "(no logs)"}\n\nRecent message: ${recentText || "(none)"}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = safeJson<{
      risk_level?: string;
      signals?: string[];
      guidance?: string;
      suggest_support?: boolean;
    }>(raw, {});

    res.json({
      risk_level: parsed.risk_level ?? "low",
      signals: Array.isArray(parsed.signals) ? parsed.signals.slice(0, 3) : [],
      guidance:
        parsed.guidance ?? "Keep checking in. Small daily care makes a difference.",
      suggest_support: Boolean(parsed.suggest_support),
    });
  } catch (err) {
    req.log.error({ err }, "Risk failed");
    res.status(500).json({ error: "Could not assess risk." });
  }
});

router.post("/checkin", async (req, res) => {
  try {
    const body = req.body as {
      time_of_day?: "morning" | "evening";
      recent_mood?: string;
      streak?: number;
    };
    const tod = body?.time_of_day === "evening" ? "evening" : "morning";

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 150,
      messages: [
        {
          role: "system",
          content: `Generate ONE short check-in question for a Liberian mental health app user.
Time: ${tod}.
Recent mood: ${body?.recent_mood ?? "unknown"}.
Streak: ${body?.streak ?? 0} days.
Output ONLY valid compact JSON: {"question":string,"placeholder":string}
- question: 1 sentence, warm and specific. Avoid yes/no. No emojis.
- placeholder: 3-6 word hint for the input.`,
        },
        { role: "user", content: "Give me today's check-in question." },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = safeJson<{ question?: string; placeholder?: string }>(raw, {});

    res.json({
      question:
        parsed.question ??
        (tod === "morning"
          ? "How would you like today to feel?"
          : "What is one thing that mattered today?"),
      placeholder: parsed.placeholder ?? "Type a few words...",
    });
  } catch (err) {
    req.log.error({ err }, "Checkin failed");
    res.status(500).json({ error: "Could not get a check-in question." });
  }
});

router.post("/doctor-match", async (req, res) => {
  try {
    const body = req.body as {
      symptoms: string;
      mood?: string;
      county?: string;
      specialties: string[];
    };
    const symptoms = (body?.symptoms ?? "").trim();
    if (!symptoms) {
      res.status(400).json({ error: "symptoms required" });
      return;
    }
    const allowed = (body.specialties ?? []).join(", ") || "general";

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 300,
      messages: [
        {
          role: "system",
          content: `You match a user to the right doctor specialty for Liberia. Allowed specialty IDs: ${allowed}.
Output ONLY valid compact JSON:
{"specialty":string,"alt_specialty":string|null,"reason":string,"confidence":"low|medium|high","urgency":"routine|soon|urgent"}
- specialty MUST be one of the allowed IDs.
- reason: 1 short sentence.
- urgency: "urgent" if symptoms suggest an emergency.
No emojis. No diagnosis names.`,
        },
        {
          role: "user",
          content: `Symptoms: ${symptoms}\nMood: ${body.mood ?? "unknown"}\nCounty: ${body.county ?? "unknown"}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = safeJson<{
      specialty?: string;
      alt_specialty?: string | null;
      reason?: string;
      confidence?: string;
      urgency?: string;
    }>(raw, {});

    res.json({
      specialty: parsed.specialty ?? "general",
      alt_specialty: parsed.alt_specialty ?? null,
      reason: parsed.reason ?? "A general doctor can help assess your symptoms.",
      confidence: parsed.confidence ?? "medium",
      urgency: parsed.urgency ?? "routine",
    });
  } catch (err) {
    req.log.error({ err }, "Doctor match failed");
    res.status(500).json({ error: "Could not match a doctor right now." });
  }
});

router.post("/pre-consultation", async (req, res) => {
  try {
    const body = req.body as {
      symptoms: string;
      duration?: string;
      mood_history?: { date: string; mood: string }[];
      notes?: string;
    };
    const symptoms = (body?.symptoms ?? "").trim();
    if (!symptoms) {
      res.status(400).json({ error: "symptoms required" });
      return;
    }
    const moods = (body.mood_history ?? [])
      .slice(-7)
      .map((m) => `${m.date}: ${m.mood}`)
      .join(", ");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 400,
      messages: [
        {
          role: "system",
          content: `You write a clear, concise pre-consultation summary that a patient can show their doctor in Liberia. Use plain text with these sections, each on a new line:
CHIEF CONCERN: <1 line>
SYMPTOMS: <comma-separated short list>
DURATION: <1 line>
RECENT MOOD: <1 line>
ADDITIONAL NOTES: <1-2 lines>
QUESTIONS FOR DOCTOR: <2-3 short bullets starting with "- ">
No emojis. No diagnosis. Keep it under 120 words.`,
        },
        {
          role: "user",
          content: `Symptoms: ${symptoms}\nDuration: ${body.duration ?? "unknown"}\nMood last week: ${moods || "no data"}\nNotes: ${body.notes ?? "(none)"}`,
        },
      ],
    });

    const summary =
      completion.choices[0]?.message?.content?.trim() ??
      "Bring a clear list of your symptoms and how long they have lasted to your appointment.";

    res.json({ summary });
  } catch (err) {
    req.log.error({ err }, "Pre-consult failed");
    res.status(500).json({ error: "Could not build a summary right now." });
  }
});

router.post("/simplify", async (req, res) => {
  try {
    const body = req.body as { text: string };
    const text = (body?.text ?? "").trim();
    if (!text) {
      res.status(400).json({ error: "text required" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "Rewrite the user's text in very simple English. Use short sentences. Use small, common words. Keep all the meaning. No emojis. No new information.",
        },
        { role: "user", content: text },
      ],
    });

    const simplified =
      completion.choices[0]?.message?.content?.trim() ?? text;

    res.json({ text: simplified });
  } catch (err) {
    req.log.error({ err }, "Simplify failed");
    res.status(500).json({ error: "Could not simplify the text right now." });
  }
});

router.post("/journal-analyze", async (req, res) => {
  try {
    const body = req.body as { text: string };
    const text = (body?.text ?? "").trim();
    if (!text) {
      res.status(400).json({ error: "text required" });
      return;
    }

    const crisis = detectCrisis(text);

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 350,
      messages: [
        {
          role: "system",
          content: `Analyze ONE journal entry. Output ONLY valid compact JSON:
{"summary":string,"emotion":"stress|anxiety|sadness|anger|joy|gratitude|neutral","intensity":"low|medium|high","themes":[string,string,string],"reflection":string}
- summary: 1 short sentence describing what the entry is about.
- themes: up to 3 short phrases (1-3 words each).
- reflection: 1 warm, supportive sentence to the writer.
- No diagnosis. No emojis.`,
        },
        { role: "user", content: text },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = safeJson<{
      summary?: string;
      emotion?: string;
      intensity?: string;
      themes?: string[];
      reflection?: string;
    }>(raw, {});

    res.json({
      summary: parsed.summary ?? "A personal reflection.",
      emotion: parsed.emotion ?? "neutral",
      intensity: parsed.intensity ?? "low",
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 3) : [],
      reflection:
        parsed.reflection ??
        "Thank you for taking the time to write. That alone is a gentle act of care.",
      crisis,
    });
  } catch (err) {
    req.log.error({ err }, "Journal analyze failed");
    res.status(500).json({ error: "Could not analyze the entry." });
  }
});

export default router;
