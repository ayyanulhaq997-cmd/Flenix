package com.fenix.streaming

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.fenix.streaming.api.FenixApiService
import com.fenix.streaming.config.ApiConfig
import com.fenix.streaming.models.Movie
import com.fenix.streaming.repository.MovieRepository
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * Main Activity - Entry point for Fenix Streaming App
 * 
 * This activity handles the complete flow:
 * 1. Login Screen - User authentication
 * 2. Movie Catalog - Browse available movies
 * 3. Player Screen - Watch selected movie
 */
class MainActivity : ComponentActivity() {
    
    // Lazy initialization of API service
    private val apiService: FenixApiService by lazy {
        Retrofit.Builder()
            .baseUrl(ApiConfig.FENIX_API_BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FenixApiService::class.java)
    }

    private val repository: MovieRepository by lazy {
        MovieRepository(apiService)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FenixApp(repository = repository)
        }
    }
}

/**
 * Main App Composable
 * Manages app state and navigation between screens
 */
@Composable
fun FenixApp(repository: MovieRepository) {
    var appState by remember { mutableStateOf<AppState>(AppState.Login) }
    var authToken by remember { mutableStateOf("") }
    var selectedMovie by remember { mutableStateOf<Movie?>(null) }

    MaterialTheme {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            when (appState) {
                is AppState.Login -> {
                    LoginScreen(
                        repository = repository,
                        onLoginSuccess = { token ->
                            authToken = token
                            appState = AppState.Catalog
                        }
                    )
                }
                is AppState.Catalog -> {
                    CatalogScreen(
                        repository = repository,
                        token = authToken,
                        onMovieSelected = { movie ->
                            selectedMovie = movie
                            appState = AppState.Player
                        },
                        onLogout = {
                            authToken = ""
                            appState = AppState.Login
                        }
                    )
                }
                is AppState.Player -> {
                    if (selectedMovie != null) {
                        PlayerScreen(
                            movie = selectedMovie!!,
                            onBack = {
                                appState = AppState.Catalog
                            }
                        )
                    }
                }
            }
        }
    }
}

/**
 * Login Screen - User authentication
 */
@Composable
fun LoginScreen(
    repository: MovieRepository,
    onLoginSuccess: (String) -> Unit
) {
    var email by remember { mutableStateOf("admin@fenix.local") }
    var password by remember { mutableStateOf("Admin@123456") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Fenix Logo
        Text(
            "FENIX",
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 48.dp)
        )

        // Email Input
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            enabled = !isLoading
        )

        // Password Input
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            type = PasswordVisualTransformation(),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            enabled = !isLoading
        )

        // Error Message
        if (errorMessage.isNotEmpty()) {
            Text(
                errorMessage,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(bottom = 16.dp)
            )
        }

        // Login Button
        Button(
            onClick = {
                isLoading = true
                scope.launch {
                    val result = repository.login(email, password)
                    result.onSuccess { loginResponse ->
                        onLoginSuccess(loginResponse.token)
                    }
                    result.onFailure { error ->
                        errorMessage = error.message ?: "Login failed"
                        isLoading = false
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Sign In")
            }
        }

        // Demo Text
        Text(
            "Demo: admin@fenix.local / Admin@123456",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 24.dp)
        )
    }
}

/**
 * Movie Catalog Screen - Browse movies
 */
@Composable
fun CatalogScreen(
    repository: MovieRepository,
    token: String,
    onMovieSelected: (Movie) -> Unit,
    onLogout: () -> Unit
) {
    var movies by remember { mutableStateOf<List<Movie>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf("") }

    val scope = rememberCoroutineScope()

    // Load movies on initial composition
    LaunchedEffect(token) {
        scope.launch {
            val result = repository.getMovies(token)
            result.onSuccess { fetchedMovies ->
                movies = fetchedMovies
                isLoading = false
            }
            result.onFailure { error ->
                errorMessage = error.message ?: "Failed to load movies"
                isLoading = false
            }
        }
    }

    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "FENIX",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Button(onClick = onLogout) {
                Text("Logout")
            }
        }

        // Content
        when {
            isLoading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            errorMessage.isNotEmpty() -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        errorMessage,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp)
                ) {
                    items(movies) { movie ->
                        MovieCard(
                            movie = movie,
                            onClick = { onMovieSelected(movie) }
                        )
                    }
                }
            }
        }
    }
}

/**
 * Movie Card Component - Displays movie information
 */
@Composable
fun MovieCard(
    movie: Movie,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            // Poster
            if (!movie.posterUrl.isNullOrEmpty()) {
                AsyncImage(
                    model = movie.posterUrl,
                    contentDescription = movie.title,
                    modifier = Modifier
                        .size(80.dp, 120.dp)
                        .padding(end = 12.dp),
                    contentScale = ContentScale.Crop
                )
            }

            // Movie Info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    movie.title,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    movie.genre,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    movie.year.toString(),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    movie.description,
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 2,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            // Play Button
            IconButton(
                onClick = onClick,
                modifier = Modifier.align(Alignment.CenterVertically)
            ) {
                Icon(
                    Icons.Filled.PlayArrow,
                    contentDescription = "Play",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

/**
 * Player Screen - Watch video
 */
@Composable
fun PlayerScreen(
    movie: Movie,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Button(onClick = onBack) {
                Text("← Back")
            }
            Text(
                movie.title,
                style = MaterialTheme.typography.titleMedium
            )
        }

        // Video Player Area
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp)
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            if (!movie.videoUrl.isNullOrEmpty()) {
                // TODO: Integrate ExoPlayer here
                // For now, show placeholder
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Filled.PlayArrow,
                        contentDescription = "Play",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Text("Video Player (ExoPlayer Integration)")
                }
            } else {
                Text("No video URL available")
            }
        }

        // Movie Details
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Text(
                movie.title,
                style = MaterialTheme.typography.headlineMedium
            )
            Text(
                "${movie.year} • ${movie.duration} min • ${movie.rating}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            Text(
                movie.description,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            Text(
                "Plan: ${movie.requiredPlan}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

/**
 * App State Enum - Manages navigation state
 */
sealed class AppState {
    object Login : AppState()
    object Catalog : AppState()
    object Player : AppState()
}
