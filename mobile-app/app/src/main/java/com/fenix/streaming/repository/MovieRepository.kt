package com.fenix.streaming.repository

import com.fenix.streaming.api.FenixApiService
import com.fenix.streaming.models.LoginRequest
import com.fenix.streaming.models.LoginResponse
import com.fenix.streaming.models.Movie

/**
 * Repository for managing movie data and authentication
 * Separates API calls from UI logic
 */
class MovieRepository(private val apiService: FenixApiService) {

    /**
     * Authenticate user with email and password
     */
    suspend fun login(email: String, password: String): Result<LoginResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Login failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch all movies available to user
     */
    suspend fun getMovies(token: String): Result<List<Movie>> {
        return try {
            val response = apiService.getMovies("Bearer $token")
            
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch movies: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Fetch single movie details
     */
    suspend fun getMovie(movieId: Int, token: String): Result<Movie> {
        return try {
            val response = apiService.getMovie(movieId, "Bearer $token")
            
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch movie: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
