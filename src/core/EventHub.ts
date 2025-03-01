// eventHub.ts
type EventType = "preAction" | "postAction" | "error";

interface EventPayload {
  agentId: string;
  action: string;
  data?: any;
  timestamp: number;
  priority?: "low" | "medium" | "high";
}

type EventHandler = (payload: EventPayload) => "allow" | "cancel" | "override" | { newData: any };

export class EventHub {
  private listeners: Map<EventType, EventHandler[]> = new Map();

  on(event: EventType, handler: EventHandler): void {
    const handlers = this.listeners.get(event) || [];
    handlers.push(handler);
    this.listeners.set(event, handlers);
  }

  // Updated return type to explicitly include "override"
  async emit(event: EventType, payload: EventPayload): Promise<"allow" | "cancel" | "override" | { newData: any }> {
    console.log(`Event: ${event}`, payload);
    const handlers = this.listeners.get(event) || [];
    if (handlers.length === 0) return "allow";

    const timeout = new Promise<"allow">((resolve) => setTimeout(() => resolve("allow"), 100));
    const results = await Promise.race([Promise.all(handlers.map(h => h(payload))), timeout]);

    // Handle the results
    if (Array.isArray(results)) {
      // Find the first non-"allow" result
      const result = results.find(r => r !== "allow");
      return result !== undefined ? result : "allow";
    }
    // If timeout wins, results is "allow"
    return results;
  }
}

export const eventHub = new EventHub();