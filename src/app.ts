// Entry point for PuppetOS
import dotenv from 'dotenv';
import { startApiServer } from './server/apiServer';
import { startJobRunner } from './server/jobRunner';
import { PluginManager } from './core/pluginSystem/PluginManager';
import { PlatformManager } from './platforms/PlatformManager';
import { AgentFactory } from './core/AgentFactory';
import { Orchestrator } from "./core/Orchestrator";

// Load environment variables from .env file
dotenv.config();

// Main application class
class PuppetOS {
    private plugins: any[] = []; // Store loaded plugins
    private orchestrator: Orchestrator;

    constructor() {
        this.orchestrator = new Orchestrator();
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

    private async testAgents(agentId: string) {
        const agent = this.orchestrator.getAgent(agentId)!;
        console.log("Knowledge test started");

        console.log(await this.orchestrator.routeMessage("I love tech", agentId));
        console.log("Tech Knowledge for user1:", await agent.getKnowledgeByKey("user1_tech"));
        console.log("Blockchain Knowledge for user1:", await agent.getKnowledgeByKey("user1_blockchain"));

        console.log(await this.orchestrator.routeMessage("I love blockchain", agentId));
        console.log("Updated Tech Knowledge for user1:", await agent.getKnowledgeByKey("user1_tech"));
        console.log("Updated Blockchain Knowledge for user1:", await agent.getKnowledgeByKey("user1_blockchain"));

        console.log("All Knowledge:", await agent.getKnowledge());

        await agent.clearKnowledge();
        console.log("Tech Knowledge after clear:", await agent.getKnowledgeByKey("user1_tech"));
        console.log("All Knowledge after clear:", await agent.getKnowledge());
    }

    public async start() {
        console.log("Starting PuppetOS...");

        // Setup phase
        await this.loadPlugins();
        await this.initializePlatforms();
        const { agentId } = await this.setupAgents();
        await startApiServer();
        await startJobRunner();

        console.log("PuppetOS is up and running!");

        // Test phase
        await this.testAgents(agentId);

        // Runtime phase
        this.orchestrator.run();
    }
}

// Run the application
(async () => {
    const puppetOS = new PuppetOS();
    await puppetOS.start();
})();
