import { Express, Request, Response } from "express";
import { Orchestrator } from "../../core/Orchestrator";
import { ActionData, ControlRule } from "src/interfaces/Types";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { AgentRegistry } from "../../core/AgentRegistry";
import { registryStorage } from "../../storage/RegistryStorage";
import { AgentConfig } from "../../interfaces";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const agentRegistry = new AgentRegistry(registryStorage);

interface AddRuleRequestBody {
  action: string;
  condition: string;
  result: string | { newData: ActionData } | string;
}

interface InteractRequestBody {
  message: string;
  agentId: string;
  userId: string;
}

interface CreateAgentRequestBody {
  config: AgentConfig;
  creatorUserId: string;
}

interface UpdateAgentRequestBody {
  config: Partial<AgentConfig>;
}

class AgentRoutes {
  private orchestrator: Orchestrator;

  constructor(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator;
  }

  public setup(app: Express): void {
    app.post("/agents/:agentId/add-rule", this.addRule.bind(this));
    app.post("/api/agents/interact", this.interact.bind(this));
    app.post("/api/agents/interact-stream", this.interactStream.bind(this)); // New streaming endpoint
    app.post("/api/agents/train", this.train.bind(this));
    app.get("/api/agents/test", this.test.bind(this));
    app.get("/api/agents/getAgentIds", this.getAgentIds.bind(this));

    // AgentRegistry routes
    app.post("/api/agents", this.createAgent.bind(this));
    app.get("/api/agents/:agentId", this.getAgent.bind(this));
    app.get("/api/agents", this.getAllAgents.bind(this));
    app.put("/api/agents/:agentId", this.updateAgent.bind(this));
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
      const { message, agentId, userId } = req.body as InteractRequestBody;
      console.log("check agentId: ", agentId);
      console.log("check userId: ", userId);

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

  private async interactStream(req: Request, res: Response): Promise<void> {
    try {
      const { message, agentId, userId } = req.body as InteractRequestBody;
      console.log("Streaming interaction for agentId: ", agentId);
      console.log("Streaming interaction for userId: ", userId);

      // Set headers for Server-Sent Events (SSE)
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: message }],
        stream: true, // Enable streaming
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          // Send each chunk as an SSE event
          res.write(`data: ${JSON.stringify({ reply: content })}\n\n`);
        }
      }

      // Signal the end of the stream
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Streaming error:", error);
      res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
      res.end();
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

  private async createAgent(req: Request, res: Response): Promise<void> {
    try {
      const { config, creatorUserId } = req.body as CreateAgentRequestBody;
      if (!creatorUserId) {
        res.status(400).json({ error: "Creator user ID required" });
        return;
      }
      const agentId = await agentRegistry.createAgentRecord(config, creatorUserId);
      res.json({ agentId });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  private async getAgent(req: Request, res: Response): Promise<void> {
    try {
      const { agentId } = req.params;
      const record = await agentRegistry.getAgentRecord(agentId);
      if (!record) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  private async getAllAgents(req: Request, res: Response): Promise<void> {
    try {
      const records = await agentRegistry.getAllAgentRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  private async updateAgent(req: Request, res: Response): Promise<void> {
    try {
      const { agentId } = req.params;
      const { config } = req.body as UpdateAgentRequestBody;
      await agentRegistry.updateAgentConfig(agentId, config);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
}

export function setupAgentRoutes(app: Express, orchestrator: Orchestrator): void {
  const agentRoutes = new AgentRoutes(orchestrator);
  agentRoutes.setup(app);
}