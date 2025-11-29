/// Movie model matching Fenix backend schema
class Movie {
  final int id;
  final String title;
  final String genre;
  final int year;
  final String description;
  final String? posterUrl;
  final String? videoUrl;
  final int? duration;
  final String? cast;
  final String status;
  final String requiredPlan;
  final int views;
  final String rating;

  Movie({
    required this.id,
    required this.title,
    required this.genre,
    required this.year,
    required this.description,
    this.posterUrl,
    this.videoUrl,
    this.duration,
    this.cast,
    this.status = 'active',
    this.requiredPlan = 'free',
    this.views = 0,
    this.rating = 'TV-14',
  });

  /// Create Movie from JSON (from Fenix API)
  factory Movie.fromJson(Map<String, dynamic> json) {
    return Movie(
      id: json['id'] ?? 0,
      title: json['title'] ?? 'Untitled',
      genre: json['genre'] ?? 'Unknown',
      year: json['year'] ?? 2025,
      description: json['description'] ?? '',
      posterUrl: json['posterUrl'],
      videoUrl: json['videoUrl'],
      duration: json['duration'],
      cast: json['cast'],
      status: json['status'] ?? 'active',
      requiredPlan: json['requiredPlan'] ?? 'free',
      views: json['views'] ?? 0,
      rating: json['rating'] ?? 'TV-14',
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'genre': genre,
    'year': year,
    'description': description,
    'posterUrl': posterUrl,
    'videoUrl': videoUrl,
    'duration': duration,
    'cast': cast,
    'status': status,
    'requiredPlan': requiredPlan,
    'views': views,
    'rating': rating,
  };
}

/// User model
class AppUser {
  final int id;
  final String email;
  final String name;
  final String subscriptionPlan;
  final bool isActive;

  AppUser({
    required this.id,
    required this.email,
    required this.name,
    this.subscriptionPlan = 'free',
    this.isActive = true,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      subscriptionPlan: json['plan'] ?? json['subscriptionPlan'] ?? 'free',
      isActive: (json['status'] ?? 'active') == 'active',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'subscriptionPlan': subscriptionPlan,
    'isActive': isActive,
  };
}

/// Login response with JWT token
class LoginResponse {
  final String token;
  final AppUser user;
  final int expiresIn;

  LoginResponse({
    required this.token,
    required this.user,
    required this.expiresIn,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'] ?? '',
      user: AppUser.fromJson(json),
      expiresIn: json['expiresIn'] ?? 604800,
    );
  }
}
