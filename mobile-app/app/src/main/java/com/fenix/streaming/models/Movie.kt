package com.fenix.streaming.models

import com.google.gson.annotations.SerializedName
import java.io.Serializable

/**
 * Movie data model matching Fenix backend schema
 */
data class Movie(
    val id: Int,
    val title: String,
    val genre: String,
    val year: Int,
    val description: String,
    @SerializedName("posterUrl")
    val posterUrl: String?,
    @SerializedName("videoUrl")
    val videoUrl: String?,
    val duration: Int?,
    val cast: String?,
    val status: String = "active",
    @SerializedName("requiredPlan")
    val requiredPlan: String = "free",
    val views: Int = 0,
    val rating: String = "TV-14"
) : Serializable

/**
 * User subscription model
 */
data class AppUser(
    val id: Int,
    val email: String,
    val name: String,
    @SerializedName("subscriptionPlan")
    val subscriptionPlan: String = "free",
    @SerializedName("isActive")
    val isActive: Boolean = true
) : Serializable

/**
 * Authentication request
 */
data class LoginRequest(
    val email: String,
    val password: String
)

/**
 * Authentication response (JWT token)
 */
data class LoginResponse(
    val token: String,
    val user: AppUser,
    val expiresIn: Long
)

/**
 * API Error response
 */
data class ApiError(
    val error: String,
    val message: String? = null
)
