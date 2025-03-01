// Agent.ts
import {
  IMemory, IKnowledge, ITrainingSystem,
  IStateManager, AgentConfig, IInteractionLogger, IAgent
} from "../interfaces";
import dotenv from "dotenv";
import { EventHub, eventHub } from "./EventHub";
import { ActionData, EventPayload} from "src/interfaces/Types"; // Import types

// Load environment variables from `.env` file
dotenv.config();

export class Agent implements IAgent {
  private memory: IMemory;
  private knowledge: IKnowledge;
  private trainingSystem: ITrainingSystem;
  private stateManager: IStateManager;
  private interactionLogger: IInteractionLogger;
  private config: AgentConfig;
  private eventHub: EventHub;
  private agentId: string;
  private isRunning: boolean = false;

  constructor(
    memory: IMemory,
    knowledge: IKnowledge,
    trainingSystem: ITrainingSystem,
    stateManager: IStateManager,
    interactionLogger: IInteractionLogger,
    config: AgentConfig,
    eventHubInstance?: EventHub
  ) {
    this.memory = memory;
    this.knowledge = knowledge;
    this.trainingSystem = trainingSystem;
    this.stateManager = stateManager;
    this.interactionLogger = interactionLogger;
    this.config = config;
    this.eventHub = eventHubInstance || eventHub || new EventHub();
    this.agentId = ""; // Initialized empty, set in start()
  }

  async start(agentId: string): Promise<void> {
    if (this.isRunning) return;
    this.agentId = agentId;
    this.initialize();
    this.isRunning = true;
    console.log(`Agent ${this.agentId} started`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
    console.log(`Agent ${this.agentId} stopped`);
  }

  getId(): string {
    if (!this.agentId) throw new Error("Agent not started yet");
    return this.agentId;
  }

  getEventHub(): EventHub {
    return this.eventHub;
  }

  private initialize(): void {
    console.log(`Initializing AI: ${this.config.name}`);
    console.log(`Description: ${this.config.description}`);
    console.log(`Mission: ${this.config.mission}`);
    console.log(`Vision: ${this.config.vision}`);
    console.log(`Socials: ${JSON.stringify(this.config.contact.socials, null, 2)}`);
    console.log(`Wallets: ${JSON.stringify(this.config.wallets, null, 3)}`);
  }

  async handleInteraction(userId: string, platform: string, input: string): Promise<string> {
    if (!this.isRunning) throw new Error(`Agent: ${this.config.name} is not running`);

    const prePayload: EventPayload = {
      agentId: this.getId(),
      action: "handleInteraction",
      data: { input, userId, platform },
      timestamp: Date.now(),
      priority: "medium",
    };

    const preResult = await this.eventHub.emit("preAction", prePayload);

    if (preResult === "cancel") return "Action canceled.";
    const finalData = preResult === "allow" || preResult === "override"
      ? { input, userId, platform }
      : (preResult as { newData: ActionData }).newData;

    await this.stateManager.updateStates(finalData.input || "", userId);
    const affinity = await this.stateManager.getUserAffinity(userId);
    const mood = this.stateManager.getMood();
    const talkative = this.stateManager.isTalkative();
    const identity = this.stateManager.getIdentity();

    let response = `Hey ${userId} (${platform}), I’m ${identity.name}! `;
    if (this.config.personality.catchphrase) response += `${this.config.personality.catchphrase} `;

    if (mood === "happy") response += "Feeling awesome today! ";
    else if (mood === "grumpy") response += "Kinda off my game today... ";

    if (affinity === "love") response += "You’re my fave! ";
    else if (affinity === "hate") response += "Let’s keep this quick... ";

    const topics = this.config.personality.preferences.topics;
    for (const topic of topics) {
      if ((finalData.input || "").toLowerCase().includes(topic) && this.stateManager.isOpenToTopic(topic)) {
        response += `Love chatting about ${topic}! `;
        await this.knowledge.addKnowledge(`${userId}_${topic}`, `User ${userId} likes ${topic}`);
        break;
      }
    }

    if (!talkative) response = response.trim() + " That’s all for now.";
    else {
      const userKnowledge = await this.knowledge.getKnowledgeByKey(`${userId}_tech`);
      if (userKnowledge.length > 0) {
        const randomFact = userKnowledge[Math.floor(Math.random() * userKnowledge.length)];
        response += `Fun fact: ${randomFact} `;
      } else {
        const generalKnowledge = await this.knowledge.getKnowledge();
        if (generalKnowledge.length > 0) {
          response += `Fun fact: ${generalKnowledge[0]} `;
        }
      }
    }

    await this.interactionLogger.logInteraction(userId, platform, input, response);    

    const postPayload: EventPayload = {
      agentId: this.getId(),
      action: "handleInteraction",
      data: { input: finalData.input || "", userId, platform, response },
      timestamp: Date.now(),
      priority: "medium",
    };

    await this.eventHub.emit("postAction", postPayload);

    return response;
  }

  // experimental for evolving the agent's personality
  async evolve(): Promise<void> {
    if (!this.isRunning) return;

    const prePayload: EventPayload = {
      agentId: this.getId(),
      action: "evolve",
      data: { userId: "", platform: "" }, // Minimal ActionData for evolve
      timestamp: Date.now(),
      priority: "medium",
    };

    const preResult = await this.eventHub.emit("preAction", prePayload);

    if (preResult === "cancel") return;
    const updates = preResult === "allow" || preResult === "override"
      ? await this.knowledge.evolvePersonality()
      : (preResult as { newData: ActionData }).newData;

    if (updates.tone) this.config.personality.tone = updates.tone;
    if (updates.humor !== undefined) this.config.personality.humor = updates.humor;
    if (updates.catchphrase) this.config.personality.catchphrase = updates.catchphrase;

    const postPayload: EventPayload = {
      agentId: this.getId(),
      action: "evolve",
      data: { userId: "", platform: "", ...updates }, // Spread updates into ActionData
      timestamp: Date.now(),
      priority: "medium",
    };

    await this.eventHub.emit("postAction", postPayload);
  }

  setMood(mood: "happy" | "neutral" | "grumpy"): void {
    const toneMap = { happy: "friendly", neutral: "casual", grumpy: "sassy" };
    (this.stateManager as any).config.personality.tone = toneMap[mood];
  }

  setTalkative(talkative: boolean): void {
    (this.stateManager as any).config.personality.humor = talkative;
  }

  setOpenTopics(topics: string[]): void {
    (this.stateManager as any).config.personality.preferences.topics = topics;
  }

  getConfig(): AgentConfig {
    return (this.stateManager as any).config;
  }

  async deleteMemory(userId: string): Promise<void> {
    await this.memory.deleteLongTerm(userId);
  }

  async clearKnowledge(): Promise<void> {
    await this.knowledge.clearKnowledge();
  }

  async addKnowledge(key: string,value:string): Promise<void> {
    await this.knowledge.addKnowledge(key,value);
  }

  async getKnowledgeByKey(key: string): Promise<string[]> {
    return await this.knowledge.getKnowledgeByKey(key);
  }

  async getKnowledge(): Promise<string[]> {
    return await this.knowledge.getKnowledge();
  }

  public getResponse(input: string): string {
    const response = this.config.knowledge.data.find((entry) =>
      input.toLowerCase().includes(entry.toLowerCase())
    );
    return response || "I'm not sure about that, but I'm always learning!";
  }

  public getCharacterInfo(): AgentConfig {
    return this.config;
  }
}