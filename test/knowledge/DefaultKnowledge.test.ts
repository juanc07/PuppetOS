import { DefaultKnowledge } from "../../src/core/knowledge/DefaultKnowledge";
import { IMemory } from "../../src/interfaces/IMemory";
import { IInteractionLogger } from "../../src/interfaces/IInteractionLogger";

const mockMemory: IMemory = {
  setShortTerm: jest.fn(),
  getShortTerm: jest.fn(),
  clearShortTerm: jest.fn(),
  setLongTerm: jest.fn(),
  getLongTerm: jest.fn(),
  deleteLongTerm: jest.fn(),
};

const mockLogger: IInteractionLogger = {
  logInteraction: jest.fn(),
};

describe("DefaultKnowledge", () => {
  let knowledge: DefaultKnowledge;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockMemory.getLongTerm as jest.Mock).mockImplementation(async (key) => {
      if (key === "interactions_user1") {
        return [
          { input: "I love tech", response: "Cool!" },
          { input: "Tech is awesome", response: "Agreed!" },
        ];
      }
      return undefined;
    });
    knowledge = new DefaultKnowledge(mockMemory, mockLogger);
  });

  test("addKnowledge and getKnowledgeByKey", async () => {
    await knowledge.addKnowledge("user1_tech", "User likes tech");
    expect(mockMemory.setLongTerm).toHaveBeenCalledWith(
      "knowledge_user1_tech",
      [{ text: "User likes tech", timestamp: expect.any(String) }]
    );

    (mockMemory.getLongTerm as jest.Mock).mockResolvedValueOnce([
      { text: "User likes tech", timestamp: "2023-01-01" },
    ]);
    const result = await knowledge.getKnowledgeByKey("user1_tech");
    expect(result).toEqual(["User likes tech"]);
  });

  test("getKnowledge", async () => {
    (mockMemory.getLongTerm as jest.Mock)
      .mockResolvedValueOnce(["knowledge_user1_tech"])
      .mockResolvedValueOnce([{ text: "User likes tech", timestamp: "2023-01-01" }]);
    const result = await knowledge.getKnowledge();
    expect(result).toEqual(["User likes tech"]);
  });

  test("evolvePersonality - friendly", async () => {
    const result = await knowledge.evolvePersonality();
    expect(result).toEqual({ tone: "friendly", catchphrase: "You’re all awesome!" });
  });

  test("clearKnowledge", async () => {
    (mockMemory.getLongTerm as jest.Mock).mockResolvedValueOnce(["knowledge_user1_tech"]);
    await knowledge.clearKnowledge();
    expect(mockMemory.deleteLongTerm).toHaveBeenCalledWith("knowledge_user1_tech");
    expect(mockMemory.deleteLongTerm).toHaveBeenCalledWith("knowledge_keys");
  });
});