export interface Platform {
    name: string;
    initialize(): Promise<void>;
    registerEvents(): void;
}