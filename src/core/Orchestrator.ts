// orchestrator.ts
import { v4 as uuidv4 } from "uuid";
import { EventHub, eventHub } from "./EventHub";
import { IAgent } from "../interfaces";
import { ActionData, EventPayload, ControlRule } from "../interfaces/Types";
import { ruleSets } from "./Rules";

class Orchestrator {
  private agents: Map<string, IAgent> = new Map();
  private agentRules: Map<string, ControlRule[]> = new Map();
  private eventHub: EventHub;

  constructor(globalRules: ControlRule[] = []) {
    this.eventHub = eventHub;
    this.agentRules.set("global", globalRules);
    this.setupEventListeners();
    console.log("Orchestrator initialized");
  }

  private setupEventListeners(): void {
    this.eventHub.on("preAction", (payload: EventPayload) => {
      const { agentId, action, data } = payload;
      console.log(`Agent ${agentId} wants to ${action} with`, data);

      const agentRules = this.agentRules.get(agentId) || [];
      for (const rule of agentRules) {
        if (rule.action === action && rule.condition(data)) {
          const result = typeof rule.result === "function" ? rule.result(data) : rule.result;
          console.log(`Agent ${agentId} rule applied: ${action} -> ${JSON.stringify(result)}`);
          return result;
        }
      }

      const globalRules = this.agentRules.get("global") || [];
      for (const rule of globalRules) {
        if (rule.action === action && rule.condition(data)) {
          const result = typeof rule.result === "function" ? rule.result(data) : rule.result;
          console.log(`Global rule applied: ${action} -> ${JSON.stringify(result)}`);
          return result;
        }
      }
      return "allow";
    });

    this.eventHub.on("postAction", (payload: EventPayload) => {
      const { agentId, action, data } = payload;
      console.log(`Agent ${agentId} completed ${action}`, data);
      return "allow" as const;
    });

    this.eventHub.on("error", (payload: EventPayload) => {
      const { agentId, action, data } = payload;
      console.error(`Agent ${agentId} errored during ${action}`, data);
      return "allow" as const;
    });
  }

  async startAgent(agent: IAgent): Promise<string> {
    const agentId = uuidv4();
    await agent.start(agentId);
    this.agents.set(agentId, agent);

    const config = agent.getCharacterInfo();
    const agentRules = (config.ruleIds || []).map(id => {
      const rule = ruleSets[id];
      if (!rule) throw new Error(`Unknown rule ID: ${id} for agent ${agentId}`);
      return rule;
    });
    this.agentRules.set(agentId, agentRules);

    console.log(`Started agent ${agentId} with rules: ${config.ruleIds || "none"}`);
    return agentId;
  }

  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      await agent.stop();
      this.agents.delete(agentId);
      this.agentRules.delete(agentId);
      console.log(`Stopped agent ${agentId}`);
    }
  }

  public addAgentRule(agentId: string, rule: ControlRule): void {
    const rules = this.agentRules.get(agentId) || [];
    rules.push(rule);
    this.agentRules.set(agentId, rules);
  }

  async routeMessage(message: string, userId: string, platform: string, agentId?: string): Promise<string> {
    if (!agentId) {
      if (this.agents.size === 0) throw new Error("No agents available");
      agentId = this.agents.keys().next().value as string;
    }

    const agent = this.agents.get(agentId);
    if (!agent) return "No agent available.";

    const payload: EventPayload = {
      agentId,
      action: "handleInteraction",
      data: { input: message, userId, platform },
      timestamp: Date.now(),
      priority: "medium",
    };

    const preResult = await this.eventHub.emit("preAction", payload);

    if (preResult === "cancel") return "Action canceled by orchestrator.";
    const finalData = preResult === "allow" || preResult === "override"
      ? { input: message, userId, platform }
      : (preResult as { newData: ActionData }).newData;

    try {
      const response = await agent.handleInteraction(finalData.userId, finalData.platform, finalData.input || "");
      void this.eventHub.emit("postAction", {
        agentId,
        action: "handleInteraction",
        data: { input: finalData.input || "", userId: finalData.userId, platform: finalData.platform, response },
        timestamp: Date.now(),
        priority: "medium",
      });
      return response;
    } catch (error) {
      const errorData: ActionData = {
        input: message,
        userId,
        platform,
        error: error instanceof Error ? error.message : String(error),
      };
      void this.eventHub.emit("error", {
        agentId,
        action: "handleInteraction",
        data: errorData,
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
      const response = await this.routeMessage(input, "cliUser", "CLI");
      console.log(`Response: ${response}`);
    });
  }
}

export { Orchestrator };