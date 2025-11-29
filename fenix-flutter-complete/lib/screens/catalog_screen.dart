import 'package:flutter/material.dart';

class CatalogScreen extends StatelessWidget {
  final Function() onLogout;

  const CatalogScreen({
    Key? key,
    required this.onLogout,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
          ),
        ),
        actions: [
          TextButton(
            onPressed: onLogout,
            child: const Text('Logout'),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle,
              color: Color(0xFF3B82F6),
              size: 64,
            ),
            const SizedBox(height: 24),
            const Text(
              'Login Successful!',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Welcome to Fenix Streaming',
              style: TextStyle(
                color: Colors.grey[400],
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: onLogout,
              child: const Text('Logout'),
            ),
          ],
        ),
      ),
    );
  }
}
