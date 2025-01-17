"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Entry point for PuppetOS
const apiServer_1 = require("./server/apiServer");
const jobRunner_1 = require("./server/jobRunner");
const pluginSystem_1 = require("./agents/pluginSystem");
const discord_1 = require("./platforms/discord");
const telegram_1 = require("./platforms/telegram");
// Main application class
class PuppetOS {
    constructor() {
        this.plugins = []; // Store loaded plugins
        console.log('Initializing PuppetOS...');
    }
    // Load plugins
    async loadPlugins() {
        console.log('Loading plugins...');
        this.plugins = await (0, pluginSystem_1.loadPlugins)();
        console.log(`Loaded ${this.plugins.length} plugins.`);
    }
    // Initialize platform integrations
    async initializePlatforms() {
        console.log('Initializing platforms...');
        await (0, discord_1.initializeDiscord)();
        await (0, telegram_1.initializeTelegram)();
        console.log('Platforms initialized.');
    }
    // Start the application
    async start() {
        console.log('Starting PuppetOS...');
        await this.loadPlugins();
        await this.initializePlatforms();
        // Start API server
        await (0, apiServer_1.startApiServer)();
        // Start Job Runner
        await (0, jobRunner_1.startJobRunner)();
        console.log('PuppetOS is up and running!');
    }
}
// Run the application
(async () => {
    const puppetOS = new PuppetOS();
    await puppetOS.start();
})();
//# sourceMappingURL=app.js.map