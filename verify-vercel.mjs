import http from 'http';

console.log('Simulating Vercel entry point...');

// Mock environment variables for verification
process.env.DISABLE_EMAIL = 'true';
process.env.SESSION_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'; // Mock DB URL

// Use dynamic import to ensure env vars are set BEFORE the app loads
const { default: app } = await import('./api/index.js');

try {
    // Attempt to create a server using the exported app
    const server = http.createServer(app);

    // Listen on a random port to verify it starts
    server.listen(0, () => {
        const address = server.address();
        console.log(`Successfully started server on port ${address.port}`);
        server.close(() => {
            console.log('Server closed successfully. Verification passed.');
            process.exit(0);
        });
    });
} catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
}


