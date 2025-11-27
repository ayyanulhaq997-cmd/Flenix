# Fenix Streaming Platform

## Overview

Fenix is a professional streaming platform administration system designed to manage movies, TV series, live channels, and user subscriptions. The platform provides a comprehensive admin dashboard for content management, user administration, and API key generation. It supports tiered subscription plans (free, standard, premium) with content access control, secure JWT-based authentication, and large-scale video content storage via Wasabi S3-compatible object storage.

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
- AWS SDK for S3-compatible storage operations

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
- Migration tools: `/api/admin/export`, `/api/admin/import`

**Security Measures:**
- JWT-based authentication with 7-day token expiry
- Role-based access control (admin, super_admin, content_editor)
- Plan-based content access control (free, standard, premium)
- Secure streaming URL generation with signed tokens (1-hour expiry)
- Environment-based secret management

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

### Content Delivery

**Storage Solution:**
- Wasabi S3-compatible object storage for video files
- Cost-optimized at $5.99/TB/month
- Multi-region support (US East, US West, EU Central, Asia Pacific)
- Direct CDN URL access from mobile applications

**Upload Strategy:**
- Chunked upload support for large files (70TB+ capability)
- Resumable upload mechanism
- Automatic filename matching to database entries
- Migration tool for bulk content transfer from legacy systems

**Streaming Architecture:**
- JWT-signed streaming URLs with 1-hour expiration
- Direct streaming from Wasabi CDN endpoints
- Format: `https://{bucket}.s3.{region}.wasabisys.com/{content-path}`

### Deployment Architecture

**Scalability Design:**
- Horizontal scaling via clustering (uses all CPU cores)
- Nginx reverse proxy for load balancing and SSL termination
- Rate limiting at proxy level
- Session management with memory store (development) or Redis (production)

**Production Infrastructure:**
- Backend: Multiple Node.js instances behind load balancer
- Database: PostgreSQL with connection pooling and read replicas
- Storage: Wasabi multi-region buckets
- Frontend: Static file serving from Vite build output

**Monitoring & Operations:**
- PM2 process management with auto-restart
- Structured logging with request/response tracking
- Health check endpoints
- Error tracking integration points (Sentry)

## External Dependencies

### Third-Party Services

**Storage & CDN:**
- Wasabi Object Storage - S3-compatible video storage
  - Multi-region availability
  - No egress fees
  - API compatible with AWS S3

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
- `@aws-sdk/client-s3` - Wasabi/S3 integration
- `multer` - File upload handling
- `ws` - WebSocket support

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

### API Integrations

**Authentication:**
- JWT-based token system (self-hosted)
- No external authentication providers currently integrated

**Payment Processing:**
- Stripe integration prepared (package included)
- Not actively implemented in current codebase

**Migration Tools:**
- CLI-based migration from legacy "crack server" databases
- JSON import/export for bulk data operations
- Wasabi bulk upload utilities