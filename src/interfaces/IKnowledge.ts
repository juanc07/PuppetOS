export interface IKnowledge {
    addKnowledge(key: string, value: string): void;
    getKnowledge(key: string): string | undefined;
    removeKnowledge(key: string): void;
    listKnowledge(): { key: string; value: string }[];
  }
  