export interface IMemory {
  setShortTerm(key: string, value: any): void;
  getShortTerm(key: string): any | undefined;
  clearShortTerm(): void;

  setLongTerm(key: string, value: any): Promise<void>;
  getLongTerm(key: string): Promise<any | undefined>;
  deleteLongTerm(key: string): Promise<void>; // New method
  initialize?(): Promise<void>;
}