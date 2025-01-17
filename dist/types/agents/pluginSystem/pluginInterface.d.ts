export interface Plugin {
    name: string;
    description: string;
    initialize: () => void;
}
