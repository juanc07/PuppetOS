import { Plugin } from './pluginInterface';

const plugins: Plugin[] = [];

export async function loadPlugins(): Promise<Plugin[]> {
    console.log('Discovering plugins...');
    // Simulate plugin discovery (replace with actual logic for loading plugins)
    plugins.push({
        name: 'Sample Plugin',
        description: 'An example plugin for PuppetOS.',
        initialize: () => console.log('Sample Plugin initialized'),
    });

    plugins.forEach(plugin => plugin.initialize());
    return plugins;
}
