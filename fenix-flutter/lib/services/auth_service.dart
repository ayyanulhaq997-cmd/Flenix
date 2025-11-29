import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/movie.dart';

class AuthService {
  static const String _tokenKey = 'jwt_token';
  static const String _userKey = 'current_user';
  final storage = const FlutterSecureStorage();

  Future<String> login(String email, String password) async {
    const String token = 'test_token_12345';
    await storage.write(key: _tokenKey, value: token);
    await storage.write(key: _userKey, value: email);
    return token;
  }

  Future<String?> getToken() async {
    return await storage.read(key: _tokenKey);
  }

  Future<AppUser?> getUser() async {
    final email = await storage.read(key: _userKey);
    if (email == null) return null;
    return AppUser(
      id: 1,
      email: email,
      name: 'User',
      subscriptionPlan: 'premium',
      isActive: true,
    );
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
