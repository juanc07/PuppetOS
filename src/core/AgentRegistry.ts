// puppetos/core/AgentRegistry.ts
import { v4 as uuidv4 } from "uuid";
import { RegistryStorage, AgentRecord } from "./interfaces/Types";
import { AgentConfig } from "./interfaces";

export class AgentRegistry {
  private storage: RegistryStorage;

  constructor(storage: RegistryStorage) {
    this.storage = storage;
  }

  async createAgentRecord(config: AgentConfig, creatorUserId: string): Promise<string> {
    const agentId = uuidv4();
    const fullConfig = { ...config, id: agentId };
    await this.storage.createAgent(agentId, fullConfig, creatorUserId);
    console.log(`Created agent record for ${agentId} by ${creatorUserId}`);
    return agentId;
  }

  async getAgentRecord(agentId: string): Promise<AgentRecord | undefined> {
    return await this.storage.getAgent(agentId);
  }

  async getAllAgentRecords(): Promise<AgentRecord[]> {
    return await this.storage.getAllAgents();
  }

  async updateAgentConfig(agentId: string, newConfig: Partial<AgentConfig>): Promise<void> {
    const existingRecord = await this.getAgentRecord(agentId);
    if (!existingRecord) throw new Error(`Agent ${agentId} not found`);
    const updatedConfig = { ...existingRecord.config, ...newConfig, id: agentId };
    await this.storage.updateAgent(agentId, updatedConfig);
    console.log(`Updated config for agent ${agentId}`);
  }

  async deleteAgent(agentId: string): Promise<void> {
    const existingRecord = await this.getAgentRecord(agentId);
    if (!existingRecord) throw new Error(`Agent ${agentId} not found`);
    await this.storage.deleteAgent(agentId);
    console.log(`Deleted agent ${agentId}`);
  }

  async deleteAllAgents(): Promise<void> {
    await this.storage.deleteAllAgents();
    console.log("Deleted all agents");
  }
}