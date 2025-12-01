import 'package:video_player/video_player.dart';

/// Enhanced video player service supporting HLS/DASH adaptive streaming
class VideoPlayerService {
  late VideoPlayerController _controller;
  bool _isInitialized = false;

  /// Initialize video player with HLS/DASH streaming URL
  Future<void> initializeWithStreamingUrl(String streamingUrl, {String format = 'hls'}) async {
    try {
      // Support both HLS (.m3u8) and DASH (.mpd) formats
      final videoUrl = _buildStreamingUrl(streamingUrl, format);
      
      _controller = VideoPlayerController.network(
        videoUrl,
        httpHeaders: {
          'User-Agent': 'Fenix/1.0',
          'Accept-Encoding': 'gzip, deflate',
        },
      );

      // Initialize and get duration
      await _controller.initialize();
      _isInitialized = true;
    } catch (e) {
      throw Exception('Failed to initialize video player: $e');
    }
  }

  /// Build streaming URL based on format
  String _buildStreamingUrl(String baseUrl, String format) {
    if (format == 'hls') {
      if (!baseUrl.contains('.m3u8')) {
        return '$baseUrl/playlist.m3u8';
      }
    } else if (format == 'dash') {
      if (!baseUrl.contains('.mpd')) {
        return '$baseUrl/manifest.mpd';
      }
    }
    return baseUrl;
  }

  /// Get video controller
  VideoPlayerController get controller => _controller;

  /// Check if player is initialized
  bool get isInitialized => _isInitialized;

  /// Get video duration
  Duration? get duration => _controller.value.duration;

  /// Play video
  void play() => _controller.play();

  /// Pause video
  void pause() => _controller.pause();

  /// Seek to position
  void seek(Duration position) => _controller.seekTo(position);

  /// Get current position
  Duration? get position => _controller.value.position;

  /// Get playback speed
  double get speed => _controller.value.playbackSpeed;

  /// Set playback speed
  Future<void> setPlaybackSpeed(double speed) async {
    await _controller.setPlaybackSpeed(speed);
  }

  /// Check if video is playing
  bool get isPlaying => _controller.value.isPlaying;

  /// Get buffered ranges
  List<DurationRange> get buffered => _controller.value.buffered;

  /// Dispose resources
  void dispose() {
    _controller.dispose();
    _isInitialized = false;
  }
}
