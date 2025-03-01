import { IMemory,IInteractionLogger,IKnowledge } from "../../interfaces";

export class DefaultKnowledge implements IKnowledge {
    private memory: IMemory;
    private logger: IInteractionLogger;

    constructor(memory: IMemory, logger: IInteractionLogger) {
        this.memory = memory;
        this.logger = logger;
    }

    async addKnowledge(key: string, data: string) {
        const fullKey = `knowledge_${key}`;
        const current = (await this.memory.getLongTerm(fullKey)) || [];
        await this.memory.setLongTerm(fullKey, [
            ...current,
            { text: data, timestamp: new Date().toISOString() },
        ]);

        // Update the list of knowledge keys
        const keys = (await this.memory.getLongTerm("knowledge_keys")) || [];
        if (!keys.includes(fullKey)) {
            await this.memory.setLongTerm("knowledge_keys", [...keys, fullKey]);
        }
    }

    async getKnowledge() {
        const keys = await this.getAllKnowledgeKeys();
        const allKnowledge = [];
        for (const key of keys) {
            const items = (await this.memory.getLongTerm(key)) || [];
            allKnowledge.push(...items.map((item: any) => item.text));
        }
        return allKnowledge;
    }

    async getKnowledgeByKey(key: string) {
        const stored = (await this.memory.getLongTerm(`knowledge_${key}`)) || [];
        return stored.map((item: any) => item.text);
    }

    async evolvePersonality() {
        const interactions = (await this.memory.getLongTerm("interactions_user1")) || [];
        let positiveCount = 0;
        let negativeCount = 0;

        for (const interaction of interactions) {
            const input = interaction.input.toLowerCase();
            if (input.includes("love") || input.includes("great") || input.includes("awesome")) {
                positiveCount++;
            }
            if (input.includes("hate") || input.includes("bad") || input.includes("sucks")) {
                negativeCount++;
            }
        }

        if (positiveCount >= negativeCount + 2) { // Changed from > to >=
            return { tone: "friendly" as const, catchphrase: "You’re all awesome!" };
        } else if (negativeCount > positiveCount + 2) {
            return { tone: "sassy" as const, catchphrase: "Deal with it!" };
        } else {
            return { tone: "casual" as const };
        }
    }

    async clearKnowledge() {
        const keys = await this.getAllKnowledgeKeys();
        for (const key of keys) {
            await this.memory.deleteLongTerm(key);
        }
        await this.memory.deleteLongTerm("knowledge_keys"); // Clear the key list too
    }

    private async getAllKnowledgeKeys(): Promise<string[]> {
        const keys = (await this.memory.getLongTerm("knowledge_keys")) || [];
        return keys;
    }
}