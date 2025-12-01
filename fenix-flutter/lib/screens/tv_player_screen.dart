import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  late FocusNode _playerFocusNode;

  @override
  void initState() {
    super.initState();
    _playerFocusNode = FocusNode();
    _initializeVideo();
    Future.delayed(const Duration(milliseconds: 100), () {
      _playerFocusNode.requestFocus();
    });
  }

  void _initializeVideo() {
    final videoUrl = widget.item['videoUrl'];
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
      } else {
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
    _playerFocusNode.dispose();
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

  void _fastForward() {
    if (!_isYouTube && _videoController.value.isInitialized) {
      final currentPosition = _videoController.value.position;
      final newPosition = currentPosition + const Duration(seconds: 10);
      _videoController.seekTo(newPosition);
    }
  }

  void _rewind() {
    if (!_isYouTube && _videoController.value.isInitialized) {
      final currentPosition = _videoController.value.position;
      final newPosition = currentPosition - const Duration(seconds: 10);
      _videoController.seekTo(newPosition);
    }
  }

  void _handleKeyEvent(RawKeyEvent event) {
    if (event is RawKeyDownEvent) {
      if (event.isKeyPressed(LogicalKeyboardKey.enter) ||
          event.isKeyPressed(LogicalKeyboardKey.space)) {
        _togglePlayPause();
      } else if (event.isKeyPressed(LogicalKeyboardKey.arrowRight)) {
        _fastForward();
      } else if (event.isKeyPressed(LogicalKeyboardKey.arrowLeft)) {
        _rewind();
      } else if (event.isKeyPressed(LogicalKeyboardKey.backspace) ||
          event.isKeyPressed(LogicalKeyboardKey.escape)) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.item['title'] ?? 'Unknown';
    final description = widget.item['description'] ?? 'No description';
    final genre = widget.item['genre'] ?? 'Unknown';
    final year = widget.item['year'] ?? 'Unknown';
    final posterUrl = widget.item['posterUrl'];
    final duration = widget.item['duration'] ?? '120';

    return RawKeyboardListener(
      focusNode: _playerFocusNode,
      onKey: _handleKeyEvent,
      child: Scaffold(
        backgroundColor: const Color(0xFF0a0a0a),
        body: Stack(
          children: [
            // Full screen video player
            Container(
              width: double.infinity,
              height: double.infinity,
              color: const Color(0xFF1a1a2e),
              child: Stack(
                children: [
                  if (_isLoading)
                    Container(
                      color: const Color(0xFF1a1a2e),
                      child: const Center(
                        child: CircularProgressIndicator(
                          valueColor:
                              AlwaysStoppedAnimation(Color(0xFF3B82F6)),
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
                                fontSize: 20,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: () => Navigator.pop(context),
                              icon: const Icon(Icons.arrow_back),
                              label: const Text('Go Back'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF3B82F6),
                                foregroundColor: Colors.white,
                              ),
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
                  else
                    Stack(
                      children: [
                        if (_videoController.value.isInitialized)
                          VideoPlayer(_videoController)
                        else
                          Container(
                            color: const Color(0xFF1a1a2e),
                            child: posterUrl != null
                                ? Image.network(
                                    posterUrl,
                                    fit: BoxFit.cover,
                                    width: double.infinity,
                                    errorBuilder: (context, error, stack) {
                                      return const Center(
                                        child: Icon(Icons.movie,
                                            color: Color(0xFF3B82F6),
                                            size: 80),
                                      );
                                    },
                                  )
                                : const Center(
                                    child: Icon(Icons.movie,
                                        color: Color(0xFF3B82F6), size: 80),
                                  ),
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
                        // Controls overlay
                        if (_showControls)
                          Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                GestureDetector(
                                  onTap: _rewind,
                                  child: Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: Colors.white.withOpacity(0.3),
                                    ),
                                    child: const Icon(Icons.replay_10,
                                        color: Colors.white, size: 40),
                                  ),
                                ),
                                const SizedBox(width: 40),
                                GestureDetector(
                                  onTap: _togglePlayPause,
                                  child: Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: const Color(0xFF3B82F6),
                                    ),
                                    child: Icon(
                                      _videoController.value.isPlaying
                                          ? Icons.pause
                                          : Icons.play_arrow,
                                      color: Colors.white,
                                      size: 48,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 40),
                                GestureDetector(
                                  onTap: _fastForward,
                                  child: Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: Colors.white.withOpacity(0.3),
                                    ),
                                    child: const Icon(Icons.forward_10,
                                        color: Colors.white, size: 40),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        // Info overlay at bottom
                        if (_showControls)
                          Positioned(
                            bottom: 40,
                            left: 40,
                            right: 40,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  title,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.star,
                                            color: Colors.amber, size: 20),
                                        const SizedBox(width: 6),
                                        Text(
                                          '7.5',
                                          style: TextStyle(
                                            color: Colors.grey[300],
                                            fontSize: 16,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 20),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        border:
                                            Border.all(color: Colors.grey[600]!),
                                        borderRadius: BorderRadius.circular(2),
                                      ),
                                      child: Text(
                                        year,
                                        style: TextStyle(
                                          color: Colors.grey[300],
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 20),
                                    Text(
                                      '${duration}min',
                                      style: TextStyle(
                                        color: Colors.grey[300],
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),
                                Text(
                                  description,
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: Colors.grey[300],
                                    fontSize: 14,
                                    height: 1.6,
                                  ),
                                ),
                                const SizedBox(height: 20),
                                Row(
                                  children: [
                                    Text(
                                      '← Rewind 10s',
                                      style: TextStyle(
                                        color: Colors.grey[400],
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(width: 32),
                                    Text(
                                      'Play/Pause',
                                      style: TextStyle(
                                        color: Colors.grey[400],
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(width: 32),
                                    Text(
                                      'Forward 10s →',
                                      style: TextStyle(
                                        color: Colors.grey[400],
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                ],
              ),
            ),
            // Back button
            Positioned(
              top: 20,
              left: 20,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.black.withOpacity(0.6),
                  ),
                  child: const Icon(
                    Icons.arrow_back,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
