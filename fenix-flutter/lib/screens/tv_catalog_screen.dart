import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../config/api_config.dart';
import 'tv_player_screen.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class TVCatalogScreen extends StatefulWidget {
  final Function() onLogout;

  const TVCatalogScreen({
    Key? key,
    required this.onLogout,
  }) : super(key: key);

  @override
  State<TVCatalogScreen> createState() => _TVCatalogScreenState();
}

class _TVCatalogScreenState extends State<TVCatalogScreen> {
  final AuthService _authService = AuthService();
  List<dynamic> _movies = [];
  List<dynamic> _series = [];
  List<dynamic> _channels = [];
  bool _isLoading = true;
  int _focusedIndex = 0;
  String _selectedTab = 'Movies'; // Movies, Series, Channels

  final List<String> _tabs = ['Movies', 'Series', 'Channels'];

  @override
  void initState() {
    super.initState();
    _loadContent();
  }

  Future<void> _loadContent() async {
    try {
      final token = _authService.getTokenSync();

      // Load movies
      final moviesResponse = await http.get(
        Uri.parse('${ApiConfig.apiBaseUrl}/api/movies'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(ApiConfig.timeoutDuration);

      // Load series
      final seriesResponse = await http.get(
        Uri.parse('${ApiConfig.apiBaseUrl}/api/series'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(ApiConfig.timeoutDuration);

      // Load channels
      final channelsResponse = await http.get(
        Uri.parse('${ApiConfig.apiBaseUrl}/api/channels'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(ApiConfig.timeoutDuration);

      if (mounted) {
        setState(() {
          if (moviesResponse.statusCode == 200) {
            _movies = jsonDecode(moviesResponse.body) ?? [];
          }
          if (seriesResponse.statusCode == 200) {
            _series = jsonDecode(seriesResponse.body) ?? [];
          }
          if (channelsResponse.statusCode == 200) {
            _channels = jsonDecode(channelsResponse.body) ?? [];
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  List<dynamic> _getSelectedContent() {
    switch (_selectedTab) {
      case 'Series':
        return _series;
      case 'Channels':
        return _channels;
      default:
        return _movies;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedContent = _getSelectedContent();
    final screenSize = MediaQuery.of(context).size;
    final isLargeScreen = screenSize.width > 1200;

    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation(Color(0xFF3B82F6)),
              ),
            )
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // TV Header
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 40, vertical: 30),
                    color: const Color(0xFF1a1a2e),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'FENIX STREAMING',
                          style: TextStyle(
                            color: Color(0xFF3B82F6),
                            fontWeight: FontWeight.bold,
                            fontSize: 48,
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: _tabs.map((tab) {
                                final isSelected = _selectedTab == tab;
                                return GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _selectedTab = tab;
                                    });
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 24, vertical: 12),
                                    margin:
                                        const EdgeInsets.only(right: 16),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? const Color(0xFF3B82F6)
                                          : Colors.transparent,
                                      border: Border.all(
                                        color: isSelected
                                            ? const Color(0xFF3B82F6)
                                            : Colors.grey[700]!,
                                        width: 2,
                                      ),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      tab,
                                      style: TextStyle(
                                        color: isSelected
                                            ? Colors.white
                                            : Colors.grey[400],
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                            ElevatedButton.icon(
                              onPressed: widget.onLogout,
                              icon: const Icon(Icons.logout),
                              label: const Text('Logout'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor:
                                    const Color(0xFF3B82F6),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 24, vertical: 12),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Content Grid
                  Padding(
                    padding: const EdgeInsets.all(40),
                    child: selectedContent.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.movie_not_supported_outlined,
                                  color: Colors.grey[600],
                                  size: 96,
                                ),
                                const SizedBox(height: 24),
                                Text(
                                  'No $_selectedTab found',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 28,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount:
                                  isLargeScreen ? 5 : 4,
                              childAspectRatio: 0.6,
                              crossAxisSpacing: 24,
                              mainAxisSpacing: 24,
                            ),
                            itemCount: selectedContent.length,
                            itemBuilder: (context, index) {
                              final item = selectedContent[index];
                              final title = item['title'] ?? 'Unknown';
                              final posterUrl = item['posterUrl'];

                              return GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          TVPlayerScreen(
                                        item: item,
                                        itemType: _selectedTab,
                                      ),
                                    ),
                                  );
                                },
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius:
                                        BorderRadius.circular(12),
                                    color:
                                        const Color(0xFF1a1a2e),
                                    border: Border.all(
                                      color: Colors.grey[800]!,
                                      width: 2,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black
                                            .withOpacity(0.5),
                                        blurRadius: 12,
                                        offset:
                                            const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: posterUrl != null
                                      ? ClipRRect(
                                          borderRadius:
                                              BorderRadius
                                                  .circular(12),
                                          child: Image.network(
                                            posterUrl,
                                            fit: BoxFit.cover,
                                            errorBuilder: (context,
                                                error, stack) {
                                              return Container(
                                                color: const Color(
                                                    0xFF1a1a2e),
                                                child: Column(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .center,
                                                  children: [
                                                    const Icon(
                                                      Icons.movie,
                                                      color: Color(
                                                          0xFF3B82F6),
                                                      size: 64,
                                                    ),
                                                    const SizedBox(
                                                        height: 16),
                                                    Padding(
                                                      padding:
                                                          const EdgeInsets
                                                              .all(12),
                                                      child: Text(
                                                        title,
                                                        textAlign:
                                                            TextAlign
                                                                .center,
                                                        maxLines: 2,
                                                        overflow:
                                                            TextOverflow
                                                                .ellipsis,
                                                        style:
                                                            const TextStyle(
                                                          color: Colors
                                                              .white,
                                                          fontSize: 14,
                                                          fontWeight:
                                                              FontWeight
                                                                  .bold,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              );
                                            },
                                          ),
                                        )
                                      : Container(
                                          color: const Color(
                                              0xFF1a1a2e),
                                          child: Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment
                                                    .center,
                                            children: [
                                              const Icon(
                                                Icons.movie,
                                                color: Color(
                                                    0xFF3B82F6),
                                                size: 64,
                                              ),
                                              const SizedBox(
                                                  height: 16),
                                              Padding(
                                                padding:
                                                    const EdgeInsets
                                                        .all(12),
                                                child: Text(
                                                  title,
                                                  textAlign:
                                                      TextAlign.center,
                                                  maxLines: 2,
                                                  overflow: TextOverflow
                                                      .ellipsis,
                                                  style:
                                                      const TextStyle(
                                                    color: Colors
                                                        .white,
                                                    fontSize: 14,
                                                    fontWeight:
                                                        FontWeight.bold,
                                                  ),
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
            ),
    );
  }
}
