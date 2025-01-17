"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJobRunner = startJobRunner;
const node_schedule_1 = __importDefault(require("node-schedule"));
async function startJobRunner() {
    console.log('Starting Job Runner...');
    try {
        // Schedule a job to run every minute
        const job = node_schedule_1.default.scheduleJob('* * * * *', () => {
            console.log(`[${new Date().toISOString()}] Running scheduled job...`);
            // Add your task logic here
        });
        console.log('Job Runner is ready.');
        // Optional: Log the next invocation time
        if (job.nextInvocation()) {
            console.log(`Next job scheduled at: ${job.nextInvocation()}`);
        }
    }
    catch (error) {
        console.error('Error starting Job Runner:', error);
    }
}
//# sourceMappingURL=jobRunner.js.map