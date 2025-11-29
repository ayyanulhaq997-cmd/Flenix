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
      final url = '${ApiConfig.apiBaseUrl}${ApiConfig.loginEndpoint}';
      
      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode != 200) {
        throw Exception('HTTP ${response.statusCode}');
      }

      // Parse response - handle both string and already-decoded responses
      dynamic responseData = response.body;
      if (responseData is String) {
        responseData = jsonDecode(responseData);
      }

      // Extract values safely with fallbacks
      String token = '';
      String userEmail = '';
      String userName = '';
      String userPlan = '';
      int userId = 0;

      if (responseData is Map) {
        token = (responseData['token'] ?? '').toString();
        userEmail = (responseData['email'] ?? '').toString();
        userName = (responseData['name'] ?? 'User').toString();
        userPlan = (responseData['plan'] ?? 'free').toString();
        userId = int.tryParse((responseData['id'] ?? '0').toString()) ?? 0;
      }

      if (token.isEmpty) {
        throw Exception('No token received');
      }

      final user = AppUser(
        id: userId,
        email: userEmail,
        name: userName,
        subscriptionPlan: userPlan,
        isActive: true,
      );

      final response2 = LoginResponse(
        token: token,
        user: user,
        expiresIn: 604800,
      );

      await storage.write(key: _tokenKey, value: token);
      return response2;
    } catch (e) {
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
