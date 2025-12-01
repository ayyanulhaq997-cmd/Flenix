import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, jsonb, bigint, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Movies table with indexes for fast queries
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  year: integer("year").notNull(),
  description: text("description"),
  cast: text("cast").array(), // Array of actor names
  posterUrl: text("poster_url"),
  videoUrl: text("video_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"), // in bytes
  duration: integer("duration"), // in seconds
  status: text("status").notNull().default("draft"), // draft, active, archived
  requiredPlan: text("required_plan").default("free"), // free, standard, premium
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  titleIdx: index("idx_movies_title").on(table.title),
  genreIdx: index("idx_movies_genre").on(table.genre),
  statusIdx: index("idx_movies_status").on(table.status),
  planIdx: index("idx_movies_required_plan").on(table.requiredPlan),
}));

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
});

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

// Series table with indexes for fast queries
export const series = pgTable("series", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  totalSeasons: integer("total_seasons").notNull(),
  description: text("description"),
  cast: text("cast").array(), // Array of actor names
  posterUrl: text("poster_url"),
  status: text("status").notNull().default("draft"), // draft, active, archived
  requiredPlan: text("required_plan").default("free"), // free, standard, premium
  rating: text("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  titleIdx: index("idx_series_title").on(table.title),
  genreIdx: index("idx_series_genre").on(table.genre),
  statusIdx: index("idx_series_status").on(table.status),
  planIdx: index("idx_series_required_plan").on(table.requiredPlan),
}));

export const insertSeriesSchema = createInsertSchema(series).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSeries = z.infer<typeof insertSeriesSchema>;
export type Series = typeof series.$inferSelect;

// Episodes table with indexes
export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id").notNull().references(() => series.id, { onDelete: "cascade" }),
  seasonNumber: integer("season_number").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  duration: integer("duration"),
  status: text("status").notNull().default("processing"),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  seriesIdIdx: index("idx_episodes_series_id").on(table.seriesId),
  statusIdx: index("idx_episodes_status").on(table.status),
}));

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  id: true,
  createdAt: true,
  views: true,
});

export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type Episode = typeof episodes.$inferSelect;

// Channels table with status index for fast lookups
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  streamUrl: text("stream_url"),
  logoUrl: text("logo_url"),
  status: text("status").notNull().default("offline"), // online, offline
  currentViewers: integer("current_viewers").notNull().default(0),
  epgData: jsonb("epg_data"), // Electronic Program Guide data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("idx_channels_status").on(table.status),
}));

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentViewers: true,
});

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

