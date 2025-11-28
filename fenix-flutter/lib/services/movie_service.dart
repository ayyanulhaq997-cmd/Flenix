import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/movie.dart';
import 'auth_service.dart';

/// Movie Service
/// Handles all movie-related API calls
class MovieService {
  final AuthService authService = AuthService();

  /// Fetch all available movies
  Future<List<Movie>> getMovies() async {
    try {
      final token = await authService.getToken();
      if (token == null) {
        throw Exception('Not authenticated. Please login.');
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.moviesEndpoint}'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: ApiConfig.readTimeoutSeconds),
      );

      if (response.statusCode == 200) {
        final List<dynamic> movieList = jsonDecode(response.body) as List<dynamic>;
        return movieList
            .map((json) => Movie.fromJson(json as Map<String, dynamic>))
            .toList();
      } else if (response.statusCode == 401) {
        // Token expired, need to login again
        throw Exception('Session expired. Please login again.');
      } else {
        throw Exception('Failed to load movies: ${response.statusCode}');
      }
    } on http.ClientException {
      throw Exception('Network error. Check your connection and API endpoint.');
    } catch (e) {
      rethrow;
    }
  }

  /// Fetch single movie by ID
  Future<Movie> getMovie(int movieId) async {
    try {
      final token = await authService.getToken();
      if (token == null) {
        throw Exception('Not authenticated');
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.moviesEndpoint}/$movieId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: ApiConfig.readTimeoutSeconds),
      );

      if (response.statusCode == 200) {
        return Movie.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
      } else {
        throw Exception('Failed to load movie: ${response.statusCode}');
      }
    } on http.ClientException {
      throw Exception('Network error');
    }
  }
}
