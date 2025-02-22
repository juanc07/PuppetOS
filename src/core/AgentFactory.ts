import { Agent } from './Agent';
import { SimpleMemory } from './memory/SimpleMemory';
import { DefaultKnowledge } from './knowledge/DefaultKnowledge';
import { TrainingSystem } from './trainingSystem/TrainingSystem';
import { DefaultStateManager } from './stateManager/DefaultStateManager';
import { InfluencerLogger } from './logger/InfluencerLogger';
import { AgentConfig } from "../interfaces";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from `.env` file
dotenv.config();


export class AgentFactory {
    static async  createAgent(configPath: string): Promise<Agent> {
        const resolvedPath = this.resolveConfigPath(configPath);
        console.log('Resolved Config Path:', resolvedPath);

        // Validate if the file exists before attempting to load it
        if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Configuration file not found at path: ${resolvedPath}`);
        }

        const config = this.loadConfig(resolvedPath);

        const memory = new SimpleMemory();        
        const trainingSystem = new TrainingSystem();
        const stateMachine = new DefaultStateManager(memory, config);
        const influencerLogger = await InfluencerLogger.create(memory);
        const knowledge = new DefaultKnowledge(memory,influencerLogger);

        return new Agent(memory, knowledge, trainingSystem, stateMachine,influencerLogger, config);
    }

    // Resolve the path dynamically, handling both `src` and `dist` directories
    private static resolveConfigPath(configPath: string): string {
        const isProduction = process.env.NODE_ENV === 'production';
        const baseDir = isProduction
            ? path.resolve(__dirname, '../config') // For production: `dist/config`
            : path.resolve(process.cwd(), 'src/config'); // For development: `src/config`
        return path.resolve(baseDir, path.basename(configPath)); // Use the filename only
    }

    // Load the character configuration
    private static loadConfig(configPath: string): AgentConfig {
        try {
            const data = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to load character configuration:', error);
            throw new Error('Character configuration not found or invalid.');
        }
    }
}
