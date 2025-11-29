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
      final body = jsonEncode({'email': email, 'password': password});
      
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: body,
      ).timeout(const Duration(seconds: 30));

      print('DEBUG: Status Code: ${response.statusCode}');
      print('DEBUG: Response Body: ${response.body}');

      if (response.statusCode != 200) {
        throw Exception('Server returned ${response.statusCode}');
      }

      final responseBody = response.body;
      if (responseBody.isEmpty) {
        throw Exception('Empty response from server');
      }

      final decoded = jsonDecode(responseBody);
      print('DEBUG: Decoded Type: ${decoded.runtimeType}');
      print('DEBUG: Decoded Value: $decoded');

      if (decoded == null) {
        throw Exception('Response is null');
      }

      if (decoded is! Map) {
        throw Exception('Response is ${decoded.runtimeType}, expected Map');
      }

      final token = decoded['token'];
      print('DEBUG: Token: $token');

      if (token == null || token.toString().isEmpty) {
        throw Exception('Token is null or empty');
      }

      await storage.write(key: _tokenKey, value: token.toString());
      return token.toString();
    } on Exception catch (e) {
      print('DEBUG: Exception: $e');
      throw Exception('Login error: $e');
    } catch (e) {
      print('DEBUG: Unknown Error: $e');
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
