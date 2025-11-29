import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static const String _tokenKey = 'jwt_token';
  final storage = const FlutterSecureStorage();

  Future<String> login(String email, String password) async {
    // Hardcoded token for testing
    const String token = 'test_token_12345';
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
