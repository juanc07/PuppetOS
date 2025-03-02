export interface IInteractionLogger {
    logInteraction(userId: string, platform: string, input: string, response: string): Promise<void>;
}