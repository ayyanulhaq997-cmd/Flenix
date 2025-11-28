package com.fenix.streaming.config

/**
 * API Configuration for Fenix Streaming Backend
 * 
 * Update FENIX_API_BASE_URL with your backend URL:
 * - Development: http://localhost:5000 (emulator: http://10.0.2.2:5000)
 * - Production: https://your-fenix-backend.com
 */
object ApiConfig {
    // ⚠️ UPDATE THIS WITH YOUR FENIX BACKEND URL
    const val FENIX_API_BASE_URL = "http://10.0.2.2:5000"
    
    // API Endpoints
    const val LOGIN_ENDPOINT = "/api/auth/login"
    const val MOVIES_ENDPOINT = "/api/movies"
    const val USERS_ENDPOINT = "/api/app-users"
    
    // JWT Token timeout (7 days in milliseconds)
    const val TOKEN_EXPIRY_MS = 7L * 24 * 60 * 60 * 1000
    
    // Retry configuration
    const val CONNECT_TIMEOUT_SECONDS = 30
    const val READ_TIMEOUT_SECONDS = 30
    const val WRITE_TIMEOUT_SECONDS = 30
}
