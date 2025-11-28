import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/movie.dart';

/// Authentication Service
/// Handles login and token management
class AuthService {
  static const String _tokenKey = 'jwt_token';
  static const String _userKey = 'user_data';
  
  final storage = const FlutterSecureStorage();

  /// Login with email and password
  /// Returns JWT token on success
  Future<LoginResponse> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.loginEndpoint}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      ).timeout(
        const Duration(seconds: ApiConfig.readTimeoutSeconds),
      );

      if (response.statusCode == 200) {
        final loginResponse = LoginResponse.fromJson(
          jsonDecode(response.body) as Map<String, dynamic>,
        );
        
        // Store token securely
        await storage.write(key: _tokenKey, value: loginResponse.token);
        await storage.write(key: _userKey, value: jsonEncode(loginResponse.user.toJson()));
        
        return loginResponse;
      } else {
        final error = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception(error['error'] ?? 'Login failed');
      }
    } on http.ClientException {
      throw Exception('Network error. Check your API endpoint.');
    } catch (e) {
      throw Exception('Login error: ${e.toString()}');
    }
  }

  /// Get stored JWT token
  Future<String?> getToken() async {
    return await storage.read(key: _tokenKey);
  }

  /// Get stored user data
  Future<AppUser?> getUser() async {
    final userJson = await storage.read(key: _userKey);
    if (userJson != null) {
      return AppUser.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
    }
    return null;
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  /// Logout - clear stored token and user
  Future<void> logout() async {
    await storage.delete(key: _tokenKey);
    await storage.delete(key: _userKey);
  }
}
