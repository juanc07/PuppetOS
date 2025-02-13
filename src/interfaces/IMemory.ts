export interface IMemory {
    setShortTerm(key: string, value: any): void;
    getShortTerm(key: string): any | undefined;
    clearShortTerm(): void;
  
    setLongTerm(key: string, value: any): void;
    getLongTerm(key: string): any | undefined;
    removeLongTerm(key: string): void;
  }
  