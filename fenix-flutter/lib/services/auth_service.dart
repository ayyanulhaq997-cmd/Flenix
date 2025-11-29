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
        // Parse response body safely
        final Map<String, dynamic> jsonData;
        try {
          final decoded = jsonDecode(response.body);
          if (decoded is Map<String, dynamic>) {
            jsonData = decoded;
          } else {
            throw Exception('Response is not a JSON object');
          }
        } catch (e) {
          developer.log('JSON parse error: $e');
          throw Exception('Invalid JSON response: ${response.body}');
        }

        developer.log('Parsed JSON keys: ${jsonData.keys.toList()}');

        // Extract token safely
        final token = jsonData['token'];
        if (token == null) {
          throw Exception('No token in response');
        }

        final tokenStr = token.toString();
        if (tokenStr.isEmpty) {
          throw Exception('Token is empty');
        }

        // Extract user data safely
        final id = jsonData['id'];
        final idInt = id is int ? id : (id is String ? int.tryParse(id) : null) ?? 0;
        
        final email = (jsonData['email'] ?? '').toString();
        final name = (jsonData['name'] ?? 'User').toString();
        final plan = (jsonData['plan'] ?? 'free').toString();

        final user = AppUser(
          id: idInt,
          email: email,
          name: name,
          subscriptionPlan: plan,
          isActive: true,
        );

        final loginResponse = LoginResponse(
          token: tokenStr,
          user: user,
          expiresIn: 604800,
        );

        await storage.write(key: _tokenKey, value: tokenStr);
        developer.log('Login successful');
        return loginResponse;
      } else {
        throw Exception('Login failed: HTTP ${response.statusCode}');
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
