// src/rules.ts
import { ActionData, ControlRule } from "src/interfaces/Types";

export const ruleSets: Record<string, ControlRule> = {
  // For Agent 1 (Zeek)
  "helloBlock": {
    action: "handleInteraction",
    condition: (data: ActionData) => (data.input || "").toLowerCase() === "hello",
    result: "cancel",
  },
  "codeBoost": {
    action: "handleInteraction",
    condition: (data: ActionData) => (data.input || "").toLowerCase().includes("code"),
    result: (data: ActionData) => ({
      newData: {
        input: "Coding is my jam!",
        userId: data.userId,
        platform: data.platform,
      },
    }),
  },
  // For Agent 2 (Luna)
  "byeBlock": {
    action: "handleInteraction",
    condition: (data: ActionData) => (data.input || "").toLowerCase() === "bye",
    result: "cancel",
  },
  "spaceBoost": {
    action: "handleInteraction",
    condition: (data: ActionData) => (data.input || "").toLowerCase().includes("space"),
    result: (data: ActionData) => ({
      newData: {
        input: "Space is out of this world!",
        userId: data.userId,
        platform: data.platform,
      },
    }),
  },
};