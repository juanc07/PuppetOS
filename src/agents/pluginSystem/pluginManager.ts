import fs from 'fs';
import path from 'path';
import { Plugin } from 'shared-interfaces';
import dotenv from 'dotenv';

// Load environment variables from `.env` file
dotenv.config();

const plugins: Plugin[] = [];

/**
 * Load all plugins from the plugins directory.
 */
export async function loadPlugins(): Promise<Plugin[]> {
    const pluginsDir = path.resolve(process.cwd(), 'plugins');
    console.log(`Discovering plugins in: ${pluginsDir}`);

    if (!fs.existsSync(pluginsDir)) {
        console.warn(`Plugins directory does not exist at: ${pluginsDir}`);
        return [];
    }

    // Determine environment and set the entry point for plugins
    const isDevelopment = process.env.NODE_ENV === 'dev';

    console.log(`PluginManager isDevelopment: ${isDevelopment}`);

    // List all plugin directories
    const pluginFolders = fs.readdirSync(pluginsDir).filter((folder) =>
        fs.statSync(path.join(pluginsDir, folder)).isDirectory()
    );
    console.log(`Found plugin folders: ${pluginFolders.join(', ')}`);

    for (const folder of pluginFolders) {
        const pluginEntry = isDevelopment
            ? path.join(pluginsDir, folder, 'index.ts') // Use TypeScript file in development
            : path.join(pluginsDir, folder, 'dist', 'index.js'); // Use compiled JS in production

        const packageJsonPath = path.join(pluginsDir, folder, 'package.json'); // Plugin metadata

        try {
            // Validate presence of package.json
            if (!fs.existsSync(packageJsonPath)) {
                console.warn(`Skipping ${folder}: Missing package.json`);
                continue;
            }

            // Load plugin metadata
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const { name, version, author, description } = packageJson;

            if (!name || !version || !author) {
                throw new Error(`Invalid package.json for ${folder}: Missing required fields`);
            }

            // Validate plugin entry file
            if (!fs.existsSync(pluginEntry)) {
                console.warn(`Skipping ${folder}: Missing entry file (${pluginEntry})`);
                continue;
            }

            // Dynamically import the plugin
            const pluginModule = require(pluginEntry);
            const plugin: Plugin = pluginModule.default || pluginModule;

            // Ensure the plugin meets required structure
            if (!plugin.initialize) {
                throw new Error(`Invalid plugin at ${pluginEntry}: Missing initialize method.`);
            }

            // Assign metadata to plugin
            plugin.name = name;
            plugin.version = version;
            plugin.author = author;
            plugin.description = description;

            console.log(`Discovered plugin: ${plugin.name}`);
            plugins.push(plugin);
        } catch (error) {
            console.error(`Failed to load plugin from ${folder}:`, error instanceof Error ? error.message : error);
        }
    }

    // Initialize all discovered plugins
    console.log('Initializing plugins...');
    for (const plugin of plugins) {
        try {
            plugin.initialize();
            console.log(`Initialized plugin: ${plugin.name}`);
            plugin.test();
            console.log(`test plugin: ${plugin.name}`);
        } catch (error) {
            console.error(`Error initializing plugin: ${plugin.name}`, error instanceof Error ? error.message : error);
        }
    }

    return plugins;
}
