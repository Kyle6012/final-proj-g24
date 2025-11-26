-- =============================================================
-- PLP Final Year Project - Database Schema for Neon DB
-- =============================================================
-- This script creates all tables for the application
-- Run this in Neon SQL Editor to set up your database
-- =============================================================

-- Drop existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS "Likes" CASCADE;
DROP TABLE IF EXISTS "Comments" CASCADE;
DROP TABLE IF EXISTS "Notifications" CASCADE;
DROP TABLE IF EXISTS "Messages" CASCADE;
DROP TABLE IF EXISTS "CommunityMembers" CASCADE;
DROP TABLE IF EXISTS "Posts" CASCADE;
DROP TABLE IF EXISTS "Communities" CASCADE;
DROP TABLE IF EXISTS "Follows" CASCADE;
DROP TABLE IF EXISTS "Admins" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- USERS TABLE
-- =============================================================
CREATE TABLE "Users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fullname VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "profilePic" VARCHAR(255) DEFAULT '',
    "isVerified" BOOLEAN DEFAULT false,
    "isSubscribed" BOOLEAN DEFAULT false,
    bio TEXT DEFAULT '',
    location VARCHAR(255) DEFAULT '',
    website VARCHAR(255) DEFAULT '',
    "verificationToken" VARCHAR(255),
    "verificationTokenExpires" TIMESTAMP WITH TIME ZONE,
    "resetToken" VARCHAR(255),
    "resetTokenExpires" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON "Users"(username);
CREATE INDEX idx_users_email ON "Users"(email);

-- =============================================================
-- COMMUNITIES TABLE
-- =============================================================
CREATE TABLE "Communities" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    "displayName" VARCHAR(255) NOT NULL,
    description TEXT,
    rules TEXT,
    icon VARCHAR(255),
    banner VARCHAR(255),
    "creatorId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "isPrivate" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_communities_name ON "Communities"(name);
CREATE INDEX idx_communities_creator ON "Communities"("creatorId");

-- =============================================================
-- POSTS TABLE
-- =============================================================
CREATE TABLE "Posts" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "communityId" UUID REFERENCES "Communities"(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    "mediaUrl" VARCHAR(255),
    "mediaType" VARCHAR(50),
    "likeCount" INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT posts_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_posts_user ON "Posts"("userId");
CREATE INDEX idx_posts_community ON "Posts"("communityId");
CREATE INDEX idx_posts_status ON "Posts"(status);
CREATE INDEX idx_posts_created ON "Posts"("createdAt" DESC);

-- =============================================================
-- COMMENTS TABLE
-- =============================================================
CREATE TABLE "Comments" (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "postId" UUID NOT NULL REFERENCES "Posts"(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comments_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_comments_user ON "Comments"("userId");
CREATE INDEX idx_comments_post ON "Comments"("postId");
CREATE INDEX idx_comments_created ON "Comments"("createdAt" DESC);

-- =============================================================
-- LIKES TABLE
-- =============================================================
CREATE TABLE "Likes" (
    id SERIAL PRIMARY KEY,
    "postId" UUID NOT NULL REFERENCES "Posts"(id) ON DELETE CASCADE,
    "userLikeId" UUID NOT NULL,
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("postId", "userId")
);

CREATE INDEX idx_likes_post ON "Likes"("postId");
CREATE INDEX idx_likes_user ON "Likes"("userId");

-- =============================================================
-- MESSAGES TABLE
-- =============================================================
CREATE TABLE "Messages" (
    id SERIAL PRIMARY KEY,
    "senderId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "receiverId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender ON "Messages"("senderId");
CREATE INDEX idx_messages_receiver ON "Messages"("receiverId");
CREATE INDEX idx_messages_timestamp ON "Messages"(timestamp DESC);
CREATE INDEX idx_messages_unread ON "Messages"("receiverId", "isRead") WHERE "isRead" = false;

-- =============================================================
-- NOTIFICATIONS TABLE
-- =============================================================
CREATE TABLE "Notifications" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    "isRead" BOOLEAN DEFAULT false,
    "isUniversal" BOOLEAN DEFAULT false,
    "sourceId" UUID,
    "sourceType" VARCHAR(50),
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "senderId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    link VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_type_check CHECK (type IN ('post_like', 'post_comment', 'follow', 'mention', 'system', 'post_create', 'profile_update'))
);

CREATE INDEX idx_notifications_user ON "Notifications"("userId");
CREATE INDEX idx_notifications_sender ON "Notifications"("senderId");
CREATE INDEX idx_notifications_unread ON "Notifications"("userId", "isRead") WHERE "isRead" = false;
CREATE INDEX idx_notifications_created ON "Notifications"("createdAt" DESC);

-- =============================================================
-- FOLLOWS TABLE
-- =============================================================
CREATE TABLE "Follows" (
    id SERIAL PRIMARY KEY,
    "followerId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "followingId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("followerId", "followingId"),
    CONSTRAINT no_self_follow CHECK ("followerId" != "followingId")
);

CREATE INDEX idx_follows_follower ON "Follows"("followerId");
CREATE INDEX idx_follows_following ON "Follows"("followingId");

-- =============================================================
-- COMMUNITY MEMBERS TABLE
-- =============================================================
CREATE TABLE "CommunityMembers" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "communityId" UUID NOT NULL REFERENCES "Communities"(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "communityId"),
    CONSTRAINT community_members_role_check CHECK (role IN ('member', 'moderator', 'admin'))
);

CREATE INDEX idx_community_members_user ON "CommunityMembers"("userId");
CREATE INDEX idx_community_members_community ON "CommunityMembers"("communityId");

-- =============================================================
-- ADMINS TABLE
-- =============================================================
CREATE TABLE "Admins" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_username ON "Admins"(username);
CREATE INDEX idx_admins_email ON "Admins"(email);

-- =============================================================
-- SESSION TABLE (for connect-pg-simple)
-- =============================================================
CREATE TABLE IF NOT EXISTS "session" (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX idx_session_expire ON "session"(expire);

-- =============================================================
-- VERIFICATION QUERIES
-- =============================================================
-- Run these to verify tables were created successfully

-- Count tables
SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify all tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- =============================================================
-- SUCCESS!
-- =============================================================
-- All tables created successfully
-- You can now deploy your application to Vercel
-- =============================================================
