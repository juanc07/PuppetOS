// server/jobRunner.ts
import schedule, { Job } from "node-schedule";

// Store the job reference globally (or in a singleton/module scope)
let scheduledJob: Job | null = null;

export async function startJobRunner(): Promise<void> {
    console.log("Starting Job Runner...");

    try {
        // Schedule a job to run every minute
        scheduledJob = schedule.scheduleJob("* * * * *", () => {
            console.log(`[${new Date().toISOString()}] Running scheduled job...`);
            // Add your task logic here (e.g., agent maintenance, logging, etc.)
        });

        console.log("Job Runner is ready.");

        // Log the next invocation time
        if (scheduledJob && scheduledJob.nextInvocation()) {
            console.log(`Next job scheduled at: ${scheduledJob.nextInvocation()}`);
        }
    } catch (error) {
        console.error("Error starting Job Runner:", error);
        scheduledJob = null; // Reset on error
    }
}

export async function stopJobRunner(): Promise<void> {
    console.log("Stopping Job Runner...");

    try {
        if (scheduledJob) {
            scheduledJob.cancel(); // Cancel the scheduled job
            console.log("Job Runner stopped successfully.");
            scheduledJob = null; // Clear the reference
        } else {
            console.log("No active job to stop.");
        }
    } catch (error) {
        console.error("Error stopping Job Runner:", error);
    }
}