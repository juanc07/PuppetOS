import { AgentConfig } from "./AgentConfig";

export interface ActionData {
    input?: string;
    userId: string;
    platform: string;
    error?: string;
    response?: string;
    [key: string]: any;
  }
  
  export interface EventPayload {
    agentId: string;
    action: string;
    data: ActionData;
    timestamp: number;
    priority?: "low" | "medium" | "high";
  }
  
  export interface ControlRule {
    action: string;
    condition: (data: ActionData) => boolean;
    result: "allow" | "cancel" | "override" | { newData: ActionData } | ((data: ActionData) => "allow" | "cancel" | "override" | { newData: ActionData });
  }

  // puppetos/core/interfaces.ts
export interface AgentRecord {
  agentId: string;
  config: AgentConfig;
  creatorUserId: string;
  createdAt: number;
}

export interface RegistryStorage {
  createAgent(agentId: string, config: AgentConfig, creatorUserId: string): Promise<void>;
  getAgent(agentId: string): Promise<AgentRecord | undefined>;
  getAllAgents(): Promise<AgentRecord[]>;
  updateAgent(agentId: string, config: AgentConfig): Promise<void>;
  deleteAgent(agentId: string): Promise<void>;
  deleteAllAgents(): Promise<void>;
}