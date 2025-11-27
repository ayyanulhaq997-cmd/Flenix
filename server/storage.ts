import { 
  movies, series, episodes, channels, appUsers, admins, subscriptionPlans, channelContent, apiKeys, files,
  type Movie, type InsertMovie,
  type Series, type InsertSeries,
  type Episode, type InsertEpisode,
  type Channel, type InsertChannel,
  type AppUser, type InsertAppUser,
  type Admin, type InsertAdmin,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type ChannelContent, type InsertChannelContent,
  type ApiKey, type InsertApiKey,
  type File, type InsertFile
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, ilike, or } from "drizzle-orm";

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
    const [newUser] = await db.insert(appUsers).values(user).returning();
    return newUser;
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
}

export const storage = new DatabaseStorage();
