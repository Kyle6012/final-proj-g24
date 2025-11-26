# Production Database Setup

## Quick Start

Run this command to create all database tables on your Neon DB:

```bash
node setup-production-db.mjs
```

## What It Does

1. ✅ Connects to your Neon DB using `DATABASE_URL` from `.env.production`
2. ✅ Creates all tables based on your Sequelize models
3. ✅ Sets up indexes and foreign key constraints
4. ✅ Lists all created tables

## Prerequisites

1. **Neon DB Created**: You must have already created a database on [neon.tech](https://neon.tech)
2. **Connection String**: Copy your DATABASE_URL from Neon dashboard
3. **Network Access**: Ensure you can connect to Neon from your environment

## Setup Instructions

### Step 1: Update `.env.production`

Edit the `.env.production` file with your actual Neon credentials:

```env
DATABASE_URL='postgresql://neondb_owner:your_password@your-host.neon.tech/serverless?sslmode=require'
```

**Important**: Remove `&channel_binding=require` from the URL if present - it's not supported by the pg driver.

### Step 2: Run the Setup Script

```bash
node setup-production-db.mjs
```

### Expected Output

```
🚀 Starting Production Database Setup...

📍 Database: Neon DB (Production)

🔌 Testing database connection...
✅ Database connection established successfully.

📊 Creating/updating database tables...
✅ All tables created/updated successfully!

📋 Tables in database:
   1. Admins
   2. Comments
   3. Communities
   4. CommunityMembers
   5. Follows
   6. Likes
   7. Messages
   8. Notifications
   9. Posts
   10. Users
   11. session

✅ Production database setup complete!
🎉 Your Neon DB is ready to use.
```

## Troubleshooting

### Connection Refused Error

If you get `ECONNREFUSED`:
- Check that Neon DB is running (not paused)
- Verify your IP is allowed (Neon allows all IPs by default)
- Try from a different network/environment
- Use Neon's web SQL editor to verify DB is accessible

### Authentication Failed

If you get authentication errors:
- Double-check your DATABASE_URL
- Ensure password doesn't contain special characters that need URL encoding
- Verify the database name exists on Neon

### SSL/TLS Errors

If you get SSL errors:
- Keep `?sslmode=require` in your URL
- Remove `&channel_binding=require` if present

## Alternative: Use Vercel Deployment

If local connection fails, you can also run this during first Vercel deployment:

1. Set `DATABASE_URL` in Vercel environment variables
2. On first deploy, tables will auto-create when the app starts
3. Or create a one-time deployment script in Vercel

## Manual Table Creation (Last Resort)

If you can't connect, use Neon's SQL Editor:

```sql
-- Run this in Neon web console
-- Tables will be created automatically by Sequelize on first run
-- This is just a backup option
```

Your app will auto-create tables on first serverless function call if they don't exist!
