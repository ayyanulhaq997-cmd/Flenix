import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/catalog_screen.dart';

void main() {
  runApp(const FenixApp());
}

class FenixApp extends StatefulWidget {
  const FenixApp({Key? key}) : super(key: key);

  @override
  State<FenixApp> createState() => _FenixAppState();
}

class _FenixAppState extends State<FenixApp> {
  bool _isLoggedIn = false;

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
      ),
      home: _isLoggedIn
          ? CatalogScreen(
              onLogout: () {
                setState(() {
                  _isLoggedIn = false;
                });
              },
            )
          : LoginScreen(
              onLoginSuccess: (token) {
                setState(() {
                  _isLoggedIn = true;
                });
              },
            ),
    );
  }
}
