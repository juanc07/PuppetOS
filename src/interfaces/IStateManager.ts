export interface IStateManager {
    getUserAffinity(userId: string): Promise<"love" | "neutral" | "hate">;
    getMood(): "happy" | "neutral" | "grumpy";
    isTalkative(): boolean;
    isOpenToTopic(topic: string): boolean;
    updateStates(input: string, userId: string): Promise<void>;
    getIdentity(): { name: string; bio: string; mission: string };
    getKnowledge(): string[];
  }