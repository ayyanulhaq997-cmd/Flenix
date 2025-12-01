import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/auth_service.dart';
import '../config/api_config.dart';
import 'tv_player_screen.dart';
import 'tv_search_screen.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class TVCatalogScreen extends StatefulWidget {
  final Function() onLogout;

  const TVCatalogScreen({
    Key? key,
    required this.onLogout,
  }) : super(key: key);

  @override
  State<TVCatalogScreen> createState() => _TVCatalogScreenState();
}

class _TVCatalogScreenState extends State<TVCatalogScreen> {
  final AuthService _authService = AuthService();
  List<dynamic> _movies = [];
  List<dynamic> _series = [];
  List<dynamic> _channels = [];
  bool _isLoading = true;
  int _focusedIndex = 0;
  String _selectedTab = 'Movies'; // Movies, Series, Channels
  late FocusNode _tabFocusNode;
  late FocusNode _contentFocusNode;
  bool _tabMode = true; // true = navigating tabs, false = navigating content

  final List<String> _tabs = ['Movies', 'Series', 'Channels'];

  @override
  void initState() {
    super.initState();
    _tabFocusNode = FocusNode();
    _contentFocusNode = FocusNode();
    _loadContent();
    Future.delayed(const Duration(milliseconds: 100), () {
      _tabFocusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _tabFocusNode.dispose();
    _contentFocusNode.dispose();
    super.dispose();
  }

  Future<void> _loadContent() async {
    try {
      final token = _authService.getTokenSync();

      final moviesResponse = await http.get(
        Uri.parse('${ApiConfig.apiBaseUrl}/api/movies'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(ApiConfig.timeoutDuration);

      final seriesResponse = await http.get(
        Uri.parse('${ApiConfig.apiBaseUrl}/api/series'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(ApiConfig.timeoutDuration);

      final channelsResponse = await http.get(
        Uri.parse('${ApiConfig.apiBaseUrl}/api/channels'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(ApiConfig.timeoutDuration);

      if (mounted) {
        setState(() {
          if (moviesResponse.statusCode == 200) {
            _movies = jsonDecode(moviesResponse.body) ?? [];
          }
          if (seriesResponse.statusCode == 200) {
            _series = jsonDecode(seriesResponse.body) ?? [];
          }
          if (channelsResponse.statusCode == 200) {
            _channels = jsonDecode(channelsResponse.body) ?? [];
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  List<dynamic> _getSelectedContent() {
    switch (_selectedTab) {
      case 'Series':
        return _series;
      case 'Channels':
        return _channels;
      default:
        return _movies;
    }
  }

  void _handleKeyEvent(RawKeyEvent event) {
    if (event is RawKeyDownEvent) {
      if (event.isKeyPressed(LogicalKeyboardKey.arrowLeft) ||
          event.isKeyPressed(LogicalKeyboardKey.arrowRight)) {
        if (_tabMode) {
          final isLeft = event.isKeyPressed(LogicalKeyboardKey.arrowLeft);
          setState(() {
            int tabIndex = _tabs.indexOf(_selectedTab);
            if (isLeft) {
              tabIndex = (tabIndex - 1).clamp(0, _tabs.length - 1);
            } else {
              tabIndex = (tabIndex + 1).clamp(0, _tabs.length - 1);
            }
            _selectedTab = _tabs[tabIndex];
            _focusedIndex = 0;
          });
        }
      } else if (event.isKeyPressed(LogicalKeyboardKey.arrowDown)) {
        setState(() {
          _tabMode = false;
          _contentFocusNode.requestFocus();
        });
      } else if (event.isKeyPressed(LogicalKeyboardKey.arrowUp)) {
        if (!_tabMode) {
          setState(() {
            _tabMode = true;
            _tabFocusNode.requestFocus();
          });
        }
      } else if (event.isKeyPressed(LogicalKeyboardKey.enter) ||
          event.isKeyPressed(LogicalKeyboardKey.select)) {
        if (!_tabMode) {
          final content = _getSelectedContent();
          if (_focusedIndex < content.length) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => TVPlayerScreen(
                  item: content[_focusedIndex],
                  itemType: _selectedTab.substring(0, _selectedTab.length - 1),
                ),
              ),
            );
          }
        }
      } else if (event.isKeyPressed(LogicalKeyboardKey.slash) ||
          event.character == '/') {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TVSearchScreen(allContent: _getSelectedContent()),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedContent = _getSelectedContent();
    final screenSize = MediaQuery.of(context).size;

    return RawKeyboardListener(
      focusNode: _tabMode ? _tabFocusNode : _contentFocusNode,
      onKey: _handleKeyEvent,
      child: Scaffold(
        backgroundColor: const Color(0xFF0a0a0a),
        body: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation(Color(0xFF3B82F6)),
                ),
              )
            : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // TV Header
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 40, vertical: 30),
                      color: const Color(0xFF1a1a2e),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'FENIX STREAMING',
                            style: TextStyle(
                              color: Color(0xFF3B82F6),
                              fontWeight: FontWeight.bold,
                              fontSize: 48,
                              letterSpacing: 2,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: _tabs.map((tab) {
                                  final isSelected = _selectedTab == tab;
                                  final tabIndex = _tabs.indexOf(tab);
                                  final isFocused =
                                      _tabMode && _focusedIndex == tabIndex;

                                  return GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _selectedTab = tab;
                                        _focusedIndex = tabIndex;
                                        _tabMode = true;
                                      });
                                      _tabFocusNode.requestFocus();
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 24, vertical: 12),
                                      margin: const EdgeInsets.only(right: 16),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? const Color(0xFF3B82F6)
                                            : Colors.transparent,
                                        border: Border.all(
                                          color: isFocused
                                              ? Colors.amber
                                              : (isSelected
                                                  ? const Color(0xFF3B82F6)
                                                  : Colors.grey[700]!),
                                          width: isFocused ? 3 : 2,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(8),
                                        boxShadow: isFocused
                                            ? [
                                                BoxShadow(
                                                  color: Colors.amber
                                                      .withOpacity(0.5),
                                                  blurRadius: 8,
                                                  spreadRadius: 2,
                                                )
                                              ]
                                            : [],
                                      ),
                                      child: Text(
                                        tab,
                                        style: TextStyle(
                                          color: isSelected
                                              ? Colors.white
                                              : Colors.grey[400],
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                              ElevatedButton.icon(
                                onPressed: widget.onLogout,
                                icon: const Icon(Icons.logout),
                                label: const Text('Logout'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF3B82F6),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 24, vertical: 12),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    // Content Grid
                    Padding(
                      padding: const EdgeInsets.all(40),
                      child: selectedContent.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.videocam_off,
                                    color: Colors.grey[600],
                                    size: 96,
                                  ),
                                  const SizedBox(height: 24),
                                  Text(
                                    'No $_selectedTab found',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 28,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'Press / to search',
                                    style: TextStyle(
                                      color: Colors.grey[400],
                                      fontSize: 18,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _selectedTab,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 24),
                                GridView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  gridDelegate:
                                      const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 5,
                                    childAspectRatio: 0.7,
                                    crossAxisSpacing: 20,
                                    mainAxisSpacing: 24,
                                  ),
                                  itemCount: selectedContent.length,
                                  itemBuilder: (context, index) {
                                    final item = selectedContent[index];
                                    final title = item['title'] ?? 'Unknown';
                                    final posterUrl = item['posterUrl'];
                                    final isFocused = !_tabMode &&
                                        _focusedIndex == index;

                                    return GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          _focusedIndex = index;
                                          _tabMode = false;
                                        });
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) =>
                                                TVPlayerScreen(
                                              item: item,
                                              itemType: _selectedTab
                                                  .substring(0,
                                                      _selectedTab.length - 1),
                                            ),
                                          ),
                                        );
                                      },
                                      child: Focus(
                                        onKey: (node, event) {
                                          if (event
                                              is RawKeyDownEvent) {
                                            if (event.isKeyPressed(
                                                LogicalKeyboardKey.arrowRight)) {
                                              setState(() {
                                                _focusedIndex = (_focusedIndex +
                                                        1)
                                                    .clamp(
                                                        0,
                                                        selectedContent
                                                                .length -
                                                            1);
                                              });
                                              return KeyEventResult.handled;
                                            } else if (event.isKeyPressed(
                                                LogicalKeyboardKey.arrowLeft)) {
                                              setState(() {
                                                _focusedIndex =
                                                    (_focusedIndex - 1)
                                                        .clamp(0, 0);
                                              });
                                              return KeyEventResult.handled;
                                            } else if (event.isKeyPressed(
                                                LogicalKeyboardKey.arrowUp)) {
                                              setState(() {
                                                _tabMode = true;
                                              });
                                              _tabFocusNode.requestFocus();
                                              return KeyEventResult.handled;
                                            } else if (event.isKeyPressed(
                                                LogicalKeyboardKey.enter)) {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) =>
                                                      TVPlayerScreen(
                                                    item: item,
                                                    itemType: _selectedTab
                                                        .substring(
                                                            0,
                                                            _selectedTab
                                                                    .length -
                                                                1),
                                                  ),
                                                ),
                                              );
                                              return KeyEventResult.handled;
                                            }
                                          }
                                          return KeyEventResult.ignored;
                                        },
                                        child: Container(
                                          decoration: BoxDecoration(
                                            borderRadius:
                                                BorderRadius.circular(10),
                                            color: const Color(0xFF1a1a2e),
                                            border: Border.all(
                                              color: isFocused
                                                  ? Colors.amber
                                                  : Colors.grey[800]!,
                                              width: isFocused ? 3 : 1,
                                            ),
                                            boxShadow: isFocused
                                                ? [
                                                    BoxShadow(
                                                      color: Colors.amber
                                                          .withOpacity(0.6),
                                                      blurRadius: 12,
                                                      spreadRadius: 4,
                                                    )
                                                  ]
                                                : [],
                                          ),
                                          child: posterUrl != null
                                              ? ClipRRect(
                                                  borderRadius:
                                                      BorderRadius.circular(10),
                                                  child: Stack(
                                                    children: [
                                                      Image.network(
                                                        posterUrl,
                                                        fit: BoxFit.cover,
                                                        errorBuilder: (context,
                                                            error, stack) {
                                                          return Container(
                                                            color: const Color(
                                                                0xFF1a1a2e),
                                                            child: Column(
                                                              mainAxisAlignment:
                                                                  MainAxisAlignment
                                                                      .center,
                                                              children: [
                                                                const Icon(
                                                                  Icons.movie,
                                                                  color: Color(
                                                                      0xFF3B82F6),
                                                                  size: 48,
                                                                ),
                                                                const SizedBox(
                                                                    height: 10),
                                                                Padding(
                                                                  padding:
                                                                      const EdgeInsets
                                                                          .all(
                                                                          8),
                                                                  child: Text(
                                                                    title,
                                                                    textAlign:
                                                                        TextAlign
                                                                            .center,
                                                                    maxLines: 2,
                                                                    overflow:
                                                                        TextOverflow
                                                                            .ellipsis,
                                                                    style: const TextStyle(
                                                                      color: Colors
                                                                          .white,
                                                                      fontSize:
                                                                          12,
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w500,
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          );
                                                        },
                                                      ),
                                                      if (isFocused)
                                                        Center(
                                                          child: Container(
                                                            padding:
                                                                const EdgeInsets
                                                                    .all(12),
                                                            decoration:
                                                                BoxDecoration(
                                                              shape: BoxShape
                                                                  .circle,
                                                              color: Colors
                                                                  .white
                                                                  .withOpacity(
                                                                      0.2),
                                                            ),
                                                            child: const Icon(
                                                              Icons.play_arrow,
                                                              color: Colors
                                                                  .white,
                                                              size: 40,
                                                            ),
                                                          ),
                                                        ),
                                                    ],
                                                  ),
                                                )
                                              : Container(
                                                  color: const Color(
                                                      0xFF1a1a2e),
                                                  child: Column(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .center,
                                                    children: [
                                                      const Icon(
                                                        Icons.movie,
                                                        color:
                                                            Color(0xFF3B82F6),
                                                        size: 48,
                                                      ),
                                                      const SizedBox(height: 10),
                                                      Padding(
                                                        padding:
                                                            const EdgeInsets
                                                                .all(8),
                                                        child: Text(
                                                          title,
                                                          textAlign:
                                                              TextAlign.center,
                                                          maxLines: 2,
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style: const TextStyle(
                                                            color:
                                                                Colors.white,
                                                            fontSize: 12,
                                                            fontWeight:
                                                                FontWeight.w500,
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ],
                            ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}
