import 'package:flutter/material.dart';
import '../models/movie.dart';

/// Player Screen
/// Video playback screen
/// TODO: Integrate VideoPlayer plugin for actual video playback
class PlayerScreen extends StatefulWidget {
  final Movie movie;

  const PlayerScreen({
    Key? key,
    required this.movie,
  }) : super(key: key);

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Video Player Area
            Container(
              width: double.infinity,
              height: 300,
              color: Colors.black,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.play_circle_fill,
                      color: Color(0xFF3B82F6),
                      size: 64,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Video Player\n(Integrate VideoPlayer plugin)',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 14,
                      ),
                    ),
                    if (widget.movie.videoUrl != null &&
                        widget.movie.videoUrl!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Text(
                        'URL: ${widget.movie.videoUrl}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 10,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // Movie Details
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    widget.movie.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Meta Info
                  Row(
                    children: [
                      Text(
                        widget.movie.year.toString(),
                        style: const TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        '${widget.movie.duration ?? '?'} min',
                        style: const TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          widget.movie.rating,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Genre
                  Chip(
                    label: Text(widget.movie.genre),
                    backgroundColor: Colors.grey.withOpacity(0.2),
                  ),
                  const SizedBox(height: 16),

                  // Description
                  Text(
                    'Description',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.movie.description,
                    style: TextStyle(
                      color: Colors.grey.shade400,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Plan Required
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B82F6).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: const Color(0xFF3B82F6).withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.lock_outline,
                          color: Color(0xFF3B82F6),
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Requires: ${widget.movie.requiredPlan.toUpperCase()} plan',
                          style: const TextStyle(
                            color: Color(0xFF3B82F6),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Watch Button
                  if (widget.movie.videoUrl != null &&
                      widget.movie.videoUrl!.isNotEmpty)
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          // TODO: Implement video playback
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Video player integration coming soon!',
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF3B82F6),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.play_arrow),
                            SizedBox(width: 8),
                            Text('Play Now'),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
