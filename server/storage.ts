import { 
  movies, series, episodes, channels, appUsers, admins, subscriptionPlans, channelContent, apiKeys, files, userFavorites, userWatchlist, viewingHistory, userProfiles, userSessions, audioTracks, subtitles, downloads,
  type Movie, type InsertMovie,
  type Series, type InsertSeries,
  type Episode, type InsertEpisode,
  type Channel, type InsertChannel,
  type AppUser, type InsertAppUser,
  type Admin, type InsertAdmin,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type ChannelContent, type InsertChannelContent,
  type ApiKey, type InsertApiKey,
  type File, type InsertFile,
  type UserFavorites, type InsertUserFavorites,
  type UserWatchlist, type InsertUserWatchlist,
  type ViewingHistory, type InsertViewingHistory,
  type UserProfile, type InsertUserProfile,
  type UserSession, type InsertUserSession,
  type AudioTrack, type InsertAudioTrack,
  type Subtitle, type InsertSubtitle,
  type Download, type InsertDownload
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, ilike, or } from "drizzle-orm";
import { generateToken } from "./auth";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Movies
  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: number): Promise<void>;
  
  // Series
  getAllSeries(): Promise<Series[]>;
  getSeries(id: number): Promise<Series | undefined>;
  createSeries(series: InsertSeries): Promise<Series>;
  updateSeries(id: number, series: Partial<InsertSeries>): Promise<Series | undefined>;
  deleteSeries(id: number): Promise<void>;
  
  // Episodes
  getEpisodesBySeries(seriesId: number): Promise<Episode[]>;
  getEpisode(id: number): Promise<Episode | undefined>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: number, episode: Partial<InsertEpisode>): Promise<Episode | undefined>;
  deleteEpisode(id: number): Promise<void>;
  
  // Channels
  getChannels(): Promise<Channel[]>;
  getChannel(id: number): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: number, channel: Partial<InsertChannel>): Promise<Channel | undefined>;
  deleteChannel(id: number): Promise<void>;
  
  // App Users
  getAppUsers(): Promise<AppUser[]>;
  getAppUser(id: number): Promise<AppUser | undefined>;
  getAppUserByEmail(email: string): Promise<AppUser | undefined>;
  createAppUser(user: InsertAppUser): Promise<AppUser>;
  updateAppUser(id: number, user: Partial<InsertAppUser>): Promise<AppUser | undefined>;
  deleteAppUser(id: number): Promise<void>;
  
  // Admins
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<void>;

  // Channel Content
  addContentToChannel(content: InsertChannelContent): Promise<ChannelContent>;
  getChannelContent(channelId: number): Promise<any[]>;
  removeContentFromChannel(contentId: number, channelId: number): Promise<void>;

  // Search & Filter
  searchMovies(query: string, genre?: string, status?: string): Promise<Movie[]>;
  searchSeries(query: string, genre?: string, status?: string): Promise<Series[]>;

  // API Keys
  createApiKey(key: InsertApiKey): Promise<ApiKey>;
  getApiKeys(): Promise<ApiKey[]>;
  getApiKey(keyId: number): Promise<ApiKey | undefined>;
  revokeApiKey(keyId: number): Promise<ApiKey | undefined>;
  verifyApiKey(key: string, secret: string): Promise<ApiKey | undefined>;

  // Files
  createFile(file: InsertFile): Promise<File>;
  getFile(id: number): Promise<File | undefined>;
  getFileByStorageKey(storageKey: string): Promise<File | undefined>;
  getFilesByOwner(ownerUserId: string): Promise<File[]>;
  getFilesByRelatedContent(relatedContentId: number): Promise<File[]>;
  updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<void>;
  deleteFileByStorageKey(storageKey: string): Promise<void>;

  // User Favorites
  addFavorite(favorite: InsertUserFavorites): Promise<UserFavorites>;
  removeFavorite(userId: number, contentId: number, contentType: string): Promise<void>;
  getUserFavorites(userId: number): Promise<UserFavorites[]>;
  isFavorite(userId: number, contentId: number, contentType: string): Promise<boolean>;

  // User Watchlist
  addToWatchlist(watchlist: InsertUserWatchlist): Promise<UserWatchlist>;
  removeFromWatchlist(userId: number, contentId: number, contentType: string): Promise<void>;
  getUserWatchlist(userId: number): Promise<UserWatchlist[]>;
  updateWatchlistProgress(userId: number, contentId: number, contentType: string, percentage: number): Promise<UserWatchlist | undefined>;

  // Viewing History
  recordViewingHistory(history: InsertViewingHistory): Promise<ViewingHistory>;
  getViewingHistory(userId: number, profileId?: number): Promise<ViewingHistory[]>;
  getViewingHistoryItem(userId: number, contentType: string, contentId: number): Promise<ViewingHistory | undefined>;
  updateViewingProgress(userId: number, contentId: number, currentTime: number, duration: number): Promise<ViewingHistory | undefined>;
  getContinueWatchingList(userId: number, profileId?: number, limit?: number): Promise<any[]>;

  // Profiles
  getUserProfiles(userId: number): Promise<UserProfile[]>;
  getUserProfile(profileId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(profileId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  deleteUserProfile(profileId: number): Promise<void>;

  // Sessions
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSessions(userId: number): Promise<UserSession[]>;
  getUserSession(sessionId: number): Promise<UserSession | undefined>;
  deleteSession(sessionId: number): Promise<void>;
  deleteAllUserSessions(userId: number): Promise<void>;

  // Recommendations
  getTrendingContent(limit?: number): Promise<any[]>;
  getRecommendedContent(userId: number, limit?: number): Promise<any[]>;

  // Audio & Subtitles
  getAudioTracks(contentId: number): Promise<AudioTrack[]>;
  createAudioTrack(track: InsertAudioTrack): Promise<AudioTrack>;
  deleteAudioTrack(trackId: number): Promise<void>;

  getSubtitles(contentId: number): Promise<Subtitle[]>;
  createSubtitle(subtitle: InsertSubtitle): Promise<Subtitle>;
  deleteSubtitle(subtitleId: number): Promise<void>;

  // Downloads
  createDownload(download: InsertDownload): Promise<Download>;
  getDownload(downloadId: number): Promise<Download | undefined>;
  getUserDownloads(userId: number): Promise<Download[]>;
  updateDownload(downloadId: number, download: Partial<InsertDownload>): Promise<Download | undefined>;
  deleteDownload(downloadId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Movies
  async getMovies(): Promise<Movie[]> {
    return await db.select().from(movies).orderBy(desc(movies.createdAt));
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie || undefined;
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [newMovie] = await db.insert(movies).values(movie).returning();
    return newMovie;
  }

  async updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined> {
    const [updated] = await db
      .update(movies)
      .set({ ...movie, updatedAt: new Date() })
      .where(eq(movies.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteMovie(id: number): Promise<void> {
    await db.delete(movies).where(eq(movies.id, id));
  }

  // Series
  async getAllSeries(): Promise<Series[]> {
    return await db.select().from(series).orderBy(desc(series.createdAt));
  }

  async getSeries(id: number): Promise<Series | undefined> {
    const [show] = await db.select().from(series).where(eq(series.id, id));
    return show || undefined;
  }

  async createSeries(seriesData: InsertSeries): Promise<Series> {
    const [newSeries] = await db.insert(series).values(seriesData).returning();
    return newSeries;
  }

  async updateSeries(id: number, seriesData: Partial<InsertSeries>): Promise<Series | undefined> {
    const [updated] = await db
      .update(series)
      .set({ ...seriesData, updatedAt: new Date() })
      .where(eq(series.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSeries(id: number): Promise<void> {
    await db.delete(series).where(eq(series.id, id));
  }

  // Episodes
  async getEpisodesBySeries(seriesId: number): Promise<Episode[]> {
    return await db
      .select()
      .from(episodes)
      .where(eq(episodes.seriesId, seriesId))
      .orderBy(episodes.seasonNumber, episodes.episodeNumber);
  }

  async getEpisode(id: number): Promise<Episode | undefined> {
    const [episode] = await db.select().from(episodes).where(eq(episodes.id, id));
    return episode || undefined;
  }

  async createEpisode(episode: InsertEpisode): Promise<Episode> {
    const [newEpisode] = await db.insert(episodes).values(episode).returning();
    return newEpisode;
  }

  async updateEpisode(id: number, episode: Partial<InsertEpisode>): Promise<Episode | undefined> {
    const [updated] = await db
      .update(episodes)
      .set(episode)
      .where(eq(episodes.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEpisode(id: number): Promise<void> {
    await db.delete(episodes).where(eq(episodes.id, id));
  }

  // Channels
  async getChannels(): Promise<Channel[]> {
    return await db.select().from(channels).orderBy(desc(channels.createdAt));
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel || undefined;
  }

  async createChannel(channel: InsertChannel): Promise<Channel> {
    const [newChannel] = await db.insert(channels).values(channel).returning();
    return newChannel;
  }

  async updateChannel(id: number, channel: Partial<InsertChannel>): Promise<Channel | undefined> {
    const [updated] = await db
      .update(channels)
      .set({ ...channel, updatedAt: new Date() })
      .where(eq(channels.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteChannel(id: number): Promise<void> {
    await db.delete(channels).where(eq(channels.id, id));
  }

  // App Users
  async getAppUsers(): Promise<AppUser[]> {
    return await db.select().from(appUsers).orderBy(desc(appUsers.joinedAt));
  }

  async getAppUser(id: number): Promise<AppUser | undefined> {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.id, id));
    return user || undefined;
  }

  async getAppUserByEmail(email: string): Promise<AppUser | undefined> {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.email, email));
    return user || undefined;
  }

  async createAppUser(user: InsertAppUser): Promise<AppUser> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
    const [newUser] = await db.insert(appUsers).values({
      ...user,
      passwordHash: hashedPassword,
    }).returning();
    return newUser;
  }
  
  async generateAuthToken(user: AppUser): Promise<string> {
    return generateToken({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    });
  }
  
  async getStripeCustomerByEmail(email: string): Promise<any> {
    try {
      const [user] = await db.select().from(appUsers).where(eq(appUsers.email, email));
      return user?.stripeCustomerId ? { id: user.stripeCustomerId } : null;
    } catch (error) {
      return null;
    }
  }

  async updateAppUser(id: number, user: Partial<InsertAppUser>): Promise<AppUser | undefined> {
    const [updated] = await db
      .update(appUsers)
      .set(user)
      .where(eq(appUsers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAppUser(id: number): Promise<void> {
    await db.delete(appUsers).where(eq(appUsers.id, id));
  }

  // Admins
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.price);
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  async updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updated] = await db
      .update(subscriptionPlans)
      .set(plan)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSubscriptionPlan(id: number): Promise<void> {
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  }

  // Channel Content
  async addContentToChannel(content: InsertChannelContent): Promise<ChannelContent> {
    const [newContent] = await db.insert(channelContent).values(content).returning();
    return newContent;
  }

  async getChannelContent(channelId: number): Promise<any[]> {
    const channelContentList = await db
      .select()
      .from(channelContent)
      .where(eq(channelContent.channelId, channelId));
    
    const result = [];
    for (const cc of channelContentList) {
      if (cc.contentType === "movie") {
        const movie = await this.getMovie(cc.contentId);
        if (movie) result.push({ ...movie, contentType: "movie" });
      } else if (cc.contentType === "series") {
        const show = await this.getSeries(cc.contentId);
        if (show) result.push({ ...show, contentType: "series" });
      }
    }
    return result;
  }

  async removeContentFromChannel(contentId: number, channelId: number): Promise<void> {
    await db
      .delete(channelContent)
      .where(and(eq(channelContent.contentId, contentId), eq(channelContent.channelId, channelId)));
  }

  // Search & Filter
  async searchMovies(query: string, genre?: string, status?: string): Promise<Movie[]> {
    let query_builder = db.select().from(movies);
    const conditions: any[] = [];

    if (query) {
      conditions.push(or(
        ilike(movies.title, `%${query}%`),
        ilike(movies.description, `%${query}%`)
      ));
    }
    if (genre) {
      conditions.push(ilike(movies.genre, `%${genre}%`));
    }
    if (status) {
      conditions.push(eq(movies.status, status));
    }

    if (conditions.length > 0) {
      return await query_builder.where(and(...conditions)).orderBy(desc(movies.createdAt));
    }
    return await query_builder.orderBy(desc(movies.createdAt));
  }

  async searchSeries(query: string, genre?: string, status?: string): Promise<Series[]> {
    let query_builder = db.select().from(series);
    const conditions: any[] = [];

    if (query) {
      conditions.push(or(
        ilike(series.title, `%${query}%`),
        ilike(series.description, `%${query}%`)
      ));
    }
    if (genre) {
      conditions.push(ilike(series.genre, `%${genre}%`));
    }
    if (status) {
      conditions.push(eq(series.status, status));
    }

    if (conditions.length > 0) {
      return await query_builder.where(and(...conditions)).orderBy(desc(series.createdAt));
    }
    return await query_builder.orderBy(desc(series.createdAt));
  }

  // API Keys
  async createApiKey(key: InsertApiKey): Promise<ApiKey> {
    const [newKey] = await db.insert(apiKeys).values(key).returning();
    return newKey;
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
  }

  async getApiKey(keyId: number): Promise<ApiKey | undefined> {
    const [key] = await db.select().from(apiKeys).where(eq(apiKeys.id, keyId));
    return key || undefined;
  }

  async revokeApiKey(keyId: number): Promise<ApiKey | undefined> {
    const [revoked] = await db
      .update(apiKeys)
      .set({ status: "revoked", revokedAt: new Date() })
      .where(eq(apiKeys.id, keyId))
      .returning();
    return revoked || undefined;
  }

  async verifyApiKey(key: string, secret: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.key, key), eq(apiKeys.secret, secret), eq(apiKeys.status, "active")));
    return apiKey || undefined;
  }

  // Files
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async getFileByStorageKey(storageKey: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.storageKey, storageKey));
    return file || undefined;
  }

  async getFilesByOwner(ownerUserId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.ownerUserId, ownerUserId)).orderBy(desc(files.uploadedAt));
  }

  async getFilesByRelatedContent(relatedContentId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.relatedContentId, relatedContentId));
  }

  async updateFile(id: number, file: Partial<InsertFile>): Promise<File | undefined> {
    const [updated] = await db
      .update(files)
      .set(file)
      .where(eq(files.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async deleteFileByStorageKey(storageKey: string): Promise<void> {
    await db.delete(files).where(eq(files.storageKey, storageKey));
  }

  // User Favorites
  async addFavorite(favorite: InsertUserFavorites): Promise<UserFavorites> {
    const [newFavorite] = await db.insert(userFavorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: number, contentId: number, contentType: string): Promise<void> {
    await db.delete(userFavorites).where(
      and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.contentId, contentId),
        eq(userFavorites.contentType, contentType)
      )
    );
  }

  async getUserFavorites(userId: number): Promise<UserFavorites[]> {
    return await db.select().from(userFavorites).where(eq(userFavorites.userId, userId)).orderBy(desc(userFavorites.addedAt));
  }

  async isFavorite(userId: number, contentId: number, contentType: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.contentId, contentId),
          eq(userFavorites.contentType, contentType)
        )
      );
    return !!favorite;
  }

  // User Watchlist
  async addToWatchlist(watchlist: InsertUserWatchlist): Promise<UserWatchlist> {
    const [newWatchlist] = await db.insert(userWatchlist).values(watchlist).returning();
    return newWatchlist;
  }

  async removeFromWatchlist(userId: number, contentId: number, contentType: string): Promise<void> {
    await db.delete(userWatchlist).where(
      and(
        eq(userWatchlist.userId, userId),
        eq(userWatchlist.contentId, contentId),
        eq(userWatchlist.contentType, contentType)
      )
    );
  }

  async getUserWatchlist(userId: number): Promise<UserWatchlist[]> {
    return await db.select().from(userWatchlist).where(eq(userWatchlist.userId, userId)).orderBy(desc(userWatchlist.lastWatchedAt));
  }

  async updateWatchlistProgress(userId: number, contentId: number, contentType: string, percentage: number): Promise<UserWatchlist | undefined> {
    const [updated] = await db
      .update(userWatchlist)
      .set({ watchedPercentage: percentage, lastWatchedAt: new Date() })
      .where(
        and(
          eq(userWatchlist.userId, userId),
          eq(userWatchlist.contentId, contentId),
          eq(userWatchlist.contentType, contentType)
        )
      )
      .returning();
    return updated || undefined;
  }

  // Profiles
  async getUserProfiles(userId: number): Promise<UserProfile[]> {
    return await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).orderBy(userProfiles.createdAt);
  }

  async getUserProfile(profileId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, profileId));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(profileId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db
      .update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.id, profileId))
      .returning();
    return updated || undefined;
  }

  async deleteUserProfile(profileId: number): Promise<void> {
    await db.delete(userProfiles).where(eq(userProfiles.id, profileId));
  }

  // Sessions
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db.insert(userSessions).values(session).returning();
    return newSession;
  }

  async getUserSessions(userId: number): Promise<UserSession[]> {
    return await db.select().from(userSessions).where(eq(userSessions.userId, userId));
  }

  async getUserSession(sessionId: number): Promise<UserSession | undefined> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.id, sessionId));
    return session || undefined;
  }

  async deleteSession(sessionId: number): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.id, sessionId));
  }

  async deleteAllUserSessions(userId: number): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
  }

  // Viewing History
  async recordViewingHistory(history: InsertViewingHistory): Promise<ViewingHistory> {
    const [newHistory] = await db.insert(viewingHistory).values(history).returning();
    return newHistory;
  }

  async getViewingHistory(userId: number, profileId?: number): Promise<ViewingHistory[]> {
    if (profileId) {
      return await db
        .select()
        .from(viewingHistory)
        .where(and(eq(viewingHistory.userId, userId), eq(viewingHistory.profileId, profileId)))
        .orderBy(desc(viewingHistory.lastWatchedAt));
    }
    return await db.select().from(viewingHistory).where(eq(viewingHistory.userId, userId)).orderBy(desc(viewingHistory.lastWatchedAt));
  }

  async getViewingHistoryItem(userId: number, contentType: string, contentId: number): Promise<ViewingHistory | undefined> {
    const [item] = await db
      .select()
      .from(viewingHistory)
      .where(
        and(
          eq(viewingHistory.userId, userId),
          eq(viewingHistory.contentType, contentType),
          eq(viewingHistory.contentId, contentId)
        )
      );
    return item || undefined;
  }

  async updateViewingProgress(userId: number, contentId: number, currentTime: number, duration: number): Promise<ViewingHistory | undefined> {
    const completionPercentage = Math.round((currentTime / duration) * 100);
    const [updated] = await db
      .update(viewingHistory)
      .set({ currentTimeSeconds: currentTime, completionPercentage, lastWatchedAt: new Date() })
      .where(
        and(
          eq(viewingHistory.userId, userId),
          eq(viewingHistory.contentId, contentId)
        )
      )
      .returning();
    return updated || undefined;
  }

  async getContinueWatchingList(userId: number, profileId?: number, limit = 10): Promise<any[]> {
    let query = db
      .select()
      .from(viewingHistory)
      .where(
        and(
          eq(viewingHistory.userId, userId),
          profileId ? eq(viewingHistory.profileId, profileId) : undefined
        )
      )
      .orderBy(desc(viewingHistory.lastWatchedAt))
      .limit(limit);

    return await query;
  }

  // Trending & Recommendations
  async getTrendingContent(limit = 20): Promise<any[]> {
    const trendingMovies = await db
      .select()
      .from(movies)
      .where(eq(movies.status, "active"))
      .orderBy(desc(movies.views))
      .limit(Math.ceil(limit / 2));

    const trendingSeries = await db
      .select()
      .from(series)
      .where(eq(series.status, "active"))
      .orderBy(desc(series.createdAt))
      .limit(Math.ceil(limit / 2));

    return [...trendingMovies, ...trendingSeries];
  }

  async getRecommendedContent(userId: number, limit = 20): Promise<any[]> {
    // Get user's viewing history to understand preferences
    const history = await this.getViewingHistory(userId);
    const watchedIds = history.map(h => h.contentId);

    // Get trending content excluding watched items
    const recommended = await db
      .select()
      .from(movies)
      .where(and(eq(movies.status, "active")))
      .orderBy(desc(movies.views))
      .limit(limit);

    return recommended.filter(m => !watchedIds.includes(m.id));
  }

  // Audio Tracks
  async getAudioTracks(contentId: number): Promise<AudioTrack[]> {
    return await db.select().from(audioTracks).where(eq(audioTracks.contentId, contentId));
  }

  async createAudioTrack(track: InsertAudioTrack): Promise<AudioTrack> {
    const [newTrack] = await db.insert(audioTracks).values(track).returning();
    return newTrack;
  }

  async deleteAudioTrack(trackId: number): Promise<void> {
    await db.delete(audioTracks).where(eq(audioTracks.id, trackId));
  }

  // Subtitles
  async getSubtitles(contentId: number): Promise<Subtitle[]> {
    return await db.select().from(subtitles).where(eq(subtitles.contentId, contentId));
  }

  async createSubtitle(subtitle: InsertSubtitle): Promise<Subtitle> {
    const [newSubtitle] = await db.insert(subtitles).values(subtitle).returning();
    return newSubtitle;
  }

  async deleteSubtitle(subtitleId: number): Promise<void> {
    await db.delete(subtitles).where(eq(subtitles.id, subtitleId));
  }

  // Downloads
  async createDownload(download: InsertDownload): Promise<Download> {
    const [newDownload] = await db.insert(downloads).values(download).returning();
    return newDownload;
  }

  async getDownload(downloadId: number): Promise<Download | undefined> {
    const [download] = await db.select().from(downloads).where(eq(downloads.id, downloadId));
    return download || undefined;
  }

  async getUserDownloads(userId: number): Promise<Download[]> {
    return await db.select().from(downloads).where(eq(downloads.userId, userId)).orderBy(desc(downloads.downloadedAt));
  }

  async updateDownload(downloadId: number, download: Partial<InsertDownload>): Promise<Download | undefined> {
    const [updated] = await db
      .update(downloads)
      .set(download)
      .where(eq(downloads.id, downloadId))
      .returning();
    return updated || undefined;
  }

  async deleteDownload(downloadId: number): Promise<void> {
    await db.delete(downloads).where(eq(downloads.id, downloadId));
  }
}

export const storage = new DatabaseStorage();
