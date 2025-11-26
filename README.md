# PLP - Final Year Project

A comprehensive social platform developed as a Final Year Project on PLP, featuring user authentication, community engagement, real-time features, and AI-powered content moderation.

## ✨ Features

- **User Authentication**: Secure login and signup (auto-verified, no email required)
- **Social Feed**: Create posts, like, and comment in real-time
- **Communities**: Join and participate in interest-based communities
- **Real-time Features**: Instant messaging, notifications, and live updates powered by Pusher
- **AI Integration**: AI-powered content moderation and chat features
- **Image Uploads**: Secure image hosting with ImageKit
- **Content Moderation**: Automated screening with Perspective API

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon DB for production)
- **ORM**: Sequelize
- **Real-time**: Pusher (serverless-compatible WebSockets)
- **Authentication**: JWT + Session-based auth
- **Deployment**: Vercel Serverless Functions
- **File Storage**: ImageKit

---

## 📦 Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL (local installation)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   npm install
   ```

2. **Set up local database**:
   ```bash
   # Create PostgreSQL database
   createdb g24sec
   ```

3. **Configure environment**:
   Create a `.env` file in the root directory:
   ```env
   # Database
   DB_NAME=g24sec
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432

   # Auth
   SESSION_SECRET=your_session_secret_here
   JWT_SECRET=your_jwt_secret_here

   # Pusher (get free credentials at pusher.com)
   PUSHER_APP_ID=your_app_id
   PUSHER_KEY=your_key
   PUSHER_SECRET=your_secret
   PUSHER_CLUSTER=your_cluster

   # ImageKit (for image uploads)
   IMAGEKIT_PUBLIC_KEY=your_public_key
   IMAGEKIT_PRIVATE_KEY=your_private_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`

---

## 🌐 Production Deployment (Vercel)

### Step 1: Set Up Neon Database

1. Create a database at [neon.tech](https://neon.tech) (free tier available)
2. Copy your `DATABASE_URL` connection string
3. Run the schema setup:
   ```bash
   psql "your_neon_database_url" -f schema.sql
   ```
   This creates all required tables automatically.

### Step 2: Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**:
   
   **Required**:
   ```env
   DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   SESSION_SECRET=strong_random_secret_here
   JWT_SECRET=another_strong_secret_here
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster
   CRON_SECRET=secret_for_cron_jobs
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   ```

   **Optional** (for enhanced features):
   ```env
   HUGGINGFACE_API_KEY=your_key
   PERSPECTIVE_API_KEY=your_key
   NEWS_API_KEY=your_key
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Step 3: Verify Deployment

- ✅ Visit your Vercel URL
- ✅ Test signup and login
- ✅ Test real-time features (posts, messages)
- ✅ Check Pusher dashboard for connection stats

---

## 📁 Project Structure

```
├── api/                    # Vercel serverless entry point
├── config/                 # Database, Pusher, ImageKit configs
├── controllers/            # Business logic
├── models/                 # Sequelize database models
├── routes/                 # API route definitions
├── middleware/             # Authentication, validation
├── public/                 # Static assets (CSS, JS, images)
├── views/                  # EJS templates
├── utils/                  # Helper functions
├── schema.sql              # Database schema for Neon DB
└── vercel.json             # Vercel deployment config
```

---

## 🗄️ Database Schema

The application uses the following tables:
- **Users**: User accounts and profiles
- **Posts**: Social media posts
- **Comments**: Post comments
- **Likes**: Post likes
- **Messages**: Direct messages
- **Notifications**: Real-time notifications
- **Communities**: Interest-based groups
- **CommunityMembers**: Community membership
- **Follows**: User follow relationships
- **Admins**: Admin accounts
- **session**: Session storage (connect-pg-simple)

All tables are created automatically using `schema.sql`.

---

## 🔧 Configuration Notes

### Pusher Setup
Real-time features use Pusher instead of Socket.IO for serverless compatibility:
- **Free Tier**: 200k messages/day, 100 concurrent connections
- **Channels**: `feed`, `post-{id}`, `user-{id}`
- Sign up at [pusher.com](https://pusher.com)

### Database
- **Production**: Neon DB (serverless PostgreSQL)
- **Local**: Standard PostgreSQL
- Tables auto-created via `schema.sql`

### Image Uploads
- Uses ImageKit CDN
- Free tier: 20GB bandwidth/month
- Sign up at [imagekit.io](https://imagekit.io)

---

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm test             # Run tests
npm start            # Start production server (local)
node schema.sql      # Set up database (via psql)
node setup-production-db.mjs  # Alternative DB setup
```

---

## 📝 License

This project was developed as a Final Year Project for PLP.

---

## 🤝 Support

For issues or questions, please open an issue in the GitHub repository.
