import fs from 'fs';
import path from 'path';
import { Plugin } from 'shared-interfaces';
import dotenv from 'dotenv';

// Load environment variables from `.env` file
dotenv.config();

const plugins: Plugin[] = [];

export async function loadPlugins(): Promise<Plugin[]> {
    const pluginsDir = path.resolve(process.cwd(), 'plugins');
    console.log(`Discovering plugins in: ${pluginsDir}`);

    if (!fs.existsSync(pluginsDir)) {
        console.warn(`Plugins directory does not exist at: ${pluginsDir}`);
        return [];
    }

    // Determine file extension based on environment
    const isDevelopment = process.env.NODE_ENV === 'dev';
    const fileExtension = isDevelopment ? 'ts' : 'js';

    // List directories inside the plugins folder
    const pluginFolders = fs.readdirSync(pluginsDir).filter((folder) =>
        fs.statSync(path.join(pluginsDir, folder)).isDirectory()
    );

    console.log(`Found plugin folders: ${pluginFolders.join(', ')}`);

    for (const folder of pluginFolders) {
        // Resolve plugin entry point
        const pluginPath = path.join(pluginsDir, folder, `index.${fileExtension}`);
        const packageJsonPath = path.join(pluginsDir, folder, 'package.json');

        try {
            if (!fs.existsSync(packageJsonPath)) {
                console.warn(`Skipping ${folder}: Missing package.json`);
                continue;
            }

            // Load plugin metadata from package.json
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            if (!packageJson.name || !packageJson.version || !packageJson.author) {
                throw new Error(`Invalid package.json for ${folder}: Missing required fields`);
            }

            if (!fs.existsSync(pluginPath)) {
                console.warn(`Skipping ${folder}: Missing entry file (${pluginPath})`);
                continue;
            }

            // Dynamically load the plugin
            const pluginModule = require(pluginPath);
            const plugin: Plugin = pluginModule.default || pluginModule;

            // Validate the plugin structure
            if (!plugin.initialize) {
                throw new Error(`Invalid plugin at ${pluginPath}: Missing initialize method.`);
            }

            // Add metadata from package.json to the plugin
            plugin.name = packageJson.name;
            plugin.version = packageJson.version;
            plugin.author = packageJson.author;
            plugin.description = packageJson.description;

            console.log(`Discovered plugin: ${plugin.name}`);
            plugins.push(plugin);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Failed to load plugin from ${folder}:`, errorMessage);
        }
    }

    // Initialize all loaded plugins
    console.log('Initializing plugins...');
    plugins.forEach((plugin) => {
        try {
            plugin.initialize();
            console.log(`Initialized plugin: ${plugin.name}`);
            plugin.test();
            console.log(`test plugin: ${plugin.name}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error initializing plugin: ${plugin.name}`, errorMessage);
        }
    });

    return plugins;
}
