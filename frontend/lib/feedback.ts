import { promises as fs } from "fs";
import path from "path";

export interface FeedbackEntry {
  id: string;
  rating: number;
  message: string;
  screen?: string;
  email?: string;
  createdAt: string;
}

const memoryStore: FeedbackEntry[] = [];

function feedbackFilePath(): string {
  return path.join(process.cwd(), "data", "feedback.json");
}

export async function loadFeedback(): Promise<FeedbackEntry[]> {
  try {
    const raw = await fs.readFile(feedbackFilePath(), "utf-8");
    const parsed = JSON.parse(raw) as FeedbackEntry[];
    return parsed.map((e) => ({
      ...e,
      rating: typeof e.rating === "number" ? e.rating : 0,
      message: e.message ?? "",
    }));
  } catch {
    return [...memoryStore];
  }
}

export async function saveFeedback(entries: FeedbackEntry[]): Promise<void> {
  const filePath = feedbackFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(entries, null, 2), "utf-8");
  memoryStore.length = 0;
  memoryStore.push(...entries);
}

export async function getApprovedFeedback(): Promise<FeedbackEntry[]> {
  const entries = await loadFeedback();
  return entries
    .filter((e) => e.rating >= 3 && e.message.trim().length > 0)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getFeedbackSummary(): Promise<{
  averageRating: number;
  count: number;
  approvedCount: number;
}> {
  const entries = await loadFeedback().then((list) =>
    list.filter((e) => typeof e.rating === "number" && e.rating >= 1)
  );
  const approved = entries.filter((e) => e.rating >= 3);
  const averageRating =
    entries.length > 0
      ? Math.round(
          (entries.reduce((sum, e) => sum + e.rating, 0) / entries.length) * 10
        ) / 10
      : 0;

  return {
    averageRating,
    count: entries.length,
    approvedCount: approved.length,
  };
}
