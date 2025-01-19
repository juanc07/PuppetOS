import { Agent } from './Agent';
import { Memory } from './memory/Memory';
import { Knowledge } from './knowledge/Knowledge';
import { TrainingSystem } from './trainingSystem/TrainingSystem';
import { StateMachine } from './stateMachine/StateMachine';

export class AgentFactory {
    static createAgent(configPath: string): Agent {
        const memory = new Memory();
        const knowledge = new Knowledge();
        const trainingSystem = new TrainingSystem();
        const stateMachine = new StateMachine('idle');

        return new Agent(memory, knowledge, trainingSystem, stateMachine, configPath);
    }
}
