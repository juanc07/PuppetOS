export interface ActionData {
    input?: string;
    userId: string;
    platform: string;
    error?: string;
    response?: string;
    [key: string]: any;
  }
  
  export interface EventPayload {
    agentId: string;
    action: string;
    data: ActionData;
    timestamp: number;
    priority?: "low" | "medium" | "high";
  }
  
  export interface ControlRule {
    action: string;
    condition: (data: ActionData) => boolean;
    result: "allow" | "cancel" | "override" | { newData: ActionData } | ((data: ActionData) => "allow" | "cancel" | "override" | { newData: ActionData });
  }