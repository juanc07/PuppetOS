import {
  IMemory, IKnowledge, ITrainingSystem,
  IStateManager, AgentConfig, IInteractionLogger, IAgent
} from "../interfaces";
import dotenv from 'dotenv';
import { EventHub, eventHub } from "./EventHub";

// Load environment variables from `.env` file
dotenv.config();

// AI Agent class
export class Agent implements IAgent {
  private memory: IMemory;
  private knowledge: IKnowledge;
  private trainingSystem: ITrainingSystem;
  private stateManager: IStateManager;
  private interactionLogger: IInteractionLogger;
  private config: AgentConfig;
  private eventHub: EventHub;
  private agentId: string; // Now a proper property
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

  // Initialize the AI based on the configuration
  private initialize() {
    console.log(`Initializing AI: ${this.config.name}`);
    console.log(`Description: ${this.config.description}`);
    console.log(`Mission: ${this.config.mission}`);
    console.log(`Vision: ${this.config.vision}`);
    console.log(`Socials: ${JSON.stringify(this.config.contact.socials, null, 2)}`);
    console.log(`Wallets: ${JSON.stringify(this.config.wallets, null, 3)}`);
  }

  async handleInteraction(userId: string, platform: string, input: string): Promise<string> {

    if (!this.isRunning) throw new Error(`Agent: ${this.config.name} is not running`);

    const preResult = await this.eventHub.emit("preAction", {
      agentId: this.getId(),
      action: "handleInteraction",
      data: { userId, platform, input },
      timestamp: Date.now(),
      priority: "medium",
    });

    if (preResult === "cancel") return "Action canceled.";
    const finalInput = preResult === "allow" ? input : (preResult as { newData: any }).newData.input;

    await this.stateManager.updateStates(finalInput, userId);
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
      if (input.toLowerCase().includes(topic) && this.stateManager.isOpenToTopic(topic)) {
        response += `Love chatting about ${topic}! `;
        await this.knowledge.addKnowledge(`${userId}_${topic}`, `User ${userId} likes ${topic}`);
        break;
      }
    }

    if (!talkative) response = response.trim() + " That’s all for now.";
    else {
      const userKnowledge = await this.knowledge.getKnowledgeByKey(`${userId}_tech`); // Example key
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
    await this.evolve();

    await this.eventHub.emit("postAction", {
      agentId: this.getId(),
      action: "handleInteraction",
      data: { input: finalInput, response },
      timestamp: Date.now(),
      priority: "medium",
    });

    return response;
  }

  async evolve() {
    if (!this.isRunning) return;

    const preResult = await this.eventHub.emit("preAction", {
      agentId: this.getId(),
      action: "evolve",
      data: {},
      timestamp: Date.now(),
      priority: "medium",
    });

    if (preResult === "cancel") return;
    const updates = preResult === "allow" ? await this.knowledge.evolvePersonality() : (preResult as { newData: any }).newData;

    if (updates.tone) this.config.personality.tone = updates.tone;
    if (updates.humor !== undefined) this.config.personality.humor = updates.humor;
    if (updates.catchphrase) this.config.personality.catchphrase = updates.catchphrase;

    await this.eventHub.emit("postAction", {
      agentId: this.getId(),
      action: "evolve",
      data: updates,
      timestamp: Date.now(),
      priority: "medium",
    });
  }

  // Operator control methods
  setMood(mood: "happy" | "neutral" | "grumpy") {
    const toneMap = { happy: "friendly", neutral: "casual", grumpy: "sassy" };
    (this.stateManager as any).config.personality.tone = toneMap[mood];
  }

  setTalkative(talkative: boolean) {
    (this.stateManager as any).config.personality.humor = talkative;
  }

  setOpenTopics(topics: string[]) {
    (this.stateManager as any).config.personality.preferences.topics = topics;
  }

  getConfig() {
    return (this.stateManager as any).config;
  }

  async deleteMemory(userId: string) {
    await this.memory.deleteLongTerm(userId);
  }

  async clearKnowledge() {
    await this.knowledge.clearKnowledge();
  }

  async getKnowledgeByKey(key: string) {
    return await this.knowledge.getKnowledgeByKey(key);
  }

  async getKnowledge(): Promise<string[]> {
    return await this.knowledge.getKnowledge();
  }

  // Get responses based on personality and knowledge
  public getResponse(input: string): string {
    const response = this.config.knowledge.data.find((entry) =>
      input.toLowerCase().includes(entry.toLowerCase())
    );
    return response || "I'm not sure about that, but I'm always learning!";
  }

  // Retrieve character-specific information
  public getCharacterInfo(): AgentConfig {
    return this.config;
  }
}
