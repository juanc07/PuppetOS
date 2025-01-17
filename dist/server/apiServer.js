"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApiServer = startApiServer;
const express_1 = __importDefault(require("express")); // Import express and its types
const agentRoutes_1 = require("./routes/agentRoutes");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)(); // Explicitly define app as type Express
app.use(express_1.default.json()); // Middleware to parse JSON
// Setup API routes
(0, agentRoutes_1.setupAgentRoutes)(app);
async function startApiServer() {
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`API Server running at http://localhost:${PORT}`);
    });
}
//# sourceMappingURL=apiServer.js.map