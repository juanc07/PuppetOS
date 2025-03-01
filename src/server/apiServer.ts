import express, { Express } from 'express'; // Import express and its types
import { setupAgentRoutes } from './routes/agentRoutes';
import {setupPluginRoutes} from './routes/pluginRoutes';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app: Express = express(); // Explicitly define app as type Express
app.use(express.json()); // Middleware to parse JSON

// Setup API routes
setupAgentRoutes(app);
// plugin api routes for testing plugin
setupPluginRoutes(app);

export async function startApiServer() {
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`API Server running at http://localhost:${PORT}`);
    });
}
