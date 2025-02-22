import { InfluencerMemory } from "../../src/core/memory/InfluencerMemory"; // Keep as-is for now

describe("InfluencerMemory", () => {
  let memory: InfluencerMemory;

  beforeEach(async () => {
    memory = new InfluencerMemory(":memory:"); // In-memory SQLite
    await (memory as any).initialize(); // Call private initialize method
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      (memory as any).db.close((err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  test("setShortTerm and getShortTerm", () => {
    memory.setShortTerm("key1", "value1");
    expect(memory.getShortTerm("key1")).toBe("value1");
    expect(memory.getShortTerm("key2")).toBeUndefined();
  });

  test("clearShortTerm", () => {
    memory.setShortTerm("key1", "value1");
    memory.clearShortTerm();
    expect(memory.getShortTerm("key1")).toBeUndefined();
  });

  test("setLongTerm and getLongTerm", async () => {
    await memory.setLongTerm("key1", { data: "value1" });
    const result = await memory.getLongTerm("key1");
    expect(result).toEqual({ data: "value1" });
  });

  test("deleteLongTerm", async () => {
    await memory.setLongTerm("key1", { data: "value1" });
    await memory.deleteLongTerm("key1");
    const result = await memory.getLongTerm("key1");
    expect(result).toBeUndefined();
  });
});