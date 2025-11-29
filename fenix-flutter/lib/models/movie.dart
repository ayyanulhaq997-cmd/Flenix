/// Movie model
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

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'subscriptionPlan': subscriptionPlan,
  };
}

/// Login response
class LoginResponse {
  final String token;
  final AppUser user;
  final int expiresIn;

  LoginResponse({
    required this.token,
    required this.user,
    required this.expiresIn,
  });
}
