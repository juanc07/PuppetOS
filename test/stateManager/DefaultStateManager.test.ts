import { DefaultStateManager } from "../../src/core/stateManager/DefaultStateManager";
import { IMemory } from "../../src/core/interfaces/IMemory";
import { AgentConfig } from "../../src/core/interfaces/AgentConfig";

const mockMemory: IMemory = {
  setShortTerm: jest.fn(),
  getShortTerm: jest.fn(),
  clearShortTerm: jest.fn(),
  setLongTerm: jest.fn(),
  getLongTerm: jest.fn(),
  deleteLongTerm: jest.fn(),
};

const mockConfig: AgentConfig = {
  name: "PuppetOS",
  id: "1",
  description: "Test AI",
  bio: "I’m a test bot!",
  mission: "To test well",
  vision: "Be a great test",
  contact: { email: "", website: "", socials: { twitter: "", github: "", linkedin: "" } },
  wallets: { solana: "", ethereum: "", bitcoin: "" },
  knowledge: { type: "custom", data: ["I’m a test fact"] },
  personality: {
    tone: "friendly",
    humor: true,
    formality: "casual",
    preferences: { topics: ["tech"], languages: ["English"] },
  },
  settings: { max_memory_context: 10, platforms: ["discord"] },
};

describe("DefaultStateManager", () => {
  let stateManager: DefaultStateManager;

  beforeEach(() => {
    jest.clearAllMocks();
    stateManager = new DefaultStateManager(mockMemory, mockConfig);
  });

  test("getUserAffinity", async () => {
    (mockMemory.getLongTerm as jest.Mock).mockResolvedValueOnce({ affinityScore: 6 });
    const affinity = await stateManager.getUserAffinity("user1");
    expect(affinity).toBe("love");
  });

  test("getMood", () => {
    const mood = stateManager.getMood();
    expect(mood).toBe("happy"); // "friendly" maps to "happy"
  });

  test("isTalkative", () => {
    const talkative = stateManager.isTalkative();
    expect(talkative).toBe(true); // humor: true
  });

  test("isOpenToTopic", () => {
    expect(stateManager.isOpenToTopic("tech")).toBe(true);
    expect(stateManager.isOpenToTopic("sports")).toBe(false);
  });

  test("updateStates", async () => {
    await stateManager.updateStates("I love tech", "user1");
    expect(mockMemory.setLongTerm).toHaveBeenCalledWith(
      "user1",
      expect.objectContaining({ affinityScore: 1, lastInput: "I love tech" })
    );
  });

  test("getIdentity", () => {
    const identity = stateManager.getIdentity();
    expect(identity).toEqual({ name: "PuppetOS", bio: "I’m a test bot!", mission: "To test well" });
  });

  test("getKnowledge", () => {
    const knowledge = stateManager.getKnowledge();
    expect(knowledge).toEqual(["I’m a test fact"]);
  });
});