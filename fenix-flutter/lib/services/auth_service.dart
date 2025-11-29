import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class AuthService {
  static const String _tokenKey = 'jwt_token';
  final storage = const FlutterSecureStorage();

  Future<String> login(String email, String password) async {
    try {
      final url = Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.loginEndpoint}');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode != 200) {
        throw Exception('HTTP ${response.statusCode}');
      }

      // Extract token using regex instead of jsonDecode
      final tokenMatch = RegExp(r'"token":"([^"]+)"').firstMatch(response.body);
      if (tokenMatch == null || tokenMatch.group(1)!.isEmpty) {
        throw Exception('No token found in response');
      }

      final token = tokenMatch.group(1)!;
      await storage.write(key: _tokenKey, value: token);
      return token;
    } catch (e) {
      throw Exception('Login failed: $e');
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
