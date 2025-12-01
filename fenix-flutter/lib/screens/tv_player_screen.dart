import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

class TVPlayerScreen extends StatefulWidget {
  final dynamic item;
  final String itemType; // Movie, Series, or Channel

  const TVPlayerScreen({
    Key? key,
    required this.item,
    required this.itemType,
  }) : super(key: key);

  @override
  State<TVPlayerScreen> createState() => _TVPlayerScreenState();
}

// Helper function to extract YouTube video ID from URL
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

class _TVPlayerScreenState extends State<TVPlayerScreen> {
  late VideoPlayerController _videoController;
  late YoutubePlayerController _youtubeController;
  bool _isPlaying = false;
  bool _showControls = true;
  bool _isLoading = true;
  String _errorMessage = '';
  bool _isYouTube = false;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  void _initializeVideo() {
    final videoUrl = widget.item['videoUrl'];
    if (videoUrl != null && videoUrl.isNotEmpty) {
      final youtubeId = _extractYouTubeId(videoUrl);
      
      if (youtubeId != null) {
        // Initialize YouTube player
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
      } else {
        // Initialize regular video player
        _isYouTube = false;
        _videoController = VideoPlayerController.networkUrl(Uri.parse(videoUrl))
          ..initialize().then((_) {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          }).catchError((error) {
            if (mounted) {
              setState(() {
                _isLoading = false;
                _errorMessage = 'Failed to load video: $error';
              });
            }
          });
      }
    } else {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'No video URL available';
        });
      }
    }
  }

  @override
  void dispose() {
    if (_isYouTube) {
      _youtubeController.dispose();
    } else {
      _videoController.dispose();
    }
    super.dispose();
  }

  void _togglePlayPause() {
    if (_isYouTube) {
      setState(() {
        _youtubeController.value.isPlaying
            ? _youtubeController.pause()
            : _youtubeController.play();
      });
    } else {
      if (_videoController.value.isInitialized) {
        setState(() {
          _isPlaying = _videoController.value.isPlaying;
        });
        if (_isPlaying) {
          _videoController.pause();
        } else {
          _videoController.play();
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.item['title'] ?? 'Unknown';
    final description =
        widget.item['description'] ?? 'No description';
    final genre = widget.item['genre'] ?? 'Unknown';
    final year = widget.item['year'] ?? 'Unknown';
    final posterUrl = widget.item['posterUrl'];
    final duration = widget.item['duration'] ?? '120';

    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      body: Stack(
        children: [
          // Full screen video player area
          Container(
            width: double.infinity,
            height: double.infinity,
            color: const Color(0xFF1a1a2e),
            child: Stack(
              children: [
                // Video player or poster background
                if (_isLoading)
                  Container(
                    color: const Color(0xFF1a1a2e),
                    child: const Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation(Color(0xFF3B82F6)),
                      ),
                    ),
                  )
                else if (_errorMessage.isNotEmpty)
                  Container(
                    color: const Color(0xFF1a1a2e),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.error_outline,
                            color: Color(0xFF3B82F6),
                            size: 80,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _errorMessage,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  )
                else if (_isYouTube)
                  YoutubePlayer(
                    controller: _youtubeController,
                    showVideoProgressIndicator: true,
                    progressIndicatorColor: const Color(0xFF3B82F6),
                  )
                else if (_videoController.value.isInitialized)
                  VideoPlayer(_videoController)
                else if (posterUrl != null)
                  Image.network(
                    posterUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stack) {
                      return Container(
                        color: const Color(0xFF1a1a2e),
                        child: const Center(
                          child: Icon(Icons.movie,
                              color: Color(0xFF3B82F6), size: 120),
                        ),
                      );
                    },
                  )
                else
                  Container(
                    color: const Color(0xFF1a1a2e),
                    child: const Center(
                      child: Icon(Icons.movie,
                          color: Color(0xFF3B82F6), size: 120),
                    ),
                  ),
                // Gradient overlay
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withOpacity(0.3),
                        Colors.black.withOpacity(0.8),
                      ],
                    ),
                  ),
                ),
                // Large centered play button (only when video is ready)
                if (_isYouTube || (_videoController.value.isInitialized))
                  Center(
                    child: GestureDetector(
                      onTap: _togglePlayPause,
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF3B82F6)
                              .withOpacity(0.8),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF3B82F6)
                                  .withOpacity(0.5),
                              blurRadius: 30,
                              spreadRadius: 10,
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(24),
                        child: Icon(
                          _isYouTube
                              ? (_youtubeController.value.isPlaying
                                  ? Icons.pause
                                  : Icons.play_arrow)
                              : (_videoController.value.isPlaying
                                  ? Icons.pause
                                  : Icons.play_arrow),
                          color: Colors.white,
                          size: 96,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // TV-optimized controls overlay
          if (_showControls)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withOpacity(0),
                      Colors.black.withOpacity(0.9),
                    ],
                  ),
                ),
                padding: const EdgeInsets.all(40),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 42,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF3B82F6),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            genre,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Text(
                          '$year • ${duration}min',
                          style: const TextStyle(
                            color: Colors.grey,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Text(
                      description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.grey,
                        fontSize: 18,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.play_arrow),
                          label: const Text('Play'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                const Color(0xFF3B82F6),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 16,
                            ),
                            textStyle: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        OutlinedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.add),
                          label: const Text('Add to List'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(
                              color: Color(0xFF3B82F6),
                              width: 2,
                            ),
                            foregroundColor:
                                const Color(0xFF3B82F6),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 16,
                            ),
                            textStyle: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          // Back button and top controls
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.6),
                    Colors.black.withOpacity(0),
                  ],
                ),
              ),
              child: Row(
                mainAxisAlignment:
                    MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    iconSize: 32,
                    color: Colors.white,
                    onPressed: () => Navigator.pop(context),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(
                            Icons.favorite_border),
                        iconSize: 32,
                        color: Colors.white,
                        onPressed: () {},
                      ),
                      const SizedBox(width: 12),
                      IconButton(
                        icon:
                            const Icon(Icons.share),
                        iconSize: 32,
                        color: Colors.white,
                        onPressed: () {},
                      ),
                      const SizedBox(width: 12),
                      IconButton(
                        icon:
                            const Icon(Icons.more_vert),
                        iconSize: 32,
                        color: Colors.white,
                        onPressed: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
