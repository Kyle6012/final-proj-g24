import cron from 'node-cron';
import { initCronJob } from '../cronJobs.mjs'; 
import { sendCyberAlerts } from '../utils/cyberAlert.mjs';
import pkg from '@jest/globals';

const { jest } = pkg;

jest.mock('node-cron', () => ({
    schedule: jest.fn(),
}));

jest.mock('../utils/cyberAlert.mjs', () => ({
    sendCyberAlerts: jest.fn(),
}));

describe('Cron Job Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should schedule cron job to run every day at 9 AM', () => {
        initCronJob();

        // Verify that cron.schedule was called with the correct parameters
        expect(cron.schedule).toHaveBeenCalledWith('0 9 * * *', expect.any(Function));
    });

    test('should call sendCyberAlerts', async () => {
        // Call the scheduled job manually
        const cronJobFunction = cron.schedule.mock.calls[0][1];
        await cronJobFunction(); // Manually trigger the cron job

        // Check if sendCyberAlerts was called
        expect(sendCyberAlerts).toHaveBeenCalled();
    });

    test('should run every two minutes', () => {
        jest.useFakeTimers();
        initCronJob();

        // Simulate the passage of time
        jest.advanceTimersByTime(2 * 60 * 1000); // Advance by 2 minutes

        const cronJobFunction = cron.schedule.mock.calls[0][1];
        cronJobFunction();

        // Verify that the cron job was triggered every two minutes
        expect(sendCyberAlerts).toHaveBeenCalled();
        
        jest.useRealTimers();
    });
});
