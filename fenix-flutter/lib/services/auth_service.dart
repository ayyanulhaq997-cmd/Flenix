import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
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
      
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode != 200) {
        throw Exception('Login failed: HTTP ${response.statusCode}');
      }

      // Get response body
      final String responseBody = response.body;
      if (responseBody.isEmpty) {
        throw Exception('Empty response from server');
      }

      // Decode JSON carefully
      final dynamic decoded = jsonDecode(responseBody);
      
      // Make sure we have a map
      if (decoded == null) {
        throw Exception('Response is null');
      }
      
      if (decoded is! Map) {
        throw Exception('Response is not a JSON object');
      }

      // Now safely cast
      final Map<String, dynamic> data = decoded as Map<String, dynamic>;

      // Extract token
      final token = data['token'];
      if (token == null) {
        throw Exception('No token in response');
      }

      // Build user
      final user = AppUser(
        id: (data['id'] ?? 0) as int,
        email: (data['email'] ?? '') as String,
        name: (data['name'] ?? 'User') as String,
        subscriptionPlan: (data['plan'] ?? 'free') as String,
        isActive: true,
      );

      final loginResponse = LoginResponse(
        token: token as String,
        user: user,
        expiresIn: 604800,
      );

      await storage.write(key: _tokenKey, value: loginResponse.token);
      return loginResponse;
    } catch (e) {
      throw Exception('Login error: ${e.toString()}');
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
