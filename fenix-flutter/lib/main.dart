import 'package:flutter/material.dart';
import 'dart:io';
import 'screens/login_screen.dart';
import 'screens/catalog_screen.dart';
import 'screens/tv_catalog_screen.dart';

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
  bool _isTV = false;

  @override
  void initState() {
    super.initState();
    _detectDeviceType();
  }

  void _detectDeviceType() {
    // Detect if running on Android TV
    if (Platform.isAndroid) {
      // Android TV detection will be handled by checking device properties
      setState(() {
        _isTV = true; // Set to true for Android TV, false for phones
      });
    }
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
      ),
      home: _isLoggedIn
          ? (_isTV
              ? TVCatalogScreen(
                  onLogout: () {
                    setState(() {
                      _isLoggedIn = false;
                    });
                  },
                )
              : CatalogScreen(
                  onLogout: () {
                    setState(() {
                      _isLoggedIn = false;
                    });
                  },
                ))
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
