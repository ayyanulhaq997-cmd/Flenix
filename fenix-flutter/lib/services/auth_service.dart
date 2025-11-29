import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:developer' as developer;
import '../config/api_config.dart';
import '../models/movie.dart';

/// Authentication Service
class AuthService {
  static const String _tokenKey = 'jwt_token';
  
  final storage = const FlutterSecureStorage();

  /// Login with email and password
  Future<LoginResponse> login(String email, String password) async {
    try {
      final url = Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.loginEndpoint}');
      developer.log('Login URL: $url');
      developer.log('Email: $email');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 30));

      developer.log('Response status: ${response.statusCode}');
      developer.log('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body);
        developer.log('Parsed JSON: $jsonData');

        // Extract token with fallback
        final token = jsonData['token'] as String?;
        if (token == null || token.isEmpty) {
          throw Exception('No token in response');
        }

        // Build user object
        final user = AppUser(
          id: jsonData['id'] as int? ?? 0,
          email: jsonData['email'] as String? ?? '',
          name: jsonData['name'] as String? ?? 'User',
          subscriptionPlan: jsonData['plan'] as String? ?? 'free',
          isActive: true,
        );

        final loginResponse = LoginResponse(
          token: token,
          user: user,
          expiresIn: 604800,
        );

        await storage.write(key: _tokenKey, value: token);
        developer.log('Login successful, token saved');
        return loginResponse;
      } else {
        final errorBody = response.body;
        developer.log('Login failed with status ${response.statusCode}: $errorBody');
        throw Exception('Login failed: ${response.statusCode}');
      }
    } catch (e) {
      developer.log('Login exception: $e');
      rethrow;
    }
  }

  /// Get stored JWT token
  Future<String?> getToken() async {
    return await storage.read(key: _tokenKey);
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  /// Logout
  Future<void> logout() async {
    await storage.delete(key: _tokenKey);
  }
}
