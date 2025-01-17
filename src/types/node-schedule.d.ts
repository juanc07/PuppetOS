declare module 'node-schedule' {
    type JobCallback = () => void;

    interface RecurrenceRule {
        dayOfWeek?: number | number[];
        month?: number | number[];
        date?: number | number[];
        hour?: number | number[];
        minute?: number | number[];
        second?: number | number[];
    }

    interface Job {
        cancel(): void;
        reschedule(rule: string | RecurrenceRule | Date): void;
        nextInvocation(): Date | null;
    }

    function scheduleJob(
        nameOrRule: string | RecurrenceRule | Date,
        callback: JobCallback
    ): Job;

    export { scheduleJob, RecurrenceRule, Job };
}
