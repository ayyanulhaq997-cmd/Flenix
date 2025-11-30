import 'package:flutter/material.dart';

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

class _PlayerScreenState extends State<PlayerScreen> {
  bool _isPlaying = false;
  String _selectedSubtitleColor = 'white';
  String _selectedSubtitleSize = 'Mediano';
  String _selectedLanguage = 'Español';

  void _showSubtitlePreferences() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1a1a2e),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Video preview at top
              Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  image: DecorationImage(
                    image: NetworkImage(widget.movie['posterUrl'] ?? ''),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Rating and info
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            '7.5',
                            style: TextStyle(
                              color: Colors.grey[300],
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${widget.movie['year'] ?? '2025'}',
                        style: TextStyle(
                          color: Colors.grey[400],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '1h 89min\nHD',
                    style: TextStyle(
                      color: Colors.grey[300],
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Color preferences
              const Text(
                'Preferencia de subtítulos',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Color',
                style: TextStyle(
                  color: Colors.grey[300],
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildColorOption('white', Colors.white),
                  const SizedBox(width: 12),
                  _buildColorOption('yellow', Colors.amber),
                  const SizedBox(width: 12),
                  _buildColorOption('green', Colors.green),
                  const SizedBox(width: 12),
                  _buildColorOption('cyan', Colors.cyan),
                  const SizedBox(width: 12),
                  _buildColorOption('pink', Colors.pink),
                ],
              ),
              const SizedBox(height: 20),
              // Size preferences
              const Text(
                'Tamaño',
                style: TextStyle(
                  color: Colors.grey[300],
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              ..._buildSizeOptions(),
              const SizedBox(height: 20),
              // Language preferences
              const Text(
                'Idioma',
                style: TextStyle(
                  color: Colors.grey[300],
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              ..._buildLanguageOptions(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildColorOption(String color, Color colorValue) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedSubtitleColor = color;
        });
        Navigator.pop(context);
      },
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: colorValue,
          border: Border.all(
            color: _selectedSubtitleColor == color
                ? const Color(0xFF3B82F6)
                : Colors.grey[700]!,
            width: 2,
          ),
        ),
        child: _selectedSubtitleColor == color
            ? const Icon(Icons.check, color: Colors.black, size: 20)
            : null,
      ),
    );
  }

  List<Widget> _buildSizeOptions() {
    return ['Pequeño', 'Mediano', 'Grande'].map((size) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Radio<String>(
              value: size,
              groupValue: _selectedSubtitleSize,
              onChanged: (value) {
                setState(() {
                  _selectedSubtitleSize = value!;
                });
                Navigator.pop(context);
              },
              activeColor: const Color(0xFF3B82F6),
            ),
            Text(
              size,
              style: TextStyle(
                color: Colors.grey[300],
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    }).toList();
  }

  List<Widget> _buildLanguageOptions() {
    return ['Desactivar', 'Español', 'Inglés'].map((lang) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Radio<String>(
              value: lang,
              groupValue: _selectedLanguage,
              onChanged: (value) {
                setState(() {
                  _selectedLanguage = value!;
                });
                Navigator.pop(context);
              },
              activeColor: const Color(0xFF3B82F6),
            ),
            Text(
              lang,
              style: TextStyle(
                color: Colors.grey[300],
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.movie['title'] ?? 'Unknown';
    final description = widget.movie['description'] ?? 'No description';
    final genre = widget.movie['genre'] ?? 'Unknown';
    final year = widget.movie['year'] ?? 'Unknown';
    final posterUrl = widget.movie['posterUrl'];
    final duration = widget.movie['duration'] ?? '120';
    final actors = widget.movie['actors'] ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Video Player with Controls
                Container(
                  height: 280,
                  width: double.infinity,
                  color: const Color(0xFF1a1a2e),
                  child: Stack(
                    children: [
                      // Poster background
                      if (posterUrl != null)
                        Image.network(
                          posterUrl,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          errorBuilder: (context, error, stack) {
                            return Container(
                              color: const Color(0xFF1a1a2e),
                              child: const Center(
                                child: Icon(Icons.movie,
                                    color: Color(0xFF3B82F6), size: 64),
                              ),
                            );
                          },
                        ),
                      // Gradient overlay
                      Container(
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
                      // Player controls - horizontally centered
                      Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Back button
                            GestureDetector(
                              onTap: () {},
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withOpacity(0.3),
                                ),
                                child: const Icon(Icons.replay_10,
                                    color: Colors.white, size: 24),
                              ),
                            ),
                            const SizedBox(width: 32),
                            // Play/Pause button (larger)
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  _isPlaying = !_isPlaying;
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _isPlaying
                                      ? const Color(0xFF3B82F6)
                                      : const Color(0xFF3B82F6).withOpacity(0.7),
                                ),
                                child: Icon(
                                  _isPlaying ? Icons.pause : Icons.play_arrow,
                                  color: Colors.white,
                                  size: 32,
                                ),
                              ),
                            ),
                            const SizedBox(width: 32),
                            // Forward button
                            GestureDetector(
                              onTap: () {},
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withOpacity(0.3),
                                ),
                                child: const Icon(Icons.forward_10,
                                    color: Colors.white, size: 24),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                // Movie Info Section
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
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Rating, year, duration
                      Row(
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.star,
                                  color: Colors.amber, size: 16),
                              const SizedBox(width: 4),
                              Text(
                                '7.5',
                                style: TextStyle(
                                  color: Colors.grey[300],
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey[600]!),
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: Text(
                              year,
                              style: TextStyle(
                                color: Colors.grey[300],
                                fontSize: 12,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Text(
                            '${duration}min',
                            style: TextStyle(
                              color: Colors.grey[300],
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF3B82F6),
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: const Text(
                              'HD',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Description
                      Text(
                        description,
                        style: TextStyle(
                          color: Colors.grey[300],
                          fontSize: 13,
                          height: 1.6,
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Actors section
                      const Text(
                        'Actores',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 100,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: actors.length > 4 ? 4 : actors.length,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: const EdgeInsets.only(right: 16),
                              child: Column(
                                children: [
                                  CircleAvatar(
                                    radius: 32,
                                    backgroundColor: const Color(0xFF3B82F6),
                                    child: Text(
                                      (actors[index]['name'] ?? 'Actor')[0]
                                          .toUpperCase(),
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  SizedBox(
                                    width: 80,
                                    child: Text(
                                      actors[index]['name'] ?? 'Actor',
                                      textAlign: TextAlign.center,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: Colors.grey[300],
                                        fontSize: 12,
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
                      // Related Content section
                      const Text(
                        'Contenidos relacionados',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 140,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: widget.allMovies.length > 3
                              ? 3
                              : widget.allMovies.length,
                          itemBuilder: (context, index) {
                            final relatedMovie = widget.allMovies[index];
                            final relatedPoster = relatedMovie['posterUrl'];

                            return Padding(
                              padding: const EdgeInsets.only(right: 12),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: relatedPoster != null
                                    ? Image.network(
                                        relatedPoster,
                                        width: 100,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stack) {
                                          return Container(
                                            width: 100,
                                            color: const Color(0xFF1a1a2e),
                                            child: const Icon(Icons.movie,
                                                color: Color(0xFF3B82F6)),
                                          );
                                        },
                                      )
                                    : Container(
                                        width: 100,
                                        color: const Color(0xFF1a1a2e),
                                        child: const Icon(Icons.movie,
                                            color: Color(0xFF3B82F6)),
                                      ),
                              ),
                            );
                          },
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
                  icon: const Icon(Icons.closed_caption),
                  onPressed: _showSubtitlePreferences,
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
}
