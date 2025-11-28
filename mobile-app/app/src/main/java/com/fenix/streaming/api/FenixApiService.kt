package com.fenix.streaming.api

import com.fenix.streaming.models.AppUser
import com.fenix.streaming.models.LoginRequest
import com.fenix.streaming.models.LoginResponse
import com.fenix.streaming.models.Movie
import retrofit2.Response
import retrofit2.http.*

/**
 * Fenix Streaming API Service
 * 
 * Defines all REST endpoints for communicating with Fenix backend
 */
interface FenixApiService {

    // ============ AUTHENTICATION ============
    
    /**
     * Login with email and password
     * Returns JWT token for authenticated requests
     */
    @POST("/api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    // ============ MOVIES ============
    
    /**
     * Get list of all available movies
     * Requires valid JWT token in Authorization header
     */
    @GET("/api/movies")
    suspend fun getMovies(
        @Header("Authorization") token: String
    ): Response<List<Movie>>

    /**
     * Get specific movie by ID
     */
    @GET("/api/movies/{id}")
    suspend fun getMovie(
        @Path("id") movieId: Int,
        @Header("Authorization") token: String
    ): Response<Movie>

    // ============ USER PROFILE ============
    
    /**
     * Get current user's profile
     */
    @GET("/api/app-users/{id}")
    suspend fun getUserProfile(
        @Path("id") userId: Int,
        @Header("Authorization") token: String
    ): Response<AppUser>

    /**
     * Update user profile
     */
    @PUT("/api/app-users/{id}")
    suspend fun updateUserProfile(
        @Path("id") userId: Int,
        @Body user: AppUser,
        @Header("Authorization") token: String
    ): Response<AppUser>
}
