import { promises as fs } from "fs";
import path from "path";

export interface ChatMessage {
  id: string;
  role: "user" | "support";
  text: string;
  sessionId: string;
  createdAt: string;
}

const memoryStore: ChatMessage[] = [];

function chatFilePath(): string {
  return path.join(process.cwd(), "data", "chat.json");
}

export async function loadChatMessages(): Promise<ChatMessage[]> {
  try {
    const raw = await fs.readFile(chatFilePath(), "utf-8");
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [...memoryStore];
  }
}

export async function saveChatMessages(messages: ChatMessage[]): Promise<void> {
  try {
    const filePath = chatFilePath();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write chat history to disk (falling back to memory):", err);
  }
  memoryStore.length = 0;
  memoryStore.push(...messages);
}
