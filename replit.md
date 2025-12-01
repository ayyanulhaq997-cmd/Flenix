# Fenix Streaming Platform - Admin Dashboard

## Overview

Fenix is a professional streaming platform administration dashboard designed to manage content metadata, user accounts, and permissions for Android/iOS mobile apps (similar to Netflix). The dashboard serves as the **content management layer** for streaming apps.

**Key Point:** Fenix is a management dashboard only. Content uploads happen directly within the mobile apps, not through this website. Streaming also happens directly in the apps.

The system is built as a full-stack application with a React frontend dashboard and Node.js/Express backend API, designed to handle 1000-3000 concurrent users with proper clustering and connection pooling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for the admin dashboard
- Vite as the build tool and development server
- TanStack Query for server state management
- Wouter for client-side routing
- Tailwind CSS with shadcn/ui component library
- Radix UI primitives for accessible components

**Design Patterns:**
- Component-based architecture with reusable UI components in `/client/src/components/ui`
- Form management using react-hook-form with Zod validation
- Query-based data fetching with automatic caching and invalidation
- Dark-themed streaming platform UI with glassmorphism effects

**Key Features:**
- Responsive admin dashboard with sidebar navigation
- Content management for movies, series, episodes, and live channels
- User management with subscription plan controls
- Data migration wizard for legacy content import
- API key generation and management interface

### Backend Architecture

**Technology Stack:**
- Node.js with Express web framework
- TypeScript for type safety
- Drizzle ORM for database operations
- PostgreSQL as the primary database (via Neon serverless)
- JWT for authentication and authorization

**Design Patterns:**
- RESTful API architecture with versioned endpoints (`/api/*`)
- Middleware-based authentication and authorization
- Repository pattern through storage abstraction layer
- Clustering support for multi-core CPU utilization in production
- Connection pooling for database efficiency (50 max connections)

**API Structure:**
- Public endpoints: `/api/public/*` (no authentication required)
- Admin endpoints: `/api/*` (JWT authentication required)
- Authentication endpoints: `/api/auth/login`, `/api/users/register`
- Content endpoints: `/api/movies`, `/api/series`, `/api/episodes`, `/api/channels`
- User management: `/api/app-users`, `/api/admins`
- Subscription plans: `/api/subscription-plans`
- API keys: `/api/api-keys`
- Migration tools: `/api/admin/export`, `/api/admin/import`

**Security Measures:**
- JWT-based authentication with 7-day token expiry
- Role-based access control (admin, super_admin, content_editor)
- Plan-based content access control (free, standard, premium)
- Secure streaming URL generation with signed tokens (1-hour expiry)
- Environment-based secret management
- **Digital Rights Management (DRM):** Support for Widevine, FairPlay, and PlayReady DRM for all high-definition and premium content streams. Backend DRM licensing server issues keys upon successful authentication to ensure maximum content security for commercial-grade content licensing.

### Database Schema

**Core Tables:**
- `movies` - Movie content with metadata, status, and plan requirements
- `series` - TV series with season information
- `episodes` - Individual episodes linked to series
- `channels` - Live streaming channels with EPG data
- `app_users` - End-user accounts with subscription plans
- `admins` - Administrative users with role-based permissions
- `subscription_plans` - Pricing and feature tiers
- `channel_content` - Relationships between channels and content
- `api_keys` - Generated API credentials for external integrations

**Key Relationships:**
- Episodes belong to series (one-to-many)
- Content has required subscription plans (free/standard/premium)
- Users have assigned subscription plans
- Channels can contain multiple content items

**Database Configuration:**
- PostgreSQL via Neon serverless platform
- Drizzle ORM with migration support
- Optimized connection pooling (10-50 connections)
- Schema defined in `/shared/schema.ts`

### Content Delivery Model

**Mobile App Direct Upload:**
- Apps upload video files, posters, and metadata directly
- No content passes through this web server
- Apps handle all streaming and playback

**Fenix Role:**
- Stores content metadata (titles, descriptions, durations)
- Manages user accounts and subscription tiers
- Provides API endpoints for apps to query content
- Tracks user permissions and access control

## External Dependencies

### Third-Party Services

**Database:**
- Neon Serverless PostgreSQL
  - Serverless architecture with auto-scaling
  - WebSocket-based connections for efficiency
  - Built-in connection pooling

**Infrastructure:**
- Railway (recommended) or VPS hosting for backend deployment
- Nginx for reverse proxy and load balancing
- Let's Encrypt for SSL certificates

### Key NPM Packages

**Backend:**
- `express` - Web framework
- `drizzle-orm` - Type-safe ORM
- `@neondatabase/serverless` - Neon PostgreSQL client
- `jsonwebtoken` - JWT authentication
- `postgres` - PostgreSQL client library

**Frontend:**
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - Utility-first CSS framework
- `recharts` - Data visualization for analytics

**Development:**
- `vite` - Build tool and dev server
- `tsx` - TypeScript execution
- `drizzle-kit` - Database migration tool
- `esbuild` - Production bundler

## API Integration Guide

### For Mobile App Developers

The Fenix dashboard provides REST APIs for mobile apps to:

1. **Authenticate Users**
   - `POST /api/auth/login` - Get JWT token

2. **Query Content**
   - `GET /api/movies` - List all available movies
   - `GET /api/series` - List all available series
   - `GET /api/channels` - List all available channels
   - `GET /api/episodes?seriesId=1` - Get episodes for a series

3. **User Management**
   - `POST /api/app-users` - Register new user
   - `GET /api/app-users/:id` - Get user info
   - `PUT /api/app-users/:id` - Update user subscription

4. **API Keys**
   - `POST /api/api-keys` - Generate API credentials
   - Apps use these keys for server-to-server communication

## Deployment Architecture

**Scalability Design:**
- Horizontal scaling via clustering (uses all CPU cores)
- Nginx reverse proxy for load balancing and SSL termination
- Rate limiting at proxy level
- Session management with memory store (development) or Redis (production)

**Production Infrastructure:**
- Backend: Multiple Node.js instances behind load balancer
- Database: PostgreSQL with connection pooling and read replicas
- Frontend: Static file serving from Vite build output

**Monitoring & Operations:**
- PM2 process management with auto-restart
- Structured logging with request/response tracking
- Health check endpoints
- Error tracking integration points (Sentry)

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   - PostgreSQL is automatically provisioned on Replit
   - Run migrations: `npm run db:push`

3. **Environment Variables:**
   - `JWT_SECRET` - Secret key for JWT signing
   - Database credentials are auto-configured

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Access Dashboard:**
   - URL: http://localhost:5000
   - Default credentials: admin@fenix.local / Admin@123456

## Notes

- This is a **management dashboard only** - no streaming happens here
- Mobile apps handle all video streaming directly
- All content metadata is stored in PostgreSQL
- APIs are designed for mobile app consumption
