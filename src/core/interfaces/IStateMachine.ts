export interface IStateMachine {
    addState(state: { name: string; onEnter?: () => void; onExit?: () => void }): void;
    transitionTo(stateName: string): void;
    getCurrentState(): string | null;
  }
  