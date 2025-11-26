import { jest } from '@jest/globals';

// Define mock factory
jest.mock('node-cron', () => ({
    __esModule: true,
    default: {
        schedule: jest.fn()
    }
}));

jest.mock('../utils/cyberAlert.mjs', () => ({
    sendCyberAlerts: jest.fn(),
}));

// Import after mocks
import cron from 'node-cron';
import { initCronJob } from '../cronJobs.mjs';
import { sendCyberAlerts } from '../utils/cyberAlert.mjs';

describe('Cron Job Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should schedule cron job to run every day at 9 AM', () => {
        initCronJob();
        expect(cron.schedule).toHaveBeenCalledWith('0 9 * * *', expect.any(Function));
    });

    test('should call sendCyberAlerts', async () => {
        initCronJob();
        // Call the scheduled job manually
        const cronJobFunction = cron.schedule.mock.calls[0][1];
        await cronJobFunction(); // Manually trigger the cron job

        // Check if sendCyberAlerts was called
        expect(sendCyberAlerts).toHaveBeenCalled();
    });
});
