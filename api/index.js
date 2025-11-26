import app from '../server.mjs';
import sqz from '../config/db.mjs';

// Initialize DB connection (but don't sync/alter in serverless)
// In production/serverless, migrations should be run separately
sqz.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));

export default app;
