import schedule from 'node-schedule';

export async function startJobRunner(): Promise<void> {
    console.log('Starting Job Runner...');

    try {
        // Schedule a job to run every minute
        const job = schedule.scheduleJob('* * * * *', () => {
            console.log(`[${new Date().toISOString()}] Running scheduled job...`);
            // Add your task logic here
        });

        console.log('Job Runner is ready.');

        // Optional: Log the next invocation time
        if (job.nextInvocation()) {
            console.log(`Next job scheduled at: ${job.nextInvocation()}`);
        }
    } catch (error) {
        console.error('Error starting Job Runner:', error);
    }
}
