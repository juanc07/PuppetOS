// server/routes/agentRoutes.ts
import { Express, Request, Response } from "express";
import { Orchestrator } from "../../core/Orchestrator";
import { ActionData, ControlRule } from "src/interfaces/Types";

interface AddRuleRequestBody {
  action: string;
  condition: string;
  result: string | { newData: ActionData } | string;
}

interface InteractRequestBody {
  message: string;
}

export function setupAgentRoutes(app: Express, orchestrator: Orchestrator): void {
  app.post("/agents/:agentId/add-rule", (req: Request, res: Response) => {
    console.log("Received request for /agents/:agentId/add-rule");
    console.log("Headers:", req.headers); // Log headers to check Content-Type
    console.log("Raw body:", req.body); // Log raw body

    const { agentId } = req.params as { agentId: string };
    const { action, condition, result } = req.body as AddRuleRequestBody;

    console.log("Parsed fields - action:", action, "condition:", condition, "result:", result);

    if (!orchestrator.getAgent(agentId)) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    try {
      if (!action || !condition || typeof result === "undefined") { // Explicitly check undefined
        throw new Error("Missing required fields: action, condition, or result");
      }

      const conditionFn = new Function("data", `return ${condition}`) as (data: ActionData) => boolean;
      let resultValue: ControlRule["result"];

      console.log("Processing result:", result);
      if (typeof result === "string" && ["allow", "cancel", "override"].includes(result.toLowerCase())) {
        resultValue = result.toLowerCase() as "allow" | "cancel" | "override";
      } else if (typeof result === "object" && result.newData) {
        resultValue = { newData: result.newData as ActionData };
      } else if (typeof result === "string" && result.startsWith("data =>")) {
        resultValue = new Function("data", `return ${result}`) as (data: ActionData) => "allow" | "cancel" | "override" | { newData: ActionData };
      } else {
        throw new Error(`Invalid result format: ${JSON.stringify(result)}`);
      }

      const rule: ControlRule = { action, condition: conditionFn, result: resultValue };
      orchestrator.addAgentRule(agentId, rule);
      res.json({ success: true, message: `Rule added to agent ${agentId}` });
    } catch (error) {
      res.status(400).json({ success: false, message: `Invalid rule format: ${(error as Error).message}` });
    }
  });

  app.post("/api/agents/interact", (req: Request, res: Response) => {
    const { message } = req.body as InteractRequestBody;
    res.json({ reply: `Agent received: ${message}` });
  });

  app.post("/api/agents/train", (req: Request, res: Response) => {
    res.status(200).send("Agent training started.");
  });

  app.get("/api/agents/test", (req: Request, res: Response) => {
    res.status(200).send("Agent test hit.");
  });
}