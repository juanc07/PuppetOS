export interface IKnowledge {
  addKnowledge(key: string, data: string): Promise<void>; // Updated to include key
  getKnowledge(): Promise<string[]>; // All knowledge
  getKnowledgeByKey(key: string): Promise<string[]>; // New method for specific key
  evolvePersonality(): Promise<{
    tone?: "friendly" | "sassy" | "formal" | "casual"; // Match AgentConfig
    humor?: boolean;
    catchphrase?: string;
  }>;
  clearKnowledge(): Promise<void>;
}