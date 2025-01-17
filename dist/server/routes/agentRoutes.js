"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAgentRoutes = setupAgentRoutes;
function setupAgentRoutes(app) {
    app.post('/api/agent/interact', (req, res) => {
        const { message } = req.body;
        // Process the interaction
        res.json({ reply: `Agent received: ${message}` });
    });
    app.post('/api/agent/train', (req, res) => {
        // Trigger training logic
        res.status(200).send('Agent training started.');
    });
}
//# sourceMappingURL=agentRoutes.js.map