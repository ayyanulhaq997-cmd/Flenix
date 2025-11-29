import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../config/api_config.dart';
import 'player_screen.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class CatalogScreen extends StatefulWidget {
  final Function() onLogout;

  const CatalogScreen({
    Key? key,
    required this.onLogout,
  }) : super(key: key);

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  final AuthService _authService = AuthService();
  List<dynamic> _movies = [];
  bool _isLoading = true;
  String _selectedCategory = 'All';
  final List<String> _categories = [
    'All',
    'Action',
    'Comedy',
    'Drama',
    'Horror',
    'Sci-Fi',
    'Thriller'
  ];

  @override
  void initState() {
    super.initState();
    _loadMovies();
  }

  Future<void> _loadMovies() async {
    try {
      final token = _authService.getTokenSync();
      final response = await http.get(
        Uri.parse('${ApiConfig.apiBaseUrl}/api/movies'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(ApiConfig.timeoutDuration);

      if (response.statusCode == 200) {
        setState(() {
          _movies = jsonDecode(response.body) ?? [];
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  List<dynamic> _getFilteredMovies() {
    if (_selectedCategory == 'All') {
      return _movies;
    }
    return _movies
        .where((movie) =>
            movie['genre']?.toString().toLowerCase() ==
            _selectedCategory.toLowerCase())
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final filteredMovies = _getFilteredMovies();

    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'FENIX',
          style: TextStyle(
            color: Color(0xFF3B82F6),
            fontWeight: FontWeight.bold,
            fontSize: 28,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Center(
              child: Text(
                'Today, 3:11 am',
                style: TextStyle(
                  color: Colors.grey[400],
                  fontSize: 12,
                ),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation(Color(0xFF3B82F6)),
              ),
            )
          : Row(
              children: [
                // Sidebar with categories
                Container(
                  width: 120,
                  color: const Color(0xFF1a1a2e),
                  child: ListView(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    children: _categories.map((category) {
                      final isSelected = _selectedCategory == category;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedCategory = category;
                          });
                        },
                        child: Container(
                          color: isSelected
                              ? const Color(0xFF3B82F6)
                              : Colors.transparent,
                          padding: const EdgeInsets.symmetric(
                              vertical: 12, horizontal: 12),
                          child: Text(
                            category,
                            style: TextStyle(
                              color: isSelected
                                  ? Colors.white
                                  : Colors.grey[400],
                              fontSize: 12,
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                // Movies grid or empty state
                Expanded(
                  child: filteredMovies.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.movie_not_supported_outlined,
                                color: Colors.grey[600],
                                size: 64,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No movies found',
                                style: TextStyle(
                                  color: Colors.grey[400],
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'in $_selectedCategory category',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        )
                      : GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            childAspectRatio: 0.7,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: filteredMovies.length,
                          itemBuilder: (context, index) {
                            final movie = filteredMovies[index];
                            final title = movie['title'] ?? 'Unknown';
                            final posterUrl = movie['posterUrl'];

                            return GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => PlayerScreen(
                                      movie: movie,
                                      allMovies: filteredMovies,
                                    ),
                                  ),
                                );
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8),
                                  color: const Color(0xFF1a1a2e),
                                  border: Border.all(
                                    color: Colors.grey[700]!,
                                    width: 1,
                                  ),
                                ),
                                child: posterUrl != null
                                    ? ClipRRect(
                                        borderRadius: BorderRadius.circular(8),
                                        child: Image.network(
                                          posterUrl,
                                          fit: BoxFit.cover,
                                          errorBuilder:
                                              (context, error, stack) {
                                            return Container(
                                              color: const Color(0xFF1a1a2e),
                                              child: Column(
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                children: [
                                                  const Icon(
                                                    Icons.movie,
                                                    color: Color(0xFF3B82F6),
                                                    size: 32,
                                                  ),
                                                  const SizedBox(height: 8),
                                                  Text(
                                                    title,
                                                    textAlign: TextAlign.center,
                                                    maxLines: 2,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 10,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            );
                                          },
                                        ),
                                      )
                                    : Container(
                                        color: const Color(0xFF1a1a2e),
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            const Icon(
                                              Icons.movie,
                                              color: Color(0xFF3B82F6),
                                              size: 32,
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              title,
                                              textAlign: TextAlign.center,
                                              maxLines: 2,
                                              overflow:
                                                  TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 10,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF3B82F6),
        onPressed: widget.onLogout,
        child: const Icon(Icons.logout),
      ),
    );
  }
}
