import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/movie.dart';

class AuthService {
  static const String _tokenKey = 'jwt_token';
  final storage = const FlutterSecureStorage();

  Future<LoginResponse> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.loginEndpoint}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode != 200) {
        throw Exception('HTTP ${response.statusCode}');
      }

      // Ensure we have valid response
      String bodyText = response.body;
      if (bodyText.isEmpty) {
        throw Exception('Empty response');
      }

      // Parse JSON
      var data = jsonDecode(bodyText);
      if (data == null) {
        throw Exception('Null response');
      }

      // Extract fields
      String token = data['token'] ?? '';
      String userEmail = data['email'] ?? '';
      String userName = data['name'] ?? '';
      String plan = data['plan'] ?? 'free';
      int userId = data['id'] ?? 0;

      if (token.isEmpty) {
        throw Exception('No token');
      }

      AppUser user = AppUser(
        id: userId,
        email: userEmail,
        name: userName,
        subscriptionPlan: plan,
        isActive: true,
      );

      LoginResponse result = LoginResponse(
        token: token,
        user: user,
        expiresIn: 604800,
      );

      await storage.write(key: _tokenKey, value: token);
      return result;
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  Future<String?> getToken() async {
    return await storage.read(key: _tokenKey);
  }

  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> logout() async {
    await storage.delete(key: _tokenKey);
  }
}
