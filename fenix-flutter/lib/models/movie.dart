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
      id: json['id'] as int,
      title: json['title'] as String,
      genre: json['genre'] as String,
      year: json['year'] as int,
      description: json['description'] as String,
      posterUrl: json['posterUrl'] as String?,
      videoUrl: json['videoUrl'] as String?,
      duration: json['duration'] as int?,
      cast: json['cast'] as String?,
      status: json['status'] as String? ?? 'active',
      requiredPlan: json['requiredPlan'] as String? ?? 'free',
      views: json['views'] as int? ?? 0,
      rating: json['rating'] as String? ?? 'TV-14',
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
      id: json['id'] as int,
      email: json['email'] as String,
      name: json['name'] as String,
      subscriptionPlan: json['subscriptionPlan'] as String? ?? 'free',
      isActive: json['isActive'] as bool? ?? true,
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
      token: json['token'] as String,
      user: AppUser.fromJson(json['user'] as Map<String, dynamic>),
      expiresIn: json['expiresIn'] as int? ?? 604800, // 7 days default
    );
  }
}
