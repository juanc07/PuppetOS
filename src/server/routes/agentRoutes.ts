import { Express, Request, Response } from "express";
import { Orchestrator } from "../../core/Orchestrator";
import { ActionData, ControlRule } from "src/interfaces/Types";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AddRuleRequestBody {
  action: string;
  condition: string;
  result: string | { newData: ActionData } | string;
}

interface InteractRequestBody {
  message: string;
  agentId: string;
}

class AgentRoutes {
  private orchestrator: Orchestrator;

  constructor(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator;
  }

  public setup(app: Express): void {
    app.post("/agents/:agentId/add-rule", this.addRule.bind(this));
    app.post("/api/agents/interact", this.interact.bind(this));
    app.post("/api/agents/train", this.train.bind(this));
    app.get("/api/agents/test", this.test.bind(this));
    app.get("/api/agents/getAgentIds", this.getAgentIds.bind(this));
  }

  private addRule(req: Request, res: Response): void {
    console.log("Received request for /agents/:agentId/add-rule");
    console.log("Headers:", req.headers);
    console.log("Raw body:", req.body);

    const { agentId } = req.params as { agentId: string };
    const { action, condition, result } = req.body as AddRuleRequestBody;

    if (!this.orchestrator.getAgent(agentId)) {
      res.status(404).json({ success: false, message: "Agent not found" });
      return;
    }

    try {
      if (!action || !condition || typeof result === "undefined") {
        throw new Error("Missing required fields: action, condition, or result");
      }

      const conditionFn = new Function("data", `return ${condition}`) as (data: ActionData) => boolean;
      let resultValue: ControlRule["result"];

      if (typeof result === "string" && ["allow", "cancel", "override"].includes(result.toLowerCase())) {
        resultValue = result.toLowerCase() as "allow" | "cancel" | "override";
      } else if (typeof result === "object" && result.newData) {
        resultValue = { newData: result.newData as ActionData };
      } else if (typeof result === "string" && result.startsWith("data =>")) {
        resultValue = new Function("data", `return ${result}`) as (data: ActionData) => "allow" | "cancel" | "override" | { newData: ActionData };
      } else {
        throw new Error(`Invalid result format: ${JSON.stringify(result)}`);
      }

      this.orchestrator.addAgentRule(agentId, { action, condition: conditionFn, result: resultValue });
      res.json({ success: true, message: `Rule added to agent ${agentId}` });
    } catch (error) {
      res.status(400).json({ success: false, message: `Invalid rule format: ${(error as Error).message}` });
    }
  }

  private async interact(req: Request, res: Response): Promise<void> {
    try {
      const { message, agentId } = req.body as InteractRequestBody;
      console.log("check agentId: ", agentId);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: message }],
      });
      
      const reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      res.json({ reply });
    } catch (error) {
      res.status(500).json({ success: false, message: `Error interacting with OpenAI: ${(error as Error).message}` });
    }
  }

  private train(req: Request, res: Response): void {
    res.status(200).send("Agent training started.");
  }

  private test(req: Request, res: Response): void {
    res.status(200).send("Agent test hit.");
  }

  private getAgentIds(req: Request, res: Response): void {
    try {
      const agentInfo = this.orchestrator.getAgentIds();
      res.status(200).json({ agentInfo });
    } catch (error) {
      res.status(500).json({ success: false, message: `Error retrieving agent IDs: ${(error as Error).message}` });
    }
  }
}

export function setupAgentRoutes(app: Express, orchestrator: Orchestrator): void {
  const agentRoutes = new AgentRoutes(orchestrator);
  agentRoutes.setup(app);
}