// App Users table (subscribers to the streaming service)
export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").notNull().default("free"), // free, standard, premium
  status: text("status").notNull().default("active"), // active, suspended, banned
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const insertAppUserSchema = createInsertSchema(appUsers).omit({
  id: true,
  joinedAt: true,
  lastLogin: true,
  emailVerified: true,
  emailVerificationToken: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export type InsertAppUser = z.infer<typeof insertAppUserSchema>;
export type AppUser = typeof appUsers.$inferSelect;

// Admin users (for this dashboard)
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"), // admin, super_admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  billingPeriod: text("billing_period").notNull(), // monthly, yearly
  maxDevices: integer("max_devices").notNull(),
  maxQuality: text("max_quality").notNull(), // 480p, 720p, 1080p, 4k
  features: jsonb("features"), // array of feature strings
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// Channel Content Junction Table (links movies/series to channels)
export const channelContent = pgTable("channel_content", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(), // "movie" or "series"
  contentId: integer("content_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertChannelContentSchema = createInsertSchema(channelContent).omit({
  id: true,
  addedAt: true,
});

export type InsertChannelContent = z.infer<typeof insertChannelContentSchema>;
export type ChannelContent = typeof channelContent.$inferSelect;

// API Keys table (for mobile app authentication)
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  appName: text("app_name").notNull(),
  key: text("key").notNull().unique(),
  secret: text("secret").notNull(),
  status: text("status").notNull().default("active"), // active, revoked
  createdBy: text("created_by").notNull(), // admin username
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
  revokedAt: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// User Favorites table (movies/series marked as favorites)
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(), // "movie" or "series"
  contentId: integer("content_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertUserFavoritesSchema = createInsertSchema(userFavorites).omit({
  id: true,
  addedAt: true,
});

export type InsertUserFavorites = z.infer<typeof insertUserFavoritesSchema>;
export type UserFavorites = typeof userFavorites.$inferSelect;

// User Watchlist table (movies/series added to watch later)
export const userWatchlist = pgTable("user_watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(), // "movie" or "series"
  contentId: integer("content_id").notNull(),
  watchedPercentage: integer("watched_percentage").notNull().default(0),
  lastWatchedAt: timestamp("last_watched_at"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertUserWatchlistSchema = createInsertSchema(userWatchlist).omit({
  id: true,
  addedAt: true,
  lastWatchedAt: true,
});

export type InsertUserWatchlist = z.infer<typeof insertUserWatchlistSchema>;
export type UserWatchlist = typeof userWatchlist.$inferSelect;

// User Profiles table (up to 5 profiles per account)
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  maturityRating: text("maturity_rating").default("18"), // 7+, 13+, 18+
  isPinProtected: boolean("is_pin_protected").default(false),
  pinHash: text("pin_hash"), // hashed PIN for profile lock
  isKidsProfile: boolean("is_kids_profile").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  pinHash: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Parental Controls table
export const parentalControls = pgTable("parental_controls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  profileId: integer("profile_id").references(() => userProfiles.id, { onDelete: "cascade" }),
  maturityRating: text("maturity_rating").notNull(), // 7+, 13+, 18+
  blockedGenres: text("blocked_genres").array().default(sql`ARRAY[]::text[]`),
  requiresApproval: boolean("requires_approval").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertParentalControlSchema = createInsertSchema(parentalControls).omit({
  id: true,
  updatedAt: true,
});

export type InsertParentalControl = z.infer<typeof insertParentalControlSchema>;
export type ParentalControl = typeof parentalControls.$inferSelect;

// User Sessions table (for device management & sign out all)
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  deviceName: text("device_name").notNull(), // e.g., "iPhone 13", "Chrome on Windows"
  deviceType: text("device_type").notNull(), // mobile, web, tv
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // session expiry
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  lastActivityAt: true,
  createdAt: true,
});

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

// Viewing History table (tracks watch progress for cross-device sync)
export const viewingHistory = pgTable("viewing_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  profileId: integer("profile_id").references(() => userProfiles.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(), // "movie" or "series"
  contentId: integer("content_id").notNull(),
  episodeId: integer("episode_id"), // for series only
  currentTimeSeconds: integer("current_time_seconds").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull(),
  completionPercentage: integer("completion_percentage").notNull().default(0),
  lastWatchedAt: timestamp("last_watched_at").defaultNow().notNull(),
});

export const insertViewingHistorySchema = createInsertSchema(viewingHistory).omit({
  id: true,
  lastWatchedAt: true,
});

export type InsertViewingHistory = z.infer<typeof insertViewingHistorySchema>;
export type ViewingHistory = typeof viewingHistory.$inferSelect;

// Audio Tracks table (for dubs/language support)
export const audioTracks = pgTable("audio_tracks", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // "movie" or "series"
  contentId: integer("content_id").notNull(),
  episodeId: integer("episode_id"), // for series only
  language: text("language").notNull(), // e.g., "en", "es", "fr", "pt"
  languageName: text("language_name").notNull(), // e.g., "English", "Spanish"
  audioUrl: text("audio_url").notNull(),
  codec: text("codec").notNull(), // "aac", "ac3", "eac3"
  bitrate: integer("bitrate").notNull(), // in kbps
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAudioTrackSchema = createInsertSchema(audioTracks).omit({
  id: true,
  createdAt: true,
});

export type InsertAudioTrack = z.infer<typeof insertAudioTrackSchema>;
export type AudioTrack = typeof audioTracks.$inferSelect;

// Subtitles table (for captions/closed captions)
export const subtitles = pgTable("subtitles", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // "movie" or "series"
  contentId: integer("content_id").notNull(),
  episodeId: integer("episode_id"), // for series only
  language: text("language").notNull(), // e.g., "en", "es", "fr", "pt"
  languageName: text("language_name").notNull(), // e.g., "English", "Spanish"
  subtitleUrl: text("subtitle_url").notNull(), // VTT/SRT file URL
  format: text("format").notNull(), // "vtt", "srt", "ass"
  isDefault: boolean("is_default").default(false),
  isCC: boolean("is_cc").default(false), // Closed Captions (includes audio descriptions)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubtitleSchema = createInsertSchema(subtitles).omit({
  id: true,
  createdAt: true,
});

export type InsertSubtitle = z.infer<typeof insertSubtitleSchema>;
export type Subtitle = typeof subtitles.$inferSelect;

// Downloads table (for offline viewing on mobile)
export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(), // "movie" or "series"
  contentId: integer("content_id").notNull(),
  episodeId: integer("episode_id"), // for series only
  quality: text("quality").notNull(), // "standard" (480p), "high" (720p)
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // DRM license expiry (30 days default)
  status: text("status").notNull().default("completed"), // downloading, completed, expired
  localPath: text("local_path"), // Device storage path (client-side)
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloadedAt: true,
});

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;

// File Storage table (for Wasabi/S3 uploads)
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  storageKey: text("storage_key").notNull().unique(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  ownerUserId: varchar("owner_user_id", { length: 50 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).notNull().default("available"),
  relatedContentId: integer("related_content_id"),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
