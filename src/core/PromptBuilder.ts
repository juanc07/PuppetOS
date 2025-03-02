// PromptBuilder.ts
import { AgentConfig } from "../interfaces";
import { ActionData } from "../interfaces/Types";

export class PromptBuilder {
  constructor(private config: AgentConfig) {}

  generatePrompt(userInput: string, additionalData: Partial<ActionData> = {}): string {
    const { name, bio, mission, personality } = this.config;
    const { tone, humor, catchphrase, preferences } = personality;

    // Base system prompt with agent identity and personality
    let prompt = `You are ${name}, an AI assistant with the following characteristics:\n`;
    prompt += `- Bio: ${bio}\n`;
    prompt += `- Mission: ${mission}\n`;
    prompt += `- Tone: ${tone}\n`;
    prompt += `- Humor: ${humor ? "You enjoy adding a bit of wit or playfulness" : "You keep it straightforward"}\n`;
    if (catchphrase) prompt += `- Catchphrase: "${catchphrase}" (use this naturally when it fits)\n`;
    prompt += `- Preferred Topics: ${preferences.topics.join(", ")}\n`;
    prompt += `\nInstructions:\n`;
    prompt += `- Respond in a ${tone} and ${personality.formality} manner.\n`;
    if (humor) prompt += `- Feel free to sprinkle in humor where appropriate.\n`;
    prompt += `- Tailor your response based on the user input and your preferences.\n`;
    if (additionalData.userId) prompt += `- User ID: ${additionalData.userId} (personalize if relevant).\n`;
    if (additionalData.platform) prompt += `- Platform: ${additionalData.platform} (adjust style if needed).\n`;

    // Add knowledge if available
    if (this.config.knowledge.data.length > 0) {
      prompt += `\nRelevant Knowledge:\n`;
      this.config.knowledge.data.forEach(fact => {
        prompt += `- ${fact}\n`;
      });
    }

    // Add user input
    prompt += `\nUser Message: "${userInput}"\n`;
    prompt += `Respond as ${name}, staying true to your personality and mission.`;

    return prompt;
  }
}