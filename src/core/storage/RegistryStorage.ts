// puppetos/storage/RegistryStorage.ts
import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import { AgentConfig } from "../interfaces";
import { AgentRecord } from "../interfaces/Types";

export class RegistryStorage {
  private db!: Database;

  constructor() {
    this.initializeDb().then(() => console.log("RegistryStorage initialized"));
  }

  private async initializeDb(): Promise<void> {
    this.db = await open({
      filename: "orchestrator.db",
      driver: sqlite3.Database,
    });
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        agent_id TEXT PRIMARY KEY,
        config TEXT NOT NULL,
        creator_user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  async createAgent(agentId: string, config: AgentConfig, creatorUserId: string): Promise<void> {
    await this.db.run(
      "INSERT INTO agents (agent_id, config, creator_user_id, created_at) VALUES (?, ?, ?, ?)",
      [agentId, JSON.stringify(config), creatorUserId, Date.now()]
    );
  }

  async getAgent(agentId: string): Promise<AgentRecord | undefined> {
    const row = await this.db.get(
      "SELECT agent_id, config, creator_user_id, created_at FROM agents WHERE agent_id = ?",
      [agentId]
    );
    if (!row) return undefined;
    return {
      agentId: row.agent_id,
      config: JSON.parse(row.config),
      creatorUserId: row.creator_user_id,
      createdAt: row.created_at,
    };
  }

  async getAllAgents(): Promise<AgentRecord[]> {
    const rows = await this.db.all(
      "SELECT agent_id, config, creator_user_id, created_at FROM agents"
    );
    return rows.map(row => ({
      agentId: row.agent_id,
      config: JSON.parse(row.config),
      creatorUserId: row.creator_user_id,
      createdAt: row.created_at,
    }));
  }

  async updateAgent(agentId: string, config: AgentConfig): Promise<void> {
    await this.db.run(
      "UPDATE agents SET config = ? WHERE agent_id = ?",
      [JSON.stringify(config), agentId]
    );
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.db.run("DELETE FROM agents WHERE agent_id = ?", [agentId]);
  }

  async deleteAllAgents(): Promise<void> {
    await this.db.run("DELETE FROM agents");
  }
}

export const registryStorage = new RegistryStorage();