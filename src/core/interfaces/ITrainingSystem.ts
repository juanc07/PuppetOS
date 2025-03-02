export interface ITrainingSystem {
    addTrainingData(data: { input: string; output: string }): void;
    getResponse(input: string): string | null;
    removeTrainingData(input: string): void;
    listTrainingData(): { input: string; output: string }[];
  }
  