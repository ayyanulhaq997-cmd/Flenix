import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/video_player_service.dart';
import '../models/movie.dart';

/// Enhanced TV Player with HLS/DASH streaming support
/// Perfect D-pad/remote navigation and 10-foot UX
class TVPlayerScreenEnhanced extends StatefulWidget {
  final Movie movie;
  final String? streamingUrl;

  const TVPlayerScreenEnhanced({
    required this.movie,
    this.streamingUrl,
  });

  @override
  State<TVPlayerScreenEnhanced> createState() => _TVPlayerScreenEnhancedState();
}

class _TVPlayerScreenEnhancedState extends State<TVPlayerScreenEnhanced> {
  late VideoPlayerService _playerService;
  bool _showControls = true;
  late FocusNode _playPauseFocus;
  late FocusNode _backFocus;
  bool _isFullscreen = false;

  @override
  void initState() {
    super.initState();
    _playerService = VideoPlayerService();
    _playPauseFocus = FocusNode();
    _backFocus = FocusNode();
    _initializePlayer();

    // Auto-hide controls after 5 seconds on TV
    Future.delayed(Duration(seconds: 5), () {
      if (mounted) {
        setState(() => _showControls = false);
      }
    });
  }

  Future<void> _initializePlayer() async {
    try {
      // Use CDN streaming URL or presigned URL
      final url = widget.streamingUrl ?? widget.movie.videoUrl;
      final format = url.contains('.m3u8') ? 'hls' : 'dash';
      
      await _playerService.initializeWithStreamingUrl(url, format: format);
      if (mounted) {
        setState(() {});
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load video: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _playerService.dispose();
    _playPauseFocus.dispose();
    _backFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.normal);
        return true;
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: GestureDetector(
          onTap: () {
            setState(() => _showControls = !_showControls);
          },
          child: Stack(
            children: [
              // Video Player
              Center(
                child: _playerService.isInitialized
                    ? AspectRatio(
                        aspectRatio: _playerService.controller.value.aspectRatio,
                        child: VideoPlayer(_playerService.controller),
                      )
                    : Center(
                        child: CircularProgressIndicator(),
                      ),
              ),

              // Top Controls (Back button + Title)
              if (_showControls)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withOpacity(0.7),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    padding: EdgeInsets.all(24),
                    child: Row(
                      children: [
                        Focus(
                          focusNode: _backFocus,
                          onKey: (node, event) {
                            if (event.isKeyPressed(LogicalKeyboardKey.enter)) {
                              Navigator.of(context).pop();
                              return KeyEventResult.handled;
                            }
                            return KeyEventResult.ignored;
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: _backFocus.hasFocus
                                    ? Colors.amber
                                    : Colors.transparent,
                                width: 2,
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: IconButton(
                              icon: Icon(Icons.arrow_back, size: 32),
                              color: Colors.white,
                              onPressed: () => Navigator.of(context).pop(),
                            ),
                          ),
                        ),
                        SizedBox(width: 24),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.movie.title,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              SizedBox(height: 8),
                              Text(
                                '${widget.movie.year} • ${widget.movie.genre}',
                                style: TextStyle(
                                  color: Colors.grey[400],
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              // Bottom Controls (Play/Pause, Progress, Quality)
              if (_showControls)
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          Colors.black.withOpacity(0.8),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    padding: EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Progress bar
                        if (_playerService.isInitialized)
                          VideoProgressIndicator(
                            _playerService.controller,
                            allowScrubbing: true,
                            colors: VideoProgressColors(
                              playedColor: Colors.amber,
                              bufferedColor: Colors.grey[600]!,
                              backgroundColor: Colors.grey[800]!,
                            ),
                          ),
                        SizedBox(height: 16),

                        // Control buttons
                        Row(
                          children: [
                            Focus(
                              focusNode: _playPauseFocus,
                              onKey: (node, event) {
                                if (event.isKeyPressed(LogicalKeyboardKey.enter)) {
                                  _togglePlayPause();
                                  return KeyEventResult.handled;
                                }
                                return KeyEventResult.ignored;
                              },
                              child: Container(
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: _playPauseFocus.hasFocus
                                        ? Colors.amber
                                        : Colors.transparent,
                                    width: 2,
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                child: IconButton(
                                  icon: Icon(
                                    _playerService.isPlaying
                                        ? Icons.pause
                                        : Icons.play_arrow,
                                    size: 32,
                                  ),
                                  color: Colors.white,
                                  onPressed: _togglePlayPause,
                                ),
                              ),
                            ),
                            SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _formatDuration(_playerService.position ?? Duration.zero),
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                    ),
                                  ),
                                  Text(
                                    '${_playerService.duration?.inMinutes ?? 0} min',
                                    style: TextStyle(
                                      color: Colors.grey[400],
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: Colors.grey[600]!,
                                  width: 1,
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              child: Text(
                                'HLS/DASH',
                                style: TextStyle(
                                  color: Colors.grey[400],
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _togglePlayPause() {
    setState(() {
      if (_playerService.isPlaying) {
        _playerService.pause();
      } else {
        _playerService.play();
      }
    });
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60));
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60));
    return '${twoDigits(duration.inHours)}:$twoDigitMinutes:$twoDigitSeconds';
  }
}

/// Custom VideoPlayer widget for compatibility
class VideoPlayer extends StatefulWidget {
  final VideoPlayerController controller;

  const VideoPlayer(this.controller);

  @override
  State<VideoPlayer> createState() => _VideoPlayerState();
}

class _VideoPlayerState extends State<VideoPlayer> {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black,
      child: FittedBox(
        fit: BoxFit.cover,
        child: SizedBox(
          width: widget.controller.value.size.width,
          height: widget.controller.value.size.height,
          child: Texture(textureId: widget.controller.textureId!),
        ),
      ),
    );
  }
}

/// Video progress indicator
class VideoProgressIndicator extends StatefulWidget {
  final VideoPlayerController controller;
  final bool allowScrubbing;
  final VideoProgressColors colors;

  const VideoProgressIndicator(
    this.controller, {
    this.allowScrubbing = true,
    required this.colors,
  });

  @override
  State<VideoProgressIndicator> createState() => _VideoProgressIndicatorState();
}

class _VideoProgressIndicatorState extends State<VideoProgressIndicator> {
  @override
  Widget build(BuildContext context) {
    return SliderTheme(
      data: SliderThemeData(
        trackHeight: 4,
        thumbShape: RoundSliderThumbShape(enabledThumbRadius: 8),
      ),
      child: Slider(
        value: widget.controller.value.position.inMilliseconds.toDouble(),
        max: widget.controller.value.duration.inMilliseconds.toDouble(),
        onChanged: widget.allowScrubbing
            ? (value) {
                widget.controller.seekTo(Duration(milliseconds: value.toInt()));
              }
            : null,
        activeColor: widget.colors.playedColor,
        inactiveColor: widget.colors.backgroundColor,
      ),
    );
  }
}

class VideoProgressColors {
  final Color playedColor;
  final Color bufferedColor;
  final Color backgroundColor;

  VideoProgressColors({
    required this.playedColor,
    required this.bufferedColor,
    required this.backgroundColor,
  });
}
