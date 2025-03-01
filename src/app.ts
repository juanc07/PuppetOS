// Entry point for PuppetOS
import dotenv from 'dotenv';
import { startApiServer } from './server/apiServer';
import { startJobRunner } from './server/jobRunner';
import { PluginManager } from './core/pluginSystem/PluginManager';
import { PlatformManager } from './platforms/PlatformManager';
import { AgentFactory } from './core/AgentFactory';
import { Orchestrator } from "./core/Orchestrator";
import { ActionData, ControlRule } from './interfaces/Types';

// Load environment variables from .env file
dotenv.config();

const globalRules: ControlRule[] = [
    {
        action: "handleInteraction",
        condition: (data: ActionData) => (data.input || "").toLowerCase() === "stop",
        result: "cancel",
    },
];

// Main application class
class PuppetOS {
    private plugins: any[] = []; // Store loaded plugins
    private orchestrator: Orchestrator;

    constructor() {
        this.orchestrator = new Orchestrator(globalRules);
        console.log('Initializing PuppetOS...');
    }

    // Load plugins
    private async loadPlugins() {
        console.log('Loading plugins...');
        const pluginManager = new PluginManager(); // Create an instance
        this.plugins = await pluginManager.loadPlugins();
        console.log(`Loaded ${this.plugins.length} plugins.`);
    }

    // Initialize platform integrations
    private async initializePlatforms() {
        console.log('Initializing platforms...');
        const platformManager = new PlatformManager();
        await platformManager.initializeAll();
        platformManager.registerAllEvents();
        console.log('Platforms initialized.');
    }

    private async setupAgents(): Promise<{ agentId: string; agentId2: string }> {
        const characterEnv = process.env.NODE_ENV || "dev";
        console.log("characterEnv", characterEnv);

        const characterConfigPath = `./config/character.${characterEnv}.json`;
        console.log("characterConfigPath", characterConfigPath);
        const agent = await AgentFactory.createAgent(characterConfigPath);
        const agentId = await this.orchestrator.startAgent(agent);
        console.log("Agent initialized:", agent.getCharacterInfo(), "with ID:", agentId);

        const character2ConfigPath = `./config/character2.${characterEnv}.json`;
        console.log("character2ConfigPath", character2ConfigPath);
        const agent2 = await AgentFactory.createAgent(character2ConfigPath);
        const agentId2 = await this.orchestrator.startAgent(agent2);
        console.log("Agent 2 initialized:", agent2.getCharacterInfo(), "with ID:", agentId2);

        return { agentId, agentId2 };
    }

    private async testAgentsRouteMessage(agentId: string, agentId2: string) {
        const agent = this.orchestrator.getAgent(agentId)!;
        const agent2 = this.orchestrator.getAgent(agentId2)!;

        // Route message tests        
        console.log("(Agent 1) tests:");
        console.log(await this.orchestrator.routeMessage("hello", "user1", "Discord", agentId)); // Blocked
        console.log(await this.orchestrator.routeMessage("I love code", "user1", "Discord", agentId)); // Boosted

        console.log("(Agent 2) tests:");
        console.log(await this.orchestrator.routeMessage("bye", "user2", "Discord", agentId2)); // Blocked
        console.log(await this.orchestrator.routeMessage("I love space", "user2", "Discord", agentId2)); // Boosted

        console.log("Global rule test (both agents):");
        console.log(await this.orchestrator.routeMessage("stop", "user1", "Discord", agentId)); // Blocked globally
        console.log(await this.orchestrator.routeMessage("stop", "user2", "Discord", agentId2)); // Blocked globally

        console.log(await this.orchestrator.routeMessage("shutdown", "user1", "Discord", agentId));
        console.log(await this.orchestrator.routeMessage("hi", "user1", "Discord", agentId));       
    }

    private async testAgentsMemory(agentId: string,agentId2: string) {
        const agent = this.orchestrator.getAgent(agentId)!;
        const agent2 = this.orchestrator.getAgent(agentId2)!;    

        console.log("Agent 1 Knowledge test started");

        console.log("Add Tech Knowledge for user1");
        await agent.addKnowledge("user1_tech", "I love tech")
        console.log("Fetch Blockchain Knowledge for user1:", await agent.getKnowledgeByKey("user1_tech"));

        console.log("Add Tech Knowledge for user1");
        await agent.addKnowledge("user1_blockchain", "I love blockchain")
        console.log("Fetch Blockchain Knowledge for user1:", await agent.getKnowledgeByKey("user1_blockchain"));

        console.log("All Knowledge:", await agent.getKnowledge());

        await agent.clearKnowledge();

        console.log("Tech Knowledge after clear:", await agent.getKnowledgeByKey("user1_tech"));
        console.log("All Knowledge after clear:", await agent.getKnowledge());

        console.log("Agent 2 Knowledge test started");

        console.log("Add MEME Knowledge for user1");
        await agent2.addKnowledge("user2_meme", "I love meme");
        console.log("Fetch MEME Knowledge for user2:", await agent2.getKnowledgeByKey("user2_meme"));

        console.log("Add Solana Knowledge user2");
        await agent2.addKnowledge("user2_solana", "I love solana")
        console.log("Fetch Solana Knowledge for user2:", await agent2.getKnowledgeByKey("user2_solana"));

        console.log("Agent 2 All Knowledge:", await agent2.getKnowledge());

        await agent2.clearKnowledge();

        console.log("Agent2 MEME Knowledge after clear:", await agent2.getKnowledgeByKey("user2_meme"));
        console.log("Agent2 All Knowledge after clear:", await agent2.getKnowledge());
    }

    public async start() {
        console.log("Starting PuppetOS...");

        // Setup phase
        await this.loadPlugins();
        await this.initializePlatforms();

        const { agentId, agentId2 } = await this.setupAgents();
        // Test phase
        //await this.testAgentsRouteMessage(agentId, agentId2);
        //await this.testAgentsMemory(agentId, agentId2);

        await startApiServer(this.orchestrator);
        //await startJobRunner();

        // Runtime phase
        this.orchestrator.run();

        console.log("PuppetOS is up and running!");
    }
}

// Run the application
(async () => {
    const puppetOS = new PuppetOS();
    await puppetOS.start();
})();
