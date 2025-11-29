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
      final response = await http.post(
        Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.loginEndpoint}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final loginResponse = LoginResponse(
          token: data['token'] ?? '',
          user: AppUser(
            id: data['id'] ?? 0,
            email: data['email'] ?? '',
            name: data['name'] ?? '',
            subscriptionPlan: data['plan'] ?? 'free',
            isActive: true,
          ),
          expiresIn: 604800,
        );
        
        await storage.write(key: _tokenKey, value: loginResponse.token);
        return loginResponse;
      } else {
        throw Exception('Login failed');
      }
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
