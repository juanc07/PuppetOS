export type TrainingData = {
    input: string;
    output: string;
  };
  
  export class TrainingSystem {
    private trainingData: TrainingData[];
  
    constructor() {
      this.trainingData = [];
    }
  
    // Add training data
    addTrainingData(data: TrainingData): void {
      this.trainingData.push(data);
    }
  
    // Find response for input
    getResponse(input: string): string | null {
      const match = this.trainingData.find((data) => data.input === input);
      return match ? match.output : null;
    }
  
    // Remove training data
    removeTrainingData(input: string): void {
      this.trainingData = this.trainingData.filter((data) => data.input !== input);
    }
  
    // List all training data
    listTrainingData(): TrainingData[] {
      return [...this.trainingData];
    }
  }
  