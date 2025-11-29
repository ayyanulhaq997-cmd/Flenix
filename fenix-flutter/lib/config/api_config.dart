/// API Configuration for Fenix Backend
/// 
/// Update [apiBaseUrl] with your Fenix backend URL:
/// - Development: http://localhost:5000
/// - Production: https://your-fenix-backend.com

class ApiConfig {
  //  UPDATE THIS WITH YOUR FENIX BACKEND URL
  static const String apiBaseUrl = 'https://e1c30eb1-234f-4841-89d1-b4cd3d839858-00-168qrarj2xv9x.spock.replit.dev';
  
  // API Endpoints
  static const String loginEndpoint = '/api/auth/login';
  static const String moviesEndpoint = '/api/movies';
  static const String usersEndpoint = '/api/app-users';
  
  // JWT Token timeout (7 days in milliseconds)
  static const int tokenExpiryMs = 7 * 24 * 60 * 60 * 1000;
  
  // HTTP Timeouts
  static const int connectTimeoutSeconds = 30;
  static const int readTimeoutSeconds = 30;
}
