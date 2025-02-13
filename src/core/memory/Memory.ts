import { IMemory } from "src/interfaces";

export class Memory implements IMemory {
    private shortTermMemory: Map<string, any>;
    private longTermMemory: Map<string, any>;
  
    constructor() {
      this.shortTermMemory = new Map();
      this.longTermMemory = new Map();
    }
  
    // Short-term memory methods
    setShortTerm(key: string, value: any): void {
      this.shortTermMemory.set(key, value);
    }
  
    getShortTerm(key: string): any | undefined {
      return this.shortTermMemory.get(key);
    }
  
    clearShortTerm(): void {
      this.shortTermMemory.clear();
    }
  
    // Long-term memory methods
    setLongTerm(key: string, value: any): void {
      this.longTermMemory.set(key, value);
    }
  
    getLongTerm(key: string): any | undefined {
      return this.longTermMemory.get(key);
    }
  
    removeLongTerm(key: string): void {
      this.longTermMemory.delete(key);
    }
  }
  