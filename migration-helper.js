#!/usr/bin/env node

/**
 * Fenix Data Migration Helper
 * 
 * This script exports data from the legacy "crack server" database
 * and converts it to Fenix JSON format for bulk import.
 * 
 * Usage:
 *   node migration-helper.js --source postgresql://user:pass@legacy-server/db --output fenix-import.json
 *   
 * Then import via dashboard: Migration → Import Data → Select fenix-import.json
 */

const fs = require('fs');
const path = require('path');

// Mock legacy database schema and data structure
// In production, replace with actual legacy DB connection

const LEGACY_MOVIE_QUERY = `
  SELECT 
    id, title, genre, year, 
    description, cast, thumbnail as posterUrl,
    video_file as videoUrl, duration,
    'active' as status, 'free' as requiredPlan
  FROM movies
  WHERE deleted_at IS NULL
`;

const LEGACY_SERIES_QUERY = `
  SELECT 
    id, title, genre, seasons as totalSeasons,
    description, cast, thumbnail as posterUrl,
    rating, 'active' as status, 'standard' as requiredPlan
  FROM series
  WHERE deleted_at IS NULL
`;

const LEGACY_EPISODES_QUERY = `
  SELECT 
    id, series_id as seriesId, season as seasonNumber, 
    episode as episodeNumber, title, description,
    video_file as videoUrl, file_name as fileName,
    file_size as fileSize, duration,
    'active' as status
  FROM episodes
  WHERE deleted_at IS NULL
  ORDER BY series_id, season, episode
`;

const LEGACY_CHANNELS_QUERY = `
  SELECT 
    id, name, category, stream_url as streamUrl,
    channel_logo as logoUrl, 'online' as status
  FROM channels
  WHERE deleted_at IS NULL
`;

const LEGACY_USERS_QUERY = `
  SELECT 
    id, name, email, 'active' as status, 
    'free' as plan, user_hash as passwordHash
  FROM users
  WHERE deleted_at IS NULL
`;

/**
 * Example: Convert legacy data to Fenix format
 */
function migrateLegacyData() {
  // Mock data - replace with actual legacy database queries
  
  const movies = [
    {
      title: "Inception",
      genre: "Sci-Fi",
      year: 2010,
      description: "A skilled thief...",
      cast: ["Leonardo DiCaprio", "Marion Cotillard"],
      posterUrl: "https://example.com/inception.jpg",
      videoUrl: "https://legacy-server.com/movies/inception.mp4",
      duration: 148,
      status: "active",
      requiredPlan: "premium"
    },
    {
      title: "The Matrix",
      genre: "Sci-Fi",
      year: 1999,
      description: "A computer hacker...",
      cast: ["Keanu Reeves", "Laurence Fishburne"],
      posterUrl: "https://example.com/matrix.jpg",
      videoUrl: "https://legacy-server.com/movies/matrix.mp4",
      duration: 136,
      status: "active",
      requiredPlan: "standard"
    }
  ];

  const series = [
    {
      title: "Breaking Bad",
      genre: "Drama",
      totalSeasons: 5,
      description: "A chemistry teacher...",
      cast: ["Bryan Cranston", "Aaron Paul"],
      posterUrl: "https://example.com/breaking-bad.jpg",
      rating: "9.5",
      status: "active",
      requiredPlan: "standard"
    }
  ];

  const episodes = [
    {
      seriesId: 1,
      seasonNumber: 1,
      episodeNumber: 1,
      title: "Pilot",
      description: "A high school chemistry teacher...",
      videoUrl: "https://legacy-server.com/episodes/s01e01.mp4",
      fileName: "breaking_bad_s01e01.mp4",
      fileSize: 524288000,
      duration: 58,
      status: "active"
    },
    {
      seriesId: 1,
      seasonNumber: 1,
      episodeNumber: 2,
      title: "Cat's in the Bag",
      description: "Walt and Jesse deal with their captive...",
      videoUrl: "https://legacy-server.com/episodes/s01e02.mp4",
      fileName: "breaking_bad_s01e02.mp4",
      fileSize: 537395200,
      duration: 60,
      status: "active"
    }
  ];

  const channels = [
    {
      name: "Béisbol Dominicano 1",
      category: "Sports",
      streamUrl: "https://legacy-server.com/streams/baseball-1.m3u8",
      logoUrl: "https://example.com/baseball-logo.png",
      status: "online"
    },
    {
      name: "HBO",
      category: "Movies",
      streamUrl: "https://legacy-server.com/streams/hbo.m3u8",
      logoUrl: "https://example.com/hbo-logo.png",
      status: "online"
    }
  ];

  const users = [
    {
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed_password_here",
      status: "active",
      plan: "premium"
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      passwordHash: "hashed_password_here",
      status: "active",
      plan: "standard"
    }
  ];

  return {
    exportedAt: new Date().toISOString(),
    movies,
    series,
    episodes,
    channels,
    users,
    metadata: {
      sourceSystem: "Legacy Crack Server",
      exportVersion: "1.0",
      itemCounts: {
        movies: movies.length,
        series: series.length,
        episodes: episodes.length,
        channels: channels.length,
        users: users.length
      }
    }
  };
}

