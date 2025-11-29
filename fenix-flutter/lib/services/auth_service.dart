class AuthService {
  static String? _token;

  void setToken(String token) {
    _token = token;
  }

  String? getTokenSync() {
    return _token;
  }

  void clearToken() {
    _token = null;
  }
}
