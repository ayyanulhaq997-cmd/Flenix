import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static const String _tokenKey = 'jwt_token';
  static const String _userKey = 'current_user';
  final storage = const FlutterSecureStorage();

  Future<String> login(String email, String password) async {
    await storage.write(key: _tokenKey, value: 'token_123');
    await storage.write(key: _userKey, value: email);
    return 'token_123';
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
    await storage.delete(key: _userKey);
  }
}
