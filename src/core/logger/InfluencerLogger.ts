import { pipeline } from "@xenova/transformers";
import { IMemory } from "src/interfaces/IMemory";
import { IInteractionLogger } from "src/interfaces/IInteractionLogger";

export class InfluencerLogger implements IInteractionLogger {
  private memory: IMemory;
  private embedder: any;

  private constructor(memory: IMemory) {
    this.memory = memory;
    // Don't call initEmbedder here; handled in create
  }

  static async create(memory: IMemory): Promise<InfluencerLogger> {
    const logger = new InfluencerLogger(memory);
    await logger.initEmbedder(); // Wait for embedder to be ready
    return logger;
  }

  private async initEmbedder() {
    this.embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  async logInteraction(userId: string, platform: string, input: string, response: string) {
    const embedding = await this.embedder(input, { pooling: "mean", normalize: true });
    const logEntry = {
      userId,
      platform,
      input,
      response,
      embedding: Buffer.from(embedding.data).toString("base64"),
      timestamp: new Date().toISOString(),
    };
    const existingLogs = (await this.memory.getLongTerm(`interactions_${userId}`)) || [];
    await this.memory.setLongTerm(`interactions_${userId}`, [...existingLogs, logEntry]);
  }
}