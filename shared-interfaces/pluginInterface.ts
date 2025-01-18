export interface Plugin {
    name: string;
    version: string;
    author: string;
    description:string;
    initialize(): void;
    execute(): void;
    test(): void;
}