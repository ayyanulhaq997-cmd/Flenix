import 'package:flutter/material.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/catalog_screen.dart';

void main() {
  runApp(const FenixApp());
}

/// Main App
/// Handles navigation between authenticated/unauthenticated states
class FenixApp extends StatefulWidget {
  const FenixApp({Key? key}) : super(key: key);

  @override
  State<FenixApp> createState() => _FenixAppState();
}

class _FenixAppState extends State<FenixApp> {
  final _authService = AuthService();
  late Future<bool> _authCheckFuture;

  @override
  void initState() {
    super.initState();
    _authCheckFuture = _authService.isAuthenticated();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fenix Streaming',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF3B82F6),
        scaffoldBackgroundColor: const Color(0xFF0a0a0a),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0a0a0a),
          elevation: 0,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withOpacity(0.05),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(
              color: Colors.white.withOpacity(0.1),
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(
              color: Colors.white.withOpacity(0.1),
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(
              color: Color(0xFF3B82F6),
            ),
          ),
          labelStyle: const TextStyle(color: Colors.grey),
          hintStyle: TextStyle(color: Colors.grey.withOpacity(0.5)),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF3B82F6),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      ),
      home: FutureBuilder<bool>(
        future: _authCheckFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation(Color(0xFF3B82F6)),
                ),
              ),
            );
          }

          final isAuthenticated = snapshot.data ?? false;

          return isAuthenticated
              ? CatalogScreen(
                onLogout: () {
                  setState(() {
                    _authCheckFuture = _authService.isAuthenticated();
                  });
                },
              )
              : LoginScreen(
                onLoginSuccess: (_) {
                  setState(() {
                    _authCheckFuture = _authService.isAuthenticated();
                  });
                },
              );
        },
      ),
    );
  }
}
