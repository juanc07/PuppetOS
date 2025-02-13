import { IMemory, IKnowledge, ITrainingSystem, IStateMachine } from "../interfaces";

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from `.env` file
dotenv.config();

// Define the extended character interface
export interface CharacterConfig {
    name: string;
    description: string;
    bio: string;
    mission: string;
    vision: string;
    contact: {
        email: string;
        website: string;
        socials: {
            twitter: string;
            github: string;
            linkedin: string;
        };
    };
    wallets: {
        solana: string;
        ethereum: string;
        bitcoin: string;
    };
    knowledge: {
        type: string;
        data: string[];
    };
    personality: {
        tone: string;
        humor: boolean;
        formality: string;
        preferences: {
            topics: string[];
            languages: string[];
        };
    };
    settings: {
        max_memory_context: number;
        platforms: string[];
    };
}

// AI Agent class
export class Agent {
    private memory: IMemory;
    private knowledge: IKnowledge;
    private trainingSystem: ITrainingSystem;
    private stateMachine: IStateMachine;
    private config: CharacterConfig;

    constructor(
        memory: IMemory,
        knowledge: IKnowledge,
        trainingSystem: ITrainingSystem,
        stateMachine: IStateMachine,
        configPath: string
    ) {
        this.memory = memory;
        this.knowledge = knowledge;
        this.trainingSystem = trainingSystem;
        this.stateMachine = stateMachine;

        const resolvedPath = this.resolveConfigPath(configPath);
        console.log('Resolved Config Path:', resolvedPath);

        // Validate if the file exists before attempting to load it
        if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Configuration file not found at path: ${resolvedPath}`);
        }

        this.config = this.loadConfig(resolvedPath);
        this.initialize();
    }

    // Resolve the path dynamically, handling both `src` and `dist` directories
    private resolveConfigPath(configPath: string): string {
        const isProduction = process.env.NODE_ENV === 'production';
        const baseDir = isProduction
            ? path.resolve(__dirname, '../config') // For production: `dist/config`
            : path.resolve(process.cwd(), 'src/config'); // For development: `src/config`
        return path.resolve(baseDir, path.basename(configPath)); // Use the filename only
    }

    // Load the character configuration
    private loadConfig(configPath: string): CharacterConfig {
        try {
            const data = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to load character configuration:', error);
            throw new Error('Character configuration not found or invalid.');
        }
    }

    // Initialize the AI based on the configuration
    private initialize() {
        console.log(`Initializing AI: ${this.config.name}`);
        console.log(`Description: ${this.config.description}`);
        console.log(`Mission: ${this.config.mission}`);
        console.log(`Vision: ${this.config.vision}`);
        console.log(`Socials: ${JSON.stringify(this.config.contact.socials, null, 2)}`);
        console.log(`Wallets: ${JSON.stringify(this.config.wallets, null, 3)}`);
    }

    // Get responses based on personality and knowledge
    public getResponse(input: string): string {
        const response = this.config.knowledge.data.find((entry) =>
            input.toLowerCase().includes(entry.toLowerCase())
        );
        return response || "I'm not sure about that, but I'm always learning!";
    }

    // Retrieve character-specific information
    public getCharacterInfo(): CharacterConfig {
        return this.config;
    }
}
