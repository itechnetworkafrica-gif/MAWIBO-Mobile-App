import { buildPreConsultation } from "@/lib/aiClient";

export async function getPreConsultation(input: {
  symptoms: string;
  duration?: string;
  mood_history?: { date: string; mood: string }[];
  notes?: string;
}): Promise<string> {
  try {
    return await buildPreConsultation(input);
  } catch {
    const lines: string[] = [];
    lines.push(`CHIEF CONCERN: ${input.symptoms.split(".")[0]}`);
    lines.push(`SYMPTOMS: ${input.symptoms}`);
    if (input.duration) lines.push(`DURATION: ${input.duration}`);
    if (input.notes) lines.push(`NOTES: ${input.notes}`);
    lines.push("QUESTIONS FOR DOCTOR:");
    lines.push("- What might be causing this?");
    lines.push("- What can I do at home to feel better?");
    lines.push("- When should I come back if symptoms continue?");
    return lines.join("\n");
  }
}