/**
 * Transform legacy cast format to array
 */
function transformCast(legacyCast) {
  if (!legacyCast) return [];
  if (Array.isArray(legacyCast)) return legacyCast;
  if (typeof legacyCast === 'string') {
    return legacyCast.split(',').map(name => name.trim());
  }
  return [];
}

/**
 * Map legacy subscription plans to Fenix plans
 */
function mapSubscriptionPlan(legacyPlan) {
  const planMap = {
    'free': 'free',
    'basic': 'standard',
    'premium': 'premium',
    'vip': 'premium',
    '': 'free'
  };
  return planMap[legacyPlan?.toLowerCase()] || 'free';
}

/**
 * Validate migrated data
 */
function validateData(data) {
  const errors = [];

  // Validate movies
  data.movies?.forEach((movie, idx) => {
    if (!movie.title) errors.push(`Movie[${idx}]: Missing title`);
    if (!movie.genre) errors.push(`Movie[${idx}]: Missing genre`);
    if (!movie.posterUrl) errors.push(`Movie[${idx}]: Missing posterUrl`);
  });

  // Validate series
  data.series?.forEach((show, idx) => {
    if (!show.title) errors.push(`Series[${idx}]: Missing title`);
    if (!show.genre) errors.push(`Series[${idx}]: Missing genre`);
    if (!show.totalSeasons) errors.push(`Series[${idx}]: Missing totalSeasons`);
  });

  // Validate episodes
  data.episodes?.forEach((ep, idx) => {
    if (!ep.seriesId) errors.push(`Episode[${idx}]: Missing seriesId`);
    if (!ep.seasonNumber) errors.push(`Episode[${idx}]: Missing seasonNumber`);
    if (!ep.episodeNumber) errors.push(`Episode[${idx}]: Missing episodeNumber`);
    if (!ep.title) errors.push(`Episode[${idx}]: Missing title`);
  });

  // Validate channels
  data.channels?.forEach((ch, idx) => {
    if (!ch.name) errors.push(`Channel[${idx}]: Missing name`);
    if (!ch.category) errors.push(`Channel[${idx}]: Missing category`);
    if (!ch.streamUrl) errors.push(`Channel[${idx}]: Missing streamUrl`);
  });

  // Validate users
  data.users?.forEach((user, idx) => {
    if (!user.email) errors.push(`User[${idx}]: Missing email`);
    if (!user.passwordHash) errors.push(`User[${idx}]: Missing passwordHash`);
  });

  return errors;
}

/**
 * Main migration function
 */
async function main() {
  try {
    console.log('🚀 Fenix Data Migration Helper');
    console.log('==============================\n');

    // Get source and output from CLI args or use defaults
    const outputFile = process.argv[3] || 'fenix-import.json';
    
    console.log('📊 Extracting data from legacy system...');
    const legacyData = migrateLegacyData();
    
    console.log(`✅ Extracted:`);
    console.log(`   - ${legacyData.movies.length} movies`);
    console.log(`   - ${legacyData.series.length} series`);
    console.log(`   - ${legacyData.episodes.length} episodes`);
    console.log(`   - ${legacyData.channels.length} channels`);
    console.log(`   - ${legacyData.users.length} users\n`);

    // Validate data
    console.log('🔍 Validating migration data...');
    const validationErrors = validateData(legacyData);
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors found:');
      validationErrors.forEach(err => console.error(`   - ${err}`));
      process.exit(1);
    }
    
    console.log('✅ All data validated successfully\n');

    // Save to file
    console.log(`💾 Saving to ${outputFile}...`);
    fs.writeFileSync(outputFile, JSON.stringify(legacyData, null, 2));
    
    const fileSize = (fs.statSync(outputFile).size / 1024).toFixed(2);
    console.log(`✅ Export complete: ${fileSize} KB\n`);

    console.log('📝 Next steps:');
    console.log('1. Log into Fenix dashboard');
    console.log('2. Go to: Sidebar → Migration → Import Data');
    console.log(`3. Select the file: ${outputFile}`);
    console.log('4. Click "Import" and wait for confirmation\n');

    console.log('📌 Important Notes:');
    console.log('   - Video files must be uploaded separately to your streaming server');
    console.log('   - Update streamUrl/videoUrl to point to new CDN after import');
    console.log('   - Verify all content displays correctly in mobile app');
    console.log('   - Test streaming URLs with 1-hour token expiration\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
main();
