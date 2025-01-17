// Entry point for PuppetOS
import { startApiServer } from './server/apiServer';
import { startJobRunner } from './server/jobRunner';
import { loadPlugins } from './agents/pluginSystem';
import { initializeDiscord } from './platforms/discord';
import { initializeTelegram } from './platforms/telegram';

// Main application class
class PuppetOS {
    private plugins: any[] = []; // Store loaded plugins

    constructor() {
        console.log('Initializing PuppetOS...');
    }

    // Load plugins
    private async loadPlugins() {
        console.log('Loading plugins...');
        this.plugins = await loadPlugins();
        console.log(`Loaded ${this.plugins.length} plugins.`);
    }

    // Initialize platform integrations
    private async initializePlatforms() {
        console.log('Initializing platforms...');
        await initializeDiscord();
        await initializeTelegram();
        console.log('Platforms initialized.');
    }

    // Start the application
    public async start() {
        console.log('Starting PuppetOS...');
        await this.loadPlugins();
        await this.initializePlatforms();

        // Start API server
        await startApiServer();

        // Start Job Runner
        await startJobRunner();

        console.log('PuppetOS is up and running!');
    }
}

// Run the application
(async () => {
    const puppetOS = new PuppetOS();
    await puppetOS.start();
})();
