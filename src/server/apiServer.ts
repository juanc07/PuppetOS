// server/startApiServer.ts
import express, { Express } from "express";
import { Server } from "http";
import { setupAgentRoutes } from "./routes/agentRoutes";
import { setupPluginRoutes } from "./routes/pluginRoutes";
import { Orchestrator } from "../core/Orchestrator";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

// Middleware must be before routes
app.use(express.json({ limit: "10kb" })); // Ensure JSON parsing with a reasonable limit
app.use(express.static(path.join(__dirname, "../public")));

let server: Server | null = null;

export async function startApiServer(orchestrator: Orchestrator): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("Starting API server...");
    setupAgentRoutes(app, orchestrator);
    setupPluginRoutes(app);

    const PORT = process.env.PORT || "3000";
    server = app.listen(PORT, () => {
      console.log(`API Server running at http://localhost:${PORT}`);
      resolve();
    });

    server.on("error", (err) => {
      console.error("Server start error:", err);
      reject(err);
    });
  });
}

export async function stopApiServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err: Error | undefined) => {
        if (err) {
          console.error("Error stopping API Server:", err);
          reject(err);
        } else {
          console.log("API Server stopped successfully.");
          server = null;
          resolve();
        }
      });
    } else {
      console.log("No active API server to stop.");
      resolve();
    }
  });
}