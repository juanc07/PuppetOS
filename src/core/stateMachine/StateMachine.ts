export interface State {
    name: string;
    onEnter?: () => void;
    onExit?: () => void;
}

export class StateMachine {
    private currentState: State | null;
    private states: Map<string, State>;

    constructor(initialStateName: string) {
        this.states = new Map();
        this.currentState = null;

        // Set an initial state
        if (initialStateName) {
            this.addState({ name: initialStateName });
            this.transitionTo(initialStateName);
        }
    }

    // Add a new state to the state machine
    public addState(state: State): void {
        if (this.states.has(state.name)) {
            throw new Error(`State '${state.name}' already exists.`);
        }
        this.states.set(state.name, state);
    }

    // Transition to a new state
    public transitionTo(stateName: string): void {
        const newState = this.states.get(stateName);
        if (!newState) {
            throw new Error(`State '${stateName}' does not exist.`);
        }

        // Exit the current state
        if (this.currentState && this.currentState.onExit) {
            this.currentState.onExit();
        }

        // Enter the new state
        this.currentState = newState;
        console.log(`Transitioned to state: ${this.currentState.name}`);
        if (this.currentState.onEnter) {
            this.currentState.onEnter();
        }
    }

    // Get the current state
    public getCurrentState(): string | null {
        return this.currentState ? this.currentState.name : null;
    }
}