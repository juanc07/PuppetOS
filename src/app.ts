// Entry point for PuppetOS
import dotenv from 'dotenv';
import { startApiServer } from './server/apiServer';
import { startJobRunner } from './server/jobRunner';
import { PluginManager } from './core/pluginSystem/PluginManager';
import { PlatformManager } from './platforms/PlatformManager';
import { AgentFactory } from './core/AgentFactory';

// Load environment variables from .env file
dotenv.config();

// Main application class
class PuppetOS {
    private plugins: any[] = []; // Store loaded plugins

    constructor() {
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

    // Start the application
    public async start() {
        console.log('Starting PuppetOS...');
        await this.loadPlugins();
        await this.initializePlatforms();

        // load the character json file for dev or prod
        const characterEnv = process.env.NODE_ENV || 'dev';
        console.log('characterEnv', characterEnv);

        // test creating 1st agent
        const characterConfigPath = `./config/character.${characterEnv}.json`;
        console.log('characterConfigPath', characterConfigPath);
        const agent = await AgentFactory.createAgent(characterConfigPath);
        console.log('Agent initialized:', agent.getCharacterInfo());


        // test creating 2nd agent
        const character2ConfigPath = `./config/character2.${characterEnv}.json`;
        console.log('character2ConfigPath', character2ConfigPath);
        const agent2 = await AgentFactory.createAgent(character2ConfigPath);
        console.log('Agent 2 initialized:', agent2.getCharacterInfo());

        // Start API server
        await startApiServer();

        // Start Job Runner
        await startJobRunner();

        console.log('PuppetOS is up and running!');

        console.log("knowledge test started");

        console.log(await agent.handleInteraction("user1", "Discord", "I love tech"));
        console.log("Tech Knowledge for user1:", await agent.getKnowledgeByKey("user1_tech"));
        console.log("Blockchain Knowledge for user1:", await agent.getKnowledgeByKey("user1_blockchain"));

        await agent.handleInteraction("user1", "Discord", "I love blockchain");
        console.log("Updated Tech Knowledge for user1:", await agent.getKnowledgeByKey("user1_tech"));
        console.log("Updated Blockchain Knowledge for user1:", await agent.getKnowledgeByKey("user1_blockchain"));

        console.log("All Knowledge:", await agent.getKnowledge());

        await agent.clearKnowledge();
        console.log("Tech Knowledge after clear:", await agent.getKnowledgeByKey("user1_tech"));
        console.log("All Knowledge after clear:", await agent.clearKnowledge());
    }
}

// Run the application
(async () => {
    const puppetOS = new PuppetOS();
    await puppetOS.start();
})();
