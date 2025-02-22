import { IMemory } from "src/interfaces/IMemory";
import { IStateManager } from "src/interfaces/IStateManager";
import { AgentConfig } from "src/interfaces/AgentConfig";

export class DefaultStateManager implements IStateManager {
  private memory: IMemory;
  private config: AgentConfig;

  constructor(memory: IMemory, config: AgentConfig) {
    this.memory = memory;
    this.config = config;
  }

  async getUserAffinity(userId: string): Promise<"love" | "neutral" | "hate"> {
    const userData = (await this.memory.getLongTerm(userId)) || { affinityScore: 0 };
    const score = userData.affinityScore || 0;
    const loveThreshold = 5;
    const hateThreshold = -5;
    if (score >= loveThreshold) return "love";
    if (score <= hateThreshold) return "hate";
    return "neutral";
  }

  getMood(): "happy" | "neutral" | "grumpy" {
    switch (this.config.personality.tone) {
      case "friendly": return "happy";
      case "sassy": return "grumpy";
      case "casual":
      case "formal":
        return "neutral";
      default: return "neutral";
    }
  }

  isTalkative(): boolean {
    return this.config.personality.humor || this.config.personality.formality === "casual";
  }

  isOpenToTopic(topic: string): boolean {
    return this.config.personality.preferences.topics.includes(topic.toLowerCase());
  }

  async updateStates(input: string, userId: string): Promise<void> {
    const userData = (await this.memory.getLongTerm(userId)) || { affinityScore: 0 };
    let score = userData.affinityScore || 0;
    if (input.toLowerCase().includes("love")) score += 1;
    if (input.toLowerCase().includes("hate")) score -= 1;
    await this.memory.setLongTerm(userId, {
      ...userData,
      affinityScore: score,
      lastInput: input,
    });
  }

  getIdentity() {
    return {
      name: this.config.name,
      bio: this.config.bio,
      mission: this.config.mission,
    };
  }

  getKnowledge() {
    return this.config.knowledge.data;
  }
}