import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class AuthService {
  static const String _tokenKey = 'jwt_token';
  final storage = const FlutterSecureStorage();

  Future<String> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.loginEndpoint}'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    ).timeout(const Duration(seconds: 30));

    if (response.statusCode != 200) {
      throw Exception('HTTP ${response.statusCode}');
    }

    dynamic decoded = jsonDecode(response.body);
    if (decoded == null) {
      throw Exception('Null response');
    }

    String token = decoded['token'] ?? '';
    if (token.isEmpty) {
      throw Exception('No token');
    }

    await storage.write(key: _tokenKey, value: token);
    return token;
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
