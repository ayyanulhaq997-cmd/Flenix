import 'package:flutter/material.dart';

class PlayerScreen extends StatelessWidget {
  final String movieTitle;

  const PlayerScreen({
    Key? key,
    required this.movieTitle,
  }) : super(key: key);

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
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.play_circle_fill,
              color: Color(0xFF3B82F6),
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              'Playing: $movieTitle',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
