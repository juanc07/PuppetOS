export interface AgentConfig {
    name: string;
    id: string;
    description: string;
    bio: string;
    mission: string;
    vision: string;
    contact: {
      email: string;
      website: string;
      socials: { twitter: string; github: string; linkedin: string };
    };
    wallets: { solana: string; ethereum: string; bitcoin: string };
    knowledge: { type: string; data: string[] };
    personality: {
      tone: "friendly" | "sassy" | "formal" | "casual";
      humor: boolean;
      formality: "casual" | "formal";
      catchphrase?: string;
      preferences: { topics: string[]; languages: string[] };
    };
    settings: { max_memory_context: number; platforms: string[] };
    ruleIds?: string[];
  } 