import { AgentConfig } from "../interfaces/AgentConfig";
import { EventHub } from "../core/EventHub";

export interface IAgent {
    getId(): string;
    getConfig(): AgentConfig;
    start(agentId: string): Promise<void>;
    stop(): Promise<void>;
    handleInteraction(userId: string, platform: string, input: string): Promise<string>;
    evolve(): Promise<void>;
    setMood(mood: "happy" | "neutral" | "grumpy"): void;
    setTalkative(talkative: boolean): void;
    setOpenTopics(topics: string[]): void;
    deleteMemory(userId: string): Promise<void>;
    clearKnowledge(): Promise<void>;
    getKnowledgeByKey(key: string): Promise<string[]>;
    addKnowledge(key: string,value:string): Promise<void>;
    getKnowledge(): Promise<string[]>;
    getResponse(input: string): string;
    getEventHub(): EventHub;
    getCharacterInfo(): AgentConfig;
  }