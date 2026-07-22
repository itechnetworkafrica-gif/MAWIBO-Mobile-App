export interface WellnessArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  icon: string;
  color: string;
  readMinutes: number;
  body: { heading?: string; text: string }[];
  /** Present for articles pulled live from an external news/RSS source. */
  source?: "live";
  link?: string;
  publishedAt?: string;
}

export const WELLNESS_ARTICLES: WellnessArticle[] = [
  {
    id: "a1",
    title: "5 ways to calm anxiety in under 5 minutes",
    category: "Anxiety",
    summary:
      "Quick grounding techniques that activate your parasympathetic nervous system and bring you back to the present moment.",
    icon: "self-improvement",
    color: "#3A7BD5",
    readMinutes: 3,
    body: [
      {
        text: "Anxiety can arrive without warning. Your heart races, your breathing shortens, and the world feels overwhelming. The good news is that your nervous system has a built-in off switch — and you can activate it within minutes.",
      },
      {
        heading: "1. Box breathing",
        text: "Breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat 4 times. This slows your heart rate and signals safety to your brain. Navy SEALs and emergency physicians use this technique before high-stress situations.",
      },
      {
        heading: "2. The 5-4-3-2-1 grounding method",
        text: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This pulls your mind out of future-focused anxiety and into the present moment where you are safe.",
      },
      {
        heading: "3. Cold water on your wrists",
        text: "Running cold water over the inside of your wrists activates the vagus nerve and can quickly reduce panic. Some people splash cold water on their face — this triggers the mammalian dive reflex, slowing the heart rate immediately.",
      },
      {
        heading: "4. Move your body for 2 minutes",
        text: "A brisk 2-minute walk, or even standing up and shaking out your arms, releases tension that anxiety builds in your muscles. Movement is one of the fastest ways to metabolise stress hormones like cortisol and adrenaline.",
      },
      {
        heading: "5. Write one sentence",
        text: "Open any notes app and write what you are anxious about in one sentence. Getting it out of your head and onto a page reduces its power. You do not need to solve it — just name it.",
      },
      {
        text: "Practise these when you are calm so they become automatic when anxiety arrives. Even one technique used consistently can change how your nervous system responds to stress over time.",
      },
    ],
  },
  {
    id: "a2",
    title: "Why sleep is the foundation of mental health",
    category: "Sleep",
    summary:
      "During deep sleep your brain processes emotions, clears stress hormones, and consolidates memories. Here is how to protect it.",
    icon: "bedtime",
    color: "#7C5DB8",
    readMinutes: 4,
    body: [
      {
        text: "You can eat well, exercise, and take every supplement available — but without adequate sleep, your mental health will struggle. Sleep is not a luxury. It is the single most important recovery tool your brain has.",
      },
      {
        heading: "What happens in your brain when you sleep",
        text: "During deep sleep, your brain runs a cleaning cycle using cerebrospinal fluid, flushing out waste proteins linked to depression and cognitive decline. Your amygdala — the brain's threat detector — resets, so you wake up less emotionally reactive.",
      },
      {
        heading: "The effects of sleep debt",
        text: "After just one night of poor sleep, anxiety increases by 30%, emotional regulation deteriorates, and concentration drops significantly. Chronic sleep deprivation is one of the strongest predictors of depression, anxiety disorders, and burnout.",
      },
      {
        heading: "Practical sleep hygiene",
        text: "Keep a consistent wake time even on weekends. Avoid screens for 45 minutes before bed. Keep your room cool (around 18°C is ideal). Avoid caffeine after midday. A 10-minute wind-down routine — even just sitting quietly — dramatically improves sleep onset.",
      },
      {
        heading: "When you cannot sleep",
        text: "If you lie awake for more than 20 minutes, get up and do something quiet until you feel sleepy. Fighting wakefulness in bed trains your brain to associate the bed with frustration. Reading a physical book, gentle stretching, or listening to calm audio works well.",
      },
      {
        text: "If sleep problems persist for more than 3 weeks, speak to a health professional. Cognitive Behavioural Therapy for Insomnia (CBT-I) is the most effective long-term treatment and does not require medication.",
      },
    ],
  },
  {
    id: "a3",
    title: "The power of talking to someone who listens",
    category: "Connection",
    summary:
      "Research shows even a single honest conversation with a trusted person can reduce cortisol by up to 30%. You do not have to carry it alone.",
    icon: "people",
    color: "#6FCF97",
    readMinutes: 3,
    body: [
      {
        text: "In many communities, including across Liberia, there is a cultural tendency to carry emotional pain alone — as a sign of strength, or to protect others from worry. But silence has a cost. Research consistently shows that social connection is one of the most powerful medicines for the mind.",
      },
      {
        heading: "The science of being heard",
        text: "Studies at UCLA show that simply labelling emotions out loud to another person reduces activity in the amygdala — the brain's fear centre. A single honest conversation with a trusted person can reduce cortisol (the stress hormone) by up to 30% and reduce symptoms of depression within days.",
      },
      {
        heading: "You do not need a therapist to start",
        text: "A trusted friend, a family member, a community elder, a religious leader, or even a stranger in a support group can provide the listening ear that changes how you feel. What matters is that the person listens without judgement and without trying to immediately fix things.",
      },
      {
        heading: "How to start the conversation",
        text: "You do not need to explain everything at once. Try: 'I have been having a hard time lately.' That is enough. Most people will respond with care. If they do not, that says something about them, not about your feelings being valid.",
      },
      {
        heading: "When talking locally is not possible",
        text: "If you do not feel safe talking to someone in your life, the AI Mate in this app is available 24/7 and will never judge you. Many people find it easier to be honest with AI before they feel ready to open up to a person. It is a valid starting point.",
      },
      {
        text: "You were not designed to carry everything alone. Reaching out is not weakness — it is wisdom.",
      },
    ],
  },
  {
    id: "a4",
    title: "Understanding grief in Liberian communities",
    category: "Grief",
    summary:
      "Grief is universal, but how communities hold it differs. This piece explores culturally resonant ways to process loss in West Africa.",
    icon: "favorite",
    color: "#E07A5F",
    readMinutes: 5,
    body: [
      {
        text: "Grief is one of the most universal human experiences, yet how it is held, expressed, and processed varies enormously across cultures. In Liberian communities, grief is often communal, loud, and physical — a collective experience that involves the whole village, not just the immediate family.",
      },
      {
        heading: "The strength of communal mourning",
        text: "The Liberian tradition of gathering around the bereaved — cooking, singing, praying, staying for nights — provides what researchers call 'co-regulation': the shared nervous system support that helps individuals bear what they cannot bear alone. This is deeply adaptive and protective.",
      },
      {
        heading: "When traditional support is not enough",
        text: "For some losses — particularly sudden deaths, war-related trauma, or the death of a child — communal mourning rituals alone may not be sufficient. Complicated grief, where intense loss symptoms persist beyond 12 months and impair daily function, affects a significant minority of bereaved people.",
      },
      {
        heading: "Signs that extra support is needed",
        text: "Persistent inability to accept the loss, intense yearning that does not ease over months, feeling that life has no meaning without the person, or complete withdrawal from family and community — these are signs that talking to a counsellor or mental health professional could help.",
      },
      {
        heading: "Processing loss through story",
        text: "In many West African traditions, story is medicine. Telling the story of the person who died — their character, their laughs, their struggles — is a powerful way to honour them and integrate the loss. Writing these stories in a journal, or sharing them in this community, is a form of healing.",
      },
      {
        text: "Grief does not end. It changes shape. The goal is not to 'get over' someone you loved — it is to find a way to carry them with you as you continue to live.",
      },
    ],
  },
  {
    id: "a5",
    title: "Box breathing: a tool doctors actually use",
    category: "Breathing",
    summary:
      "Navy SEALs and emergency room physicians rely on box breathing to stay calm under pressure. Here is the simple four-step method.",
    icon: "air",
    color: "#5C97E0",
    readMinutes: 2,
    body: [
      {
        text: "Box breathing — also called tactical breathing or square breathing — is one of the simplest and most evidence-based tools for calming the nervous system. It costs nothing, requires no equipment, and can be done anywhere in under 2 minutes.",
      },
      {
        heading: "Where it comes from",
        text: "Box breathing was popularised by U.S. Navy SEALs who used it to maintain calm and focus under life-threatening pressure. Emergency room physicians, surgeons, and combat pilots have adopted it for the same reason: it works quickly and reliably.",
      },
      {
        heading: "The four steps",
        text: "Inhale slowly through your nose for 4 counts. Hold your breath for 4 counts. Exhale slowly through your mouth for 4 counts. Hold empty for 4 counts. That is one box. Repeat 4 times — about 90 seconds total.",
      },
      {
        heading: "Why it works",
        text: "Slow, controlled breathing stimulates the vagus nerve, which activates the parasympathetic nervous system — your body's rest-and-digest mode. It also increases oxygen efficiency and lowers the stress hormones cortisol and adrenaline. The hold phases are particularly powerful for slowing heart rate.",
      },
      {
        heading: "Try it now",
        text: "Put your hand on your stomach. Take a slow 4-count breath in through your nose. Feel your stomach expand. Hold. Breathe out for 4 counts. Hold. After 3 cycles, notice how your shoulders have dropped. This is your nervous system settling.",
      },
      {
        text: "Use box breathing before difficult conversations, during moments of panic, before sleep, or whenever you feel your anxiety rising. Regular practice makes it more effective — your brain learns to associate the pattern with safety.",
      },
    ],
  },
  {
    id: "a6",
    title: "When worry becomes too much: recognising GAD",
    category: "Anxiety",
    summary:
      "Generalised Anxiety Disorder affects millions. Learn the signs, what makes it different from everyday worry, and what actually helps.",
    icon: "psychology",
    color: "#E0A800",
    readMinutes: 5,
    body: [
      {
        text: "Everyone worries. It is a normal, adaptive response that evolved to keep us alert to danger. But for some people, worry becomes excessive, uncontrollable, and present almost every day — even about things that others would consider minor. This is Generalised Anxiety Disorder, or GAD.",
      },
      {
        heading: "What makes GAD different from normal worry",
        text: "Normal worry is temporary and proportional — it usually resolves once the situation resolves. GAD worry is persistent, switches between topics (health, money, family, work, the future), and feels impossible to switch off. Sufferers often describe it as a 'background hum' that never goes quiet.",
      },
      {
        heading: "Common signs",
        text: "Persistent restlessness or feeling on edge, muscle tension (especially neck, shoulders, jaw), sleep disturbances, difficulty concentrating, irritability, fatigue, and physical symptoms like headaches and stomach problems. GAD is often first noticed through physical symptoms rather than the worry itself.",
      },
      {
        heading: "How common it is",
        text: "GAD affects approximately 6% of people at some point in their lives, making it one of the most common mental health conditions globally. It affects women at roughly twice the rate of men. In communities with high levels of social or economic stress — like many parts of Liberia — rates may be higher.",
      },
      {
        heading: "What actually helps",
        text: "CBT (Cognitive Behavioural Therapy) is the most effective treatment for GAD, teaching people to identify and challenge anxious thoughts. The CBT tool in this app provides a starting point. Regular exercise, reducing caffeine and alcohol, consistent sleep, and mindfulness practice all provide meaningful relief.",
      },
      {
        text: "If you recognise these signs in yourself, please speak to a health professional. GAD is very treatable — but it rarely improves on its own without some intervention. You deserve support, not just endurance.",
      },
    ],
  },
  {
    id: "a7",
    title: "How journaling rewires your stress response",
    category: "Journaling",
    summary:
      "Writing about difficult experiences for as little as 15 minutes a day can meaningfully reduce symptoms of depression and trauma.",
    icon: "edit-note",
    color: "#3A7BD5",
    readMinutes: 3,
    body: [
      {
        text: "Psychologist James Pennebaker spent decades studying what happens when people write honestly about difficult experiences. His conclusion: expressive writing produces measurable improvements in physical health, immune function, and psychological wellbeing — even in people who have never done therapy.",
      },
      {
        heading: "What the research shows",
        text: "People who write about traumatic or stressful experiences for 15–20 minutes across 3–4 days show reduced anxiety, fewer doctor visits, improved mood, and better working memory. The effect seems to come from converting raw emotion into coherent narrative — giving structure to chaos.",
      },
      {
        heading: "You do not need to write well",
        text: "Journaling is not about grammar, eloquence, or having interesting things to say. It is about honest expression. Many people start with: 'I don't know what to write, I just know I feel...' That is enough. The words do not need to make sense to anyone else — or even to you at first.",
      },
      {
        heading: "Prompts to try",
        text: "What is weighing on me today? What am I grateful for that I rarely acknowledge? What would I tell a close friend who was feeling what I am feeling? What am I afraid of, and is that fear protecting me or limiting me?",
      },
      {
        heading: "Consistency over perfection",
        text: "Even 5 minutes of honest writing 3–4 days a week produces meaningful benefits over time. The AI Journal in this app can help you reflect on patterns in your entries and identify themes you may not have noticed yourself.",
      },
      {
        text: "Your experiences deserve to be witnessed — even if only by yourself. Writing is one of the oldest forms of healing we have.",
      },
    ],
  },
  {
    id: "a8",
    title: "Movement as medicine for your mind",
    category: "Exercise",
    summary:
      "Even a 20-minute walk releases BDNF, a protein that protects brain cells and lifts mood. No gym required.",
    icon: "directions-walk",
    color: "#6FCF97",
    readMinutes: 3,
    body: [
      {
        text: "You do not need a gym, expensive equipment, or a structured fitness programme to get the mental health benefits of exercise. A 20-minute walk is enough to produce measurable changes in your brain chemistry. This is not motivation — it is biology.",
      },
      {
        heading: "The BDNF effect",
        text: "Physical movement releases a protein called Brain-Derived Neurotrophic Factor (BDNF), often described as 'fertiliser for the brain.' BDNF helps new brain cells grow, strengthens connections between existing ones, and is directly linked to reduced depression, better memory, and increased resilience to stress.",
      },
      {
        heading: "Immediate mood benefits",
        text: "Within 20 minutes of moderate movement, your body releases endorphins, dopamine, and serotonin — the same chemicals that antidepressants work to increase, but without side effects. Studies show that for mild-to-moderate depression, regular exercise is as effective as antidepressant medication.",
      },
      {
        heading: "Low-barrier options for everyday life",
        text: "Walking to the market instead of taking transport. Standing and stretching for 5 minutes every hour. A 15-minute morning walk before the day begins. Dancing alone in your room. Playing with children. All of these count. Movement does not need to be formal to be beneficial.",
      },
      {
        heading: "Making it a habit",
        text: "Attach movement to something you already do — walk during a phone call, stretch before your morning prayer, do 10 squats while water boils. Small habits attached to existing routines are far more likely to stick than ambitious new routines started from scratch.",
      },
      {
        text: "Your body and mind are not separate. When you move your body, you care for your mind. Start with 10 minutes today.",
      },
    ],
  },
];
