// orchestrator.ts
import { v4 as uuidv4 } from "uuid";
import { EventHub, eventHub } from "./EventHub";
import { IAgent } from "../interfaces";

class Orchestrator {
  private agents: Map<string, IAgent> = new Map();
  private eventHub: EventHub;

  constructor() {
    this.eventHub = eventHub;
    this.setupEventListeners();
    console.log("Orchestrator initialized");
  }

  private setupEventListeners(): void {
    this.eventHub.on("preAction", (payload) => {
      const { agentId, action, data } = payload;
      console.log(`Agent ${agentId} wants to ${action} with`, data);

      if (action === "handleInteraction" && data?.input === "shutdown") {
        return "cancel";
      }
      if (action === "evolve" && Math.random() < 0.3) {
        return { newData: { tone: "sassy" } };
      }
      return "allow";
    });

    this.eventHub.on("postAction", (payload) => {
      const { agentId, action, data } = payload;
      console.log(`Agent ${agentId} completed ${action}`, data);
      return "allow" as const;
    });

    this.eventHub.on("error", (payload) => {
      const { agentId, action, data } = payload;
      console.error(`Agent ${agentId} errored during ${action}`, data);
      return "allow" as const;
    });
  }

  async startAgent(agent: IAgent): Promise<string> {
    const agentId = uuidv4();
    await agent.start(agentId);
    this.agents.set(agentId, agent);
    console.log(`Started agent ${agentId}`);
    return agentId;
  }

  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      await agent.stop();
      this.agents.delete(agentId);
      console.log(`Stopped agent ${agentId}`);
    }
  }

  async routeMessage(message: string, agentId?: string): Promise<string> {
    if (!agentId) {
      if (this.agents.size === 0) throw new Error("No agents available");
      agentId = this.agents.keys().next().value as string;
    }

    const agent = this.agents.get(agentId);
    if (!agent) return "No agent available.";

    const preResult = await this.eventHub.emit("preAction", {
      agentId,
      action: "handleInteraction",
      data: { input: message },
      timestamp: Date.now(),
      priority: "medium",
    });

    if (preResult === "cancel") return "Action canceled by orchestrator.";
    const finalInput = preResult === "allow" || preResult === "override" ? message : (preResult as { newData: any }).newData.input;

    try {
      const response = await agent.handleInteraction("user", "unknown", finalInput);
      void this.eventHub.emit("postAction", {
        agentId,
        action: "handleInteraction",
        data: { input: finalInput, response },
        timestamp: Date.now(),
        priority: "medium",
      });
      return response;
    } catch (error) {
      void this.eventHub.emit("error", {
        agentId,
        action: "handleInteraction",
        data: { error: error instanceof Error ? error.message : String(error) },
        timestamp: Date.now(),
        priority: "high",
      });
      return "Error processing interaction.";
    }
  }

  public getAgent(agentId: string): IAgent | undefined {
    return this.agents.get(agentId);
  }

  public run(): void {
    console.log("Orchestrator runtime started...");
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.on("line", async (input: string) => {
      if (input === "stop") {
        readline.close();
        console.log("Orchestrator runtime stopped");
        return;
      }
      const response = await this.routeMessage(input);
      console.log(`Response: ${response}`);
    });
  }
}

export { Orchestrator };