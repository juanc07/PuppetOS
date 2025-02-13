import { IKnowledge } from "src/interfaces";

export class Knowledge implements IKnowledge {
  private knowledgeStore: Map<string, string>;

  constructor() {
    this.knowledgeStore = new Map();
  }

  // Add or update knowledge
  addKnowledge(key: string, value: string): void {
    this.knowledgeStore.set(key, value);
  }

  // Retrieve knowledge
  getKnowledge(key: string): string | undefined {
    return this.knowledgeStore.get(key);
  }

  // Remove knowledge
  removeKnowledge(key: string): void {
    this.knowledgeStore.delete(key);
  }

  // List all stored knowledge
  listKnowledge(): { key: string; value: string }[] {
    return Array.from(this.knowledgeStore.entries()).map(([key, value]) => ({
      key,
      value,
    }));
  }
}
