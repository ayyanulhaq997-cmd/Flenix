import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'tv_player_screen.dart';

class TVSearchScreen extends StatefulWidget {
  final List<dynamic> allContent;

  const TVSearchScreen({
    Key? key,
    required this.allContent,
  }) : super(key: key);

  @override
  State<TVSearchScreen> createState() => _TVSearchScreenState();
}

class _TVSearchScreenState extends State<TVSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _filteredContent = [];
  int _focusedIndex = 0;
  late FocusNode _searchFocusNode;

  @override
  void initState() {
    super.initState();
    _searchFocusNode = FocusNode();
    Future.delayed(const Duration(milliseconds: 100), () {
      _searchFocusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  void _filterContent() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredContent = widget.allContent
          .where((item) =>
              (item['title'] ?? '').toString().toLowerCase().contains(query) ||
              (item['description'] ?? '').toString().toLowerCase().contains(query) ||
              (item['genre'] ?? '').toString().toLowerCase().contains(query))
          .toList();
      _focusedIndex = 0;
    });
  }

  void _handleKeyEvent(RawKeyEvent event) {
    if (event is RawKeyDownEvent) {
      if (event.isKeyPressed(LogicalKeyboardKey.backspace)) {
        if (_searchController.text.isNotEmpty) {
          _searchController.text = _searchController.text.substring(0, _searchController.text.length - 1);
        }
      } else if (event.isKeyPressed(LogicalKeyboardKey.arrowRight)) {
        setState(() {
          _focusedIndex = (_focusedIndex + 1).clamp(0, _filteredContent.length - 1);
        });
      } else if (event.isKeyPressed(LogicalKeyboardKey.arrowLeft)) {
        setState(() {
          _focusedIndex = (_focusedIndex - 1).clamp(0, _filteredContent.length - 1);
        });
      } else if (event.isKeyPressed(LogicalKeyboardKey.enter)) {
        if (_filteredContent.isNotEmpty && _focusedIndex < _filteredContent.length) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TVPlayerScreen(
                item: _filteredContent[_focusedIndex],
                itemType: 'Content',
              ),
            ),
          );
        }
      } else if (event.isKeyPressed(LogicalKeyboardKey.escape)) {
        Navigator.pop(context);
      } else if (event.character != null && event.character!.isNotEmpty) {
        setState(() {
          _searchController.text += event.character!;
          _filterContent();
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return RawKeyboardListener(
      focusNode: _searchFocusNode,
      onKey: _handleKeyEvent,
      child: Scaffold(
        backgroundColor: const Color(0xFF0a0a0a),
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 30),
              color: const Color(0xFF1a1a2e),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'SEARCH',
                        style: TextStyle(
                          color: Color(0xFF3B82F6),
                          fontWeight: FontWeight.bold,
                          fontSize: 36,
                          letterSpacing: 2,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.grey),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0a0a0a),
                      border: Border.all(color: const Color(0xFF3B82F6), width: 2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Type to search (use D-pad arrow keys)',
                        hintStyle: TextStyle(color: Colors.grey[600]),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Results
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: _searchController.text.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search,
                              color: Colors.grey[600],
                              size: 96,
                            ),
                            const SizedBox(height: 24),
                            Text(
                              'Start typing to search',
                              style: TextStyle(
                                color: Colors.grey[400],
                                fontSize: 20,
                              ),
                            ),
                          ],
                        ),
                      )
                    : _filteredContent.isEmpty
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
                                  'No results found for "${_searchController.text}"',
                                  style: TextStyle(
                                    color: Colors.grey[400],
                                    fontSize: 20,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Try a different search term',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : GridView.builder(
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 5,
                              childAspectRatio: 0.7,
                              crossAxisSpacing: 20,
                              mainAxisSpacing: 24,
                            ),
                            itemCount: _filteredContent.length,
                            itemBuilder: (context, index) {
                              final item = _filteredContent[index];
                              final title = item['title'] ?? 'Unknown';
                              final posterUrl = item['posterUrl'];
                              final isFocused = _focusedIndex == index;

                              return GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => TVPlayerScreen(
                                        item: item,
                                        itemType: 'Content',
                                      ),
                                    ),
                                  );
                                },
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(10),
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
                                              color: Colors.amber.withOpacity(0.6),
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
                                                errorBuilder: (context, error,
                                                    stack) {
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
                                                            overflow:
                                                                TextOverflow
                                                                    .ellipsis,
                                                            style: const TextStyle(
                                                              color: Colors
                                                                  .white,
                                                              fontSize: 12,
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
                                                        const EdgeInsets.all(
                                                            12),
                                                    decoration: BoxDecoration(
                                                      shape: BoxShape.circle,
                                                      color: Colors.white
                                                          .withOpacity(0.2),
                                                    ),
                                                    child: const Icon(
                                                      Icons.play_arrow,
                                                      color: Colors.white,
                                                      size: 40,
                                                    ),
                                                  ),
                                                ),
                                            ],
                                          ),
                                        )
                                      : Container(
                                          color: const Color(0xFF1a1a2e),
                                          child: Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: [
                                              const Icon(
                                                Icons.movie,
                                                color: Color(0xFF3B82F6),
                                                size: 48,
                                              ),
                                              const SizedBox(height: 10),
                                              Padding(
                                                padding:
                                                    const EdgeInsets.all(8),
                                                child: Text(
                                                  title,
                                                  textAlign: TextAlign.center,
                                                  maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                ),
                              );
                            },
                          ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
