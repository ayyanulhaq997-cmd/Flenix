import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class PlayerScreen extends StatefulWidget {
  final dynamic movie;
  final List<dynamic> allMovies;

  const PlayerScreen({
    Key? key,
    required this.movie,
    required this.allMovies,
  }) : super(key: key);

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

String? _extractYouTubeId(String url) {
  try {
    if (url.contains('youtube.com') || url.contains('youtu.be')) {
      if (url.contains('youtube.com')) {
        return Uri.parse(url).queryParameters['v'];
      } else if (url.contains('youtu.be')) {
        return url.split('youtu.be/').last.split('?').first;
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}

class _PlayerScreenState extends State<PlayerScreen> {
  late VideoPlayerController _videoController;
  late YoutubePlayerController _youtubeController;
  bool _isLoading = true;
  String _errorMessage = '';
  bool _isYouTube = false;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  void _initializeVideo() {
    final videoUrl = widget.movie['videoUrl'];
    if (videoUrl != null && videoUrl.isNotEmpty) {
      final youtubeId = _extractYouTubeId(videoUrl);
      if (youtubeId != null) {
        _isYouTube = true;
        _youtubeController = YoutubePlayerController(
          initialVideoId: youtubeId,
          flags: const YoutubePlayerFlags(
            autoPlay: false,
            mute: false,
          ),
        );
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    } else {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'No video available';
        });
      }
    }
  }

  @override
  void dispose() {
    if (_isYouTube) {
      _youtubeController.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.movie['title'] ?? 'Unknown';
    final description = widget.movie['description'] ?? 'No description';
    final genre = widget.movie['genre'] ?? 'Unknown';
    final year = '${widget.movie['year'] ?? 'Unknown'}';
    final posterUrl = widget.movie['posterUrl'];
    final duration = '${widget.movie['duration'] ?? 120}';
    final cast = widget.movie['cast'] ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // HERO POSTER IMAGE - LARGE at top
                Stack(
                  children: [
                    // Big poster image
                    posterUrl != null
                        ? Image.network(
                            posterUrl,
                            width: double.infinity,
                            height: 450,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stack) {
                              return Container(
                                width: double.infinity,
                                height: 450,
                                color: const Color(0xFF1a1a2e),
                                child: const Icon(
                                  Icons.movie,
                                  color: Color(0xFF3B82F6),
                                  size: 96,
                                ),
                              );
                            },
                          )
                        : Container(
                            width: double.infinity,
                            height: 450,
                            color: const Color(0xFF1a1a2e),
                            child: const Icon(
                              Icons.movie,
                              color: Color(0xFF3B82F6),
                              size: 96,
                            ),
                          ),
                    // Gradient overlay
                    Container(
                      width: double.infinity,
                      height: 450,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.8),
                          ],
                        ),
                      ),
                    ),
                    // Play button overlay
                    Positioned(
                      top: 180,
                      left: 0,
                      right: 0,
                      child: Center(
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFF3B82F6).withOpacity(0.9),
                          ),
                          child: const Icon(
                            Icons.play_arrow,
                            color: Colors.white,
                            size: 40,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                // Movie Info Section - Below poster
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Genre and other info
                      Text(
                        genre,
                        style: TextStyle(
                          color: Colors.grey[400],
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Rating, Year, Duration
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            '7.5',
                            style: TextStyle(
                              color: Colors.grey[300],
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            year,
                            style: TextStyle(
                              color: Colors.grey[300],
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            '${duration}min',
                            style: TextStyle(
                              color: Colors.grey[300],
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF3B82F6),
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: const Text(
                              'HD',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // TABS for sections
                      Row(
                        children: [
                          _buildTab('RESUMEN', true),
                          _buildTab('PELÍCULAS', false),
                          _buildTab('SERIES', false),
                          _buildTab('CANALES TV', false),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Description
                      Text(
                        description,
                        style: TextStyle(
                          color: Colors.grey[300],
                          fontSize: 13,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Action buttons
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.play_arrow, size: 18),
                              label: const Text('JUGAR'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF3B82F6),
                                foregroundColor: Colors.white,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 10),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(Icons.favorite_border),
                            color: const Color(0xFF3B82F6),
                          ),
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(Icons.share),
                            color: const Color(0xFF3B82F6),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Actors section
                      const Text(
                        'Actores',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 90,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: 3,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: const EdgeInsets.only(right: 16),
                              child: Column(
                                children: [
                                  CircleAvatar(
                                    radius: 28,
                                    backgroundColor: const Color(0xFF3B82F6),
                                    child: Text(
                                      'A${index + 1}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  SizedBox(
                                    width: 70,
                                    child: Text(
                                      'Actor ${index + 1}',
                                      textAlign: TextAlign.center,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: Colors.grey[300],
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Related content
                      const Text(
                        'Contenidos relacionados',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 120,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount:
                              widget.allMovies.length > 3 ? 3 : widget.allMovies.length,
                          itemBuilder: (context, index) {
                            final relatedMovie = widget.allMovies[index];
                            final relatedPoster = relatedMovie['posterUrl'];

                            return Padding(
                              padding: const EdgeInsets.only(right: 10),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(6),
                                child: relatedPoster != null
                                    ? Image.network(
                                        relatedPoster,
                                        width: 90,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stack) {
                                          return Container(
                                            width: 90,
                                            color: const Color(0xFF1a1a2e),
                                            child: const Icon(
                                              Icons.movie,
                                              color: Color(0xFF3B82F6),
                                            ),
                                          );
                                        },
                                      )
                                    : Container(
                                        width: 90,
                                        color: const Color(0xFF1a1a2e),
                                        child: const Icon(
                                          Icons.movie,
                                          color: Color(0xFF3B82F6),
                                        ),
                                      ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Remove from history button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE91E63),
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                          child: const Text(
                            'REMOVER DEL HISTORIAL',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Top app bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AppBar(
              backgroundColor: Colors.black54,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.favorite_border),
                  onPressed: () {},
                ),
                IconButton(
                  icon: const Icon(Icons.share),
                  onPressed: () {},
                ),
                IconButton(
                  icon: const Icon(Icons.more_vert),
                  onPressed: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String label, bool isActive) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF3B82F6) : Colors.transparent,
          border: Border(
            bottom: BorderSide(
              color: isActive ? const Color(0xFF3B82F6) : Colors.grey[700]!,
              width: 2,
            ),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : Colors.grey[400],
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
