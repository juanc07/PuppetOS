import { Express } from 'express';

export function setupPluginRoutes(app: Express) {
    app.post('/api/plugin/test', (req, res) => {
        const { message } = req.body;        
        res.json({ reply: `plugin api received: ${message}` });
    });

    app.post('/api/plugin/test2', (req, res) => {        
        res.status(200).send('plugin test2 hit');
    });
}