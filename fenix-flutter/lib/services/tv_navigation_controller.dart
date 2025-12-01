import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// TV Navigation Controller - Handles D-pad/remote control input
/// Provides perfect focus management for 10-foot UI
class TVNavigationController {
  static final TVNavigationController _instance = TVNavigationController._internal();

  factory TVNavigationController() {
    return _instance;
  }

  TVNavigationController._internal();

  final List<FocusNode> _focusNodes = [];
  int _currentFocusIndex = 0;
  bool _isNavigating = false;

  /// Register focus nodes for navigation
  void registerFocusNodes(List<FocusNode> nodes) {
    _focusNodes.clear();
    _focusNodes.addAll(nodes);
    if (_focusNodes.isNotEmpty) {
      _focusNodes[0].requestFocus();
      _currentFocusIndex = 0;
    }
  }

  /// Handle D-pad/remote key events
  void handleKeyEvent(RawKeyEvent event) {
    if (_focusNodes.isEmpty) return;
    if (_isNavigating) return; // Debounce rapid navigation

    _isNavigating = true;
    Future.delayed(Duration(milliseconds: 100), () => _isNavigating = false);

    if (event.isKeyPressed(LogicalKeyboardKey.arrowUp)) {
      _navigateUp();
    } else if (event.isKeyPressed(LogicalKeyboardKey.arrowDown)) {
      _navigateDown();
    } else if (event.isKeyPressed(LogicalKeyboardKey.arrowLeft)) {
      _navigateLeft();
    } else if (event.isKeyPressed(LogicalKeyboardKey.arrowRight)) {
      _navigateRight();
    }
  }

  /// Navigate to previous item (up/left)
  void _navigateUp() {
    _currentFocusIndex = (_currentFocusIndex - 1).clamp(0, _focusNodes.length - 1);
    _focusNodes[_currentFocusIndex].requestFocus();
  }

  /// Navigate to next item (down/right)
  void _navigateDown() {
    _currentFocusIndex = (_currentFocusIndex + 1).clamp(0, _focusNodes.length - 1);
    _focusNodes[_currentFocusIndex].requestFocus();
  }

  /// Navigate left (grid navigation)
  void _navigateLeft() {
    _currentFocusIndex = (_currentFocusIndex - 4).clamp(0, _focusNodes.length - 1);
    _focusNodes[_currentFocusIndex].requestFocus();
  }

  /// Navigate right (grid navigation)
  void _navigateRight() {
    _currentFocusIndex = (_currentFocusIndex + 4).clamp(0, _focusNodes.length - 1);
    _focusNodes[_currentFocusIndex].requestFocus();
  }

  /// Get current focused index
  int get currentFocusIndex => _currentFocusIndex;

  /// Reset navigation state
  void reset() {
    _currentFocusIndex = 0;
    _isNavigating = false;
  }

  /// Clear all focus nodes
  void clear() {
    _focusNodes.clear();
    _currentFocusIndex = 0;
  }
}

/// Widget for TV focus with proper scaling and glow effect
class TVFocusable extends StatefulWidget {
  final Widget child;
  final VoidCallback? onSelected;
  final Color focusColor;
  final Duration animationDuration;

  const TVFocusable({
    required this.child,
    this.onSelected,
    this.focusColor = Colors.amber,
    this.animationDuration = const Duration(milliseconds: 200),
  });

  @override
  State<TVFocusable> createState() => _TVFocusableState();
}

class _TVFocusableState extends State<TVFocusable> with SingleTickerProviderStateMixin {
  late FocusNode _focusNode;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _focusNode = FocusNode();
    _animationController = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );

    _focusNode.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    if (_focusNode.hasFocus) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: Focus(
        focusNode: _focusNode,
        onKey: (node, event) {
          if (event.isKeyPressed(LogicalKeyboardKey.enter) ||
              event.isKeyPressed(LogicalKeyboardKey.select)) {
            widget.onSelected?.call();
            return KeyEventResult.handled;
          }
          return KeyEventResult.ignored;
        },
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: _focusNode.hasFocus ? widget.focusColor : Colors.transparent,
              width: 3,
            ),
            boxShadow: _focusNode.hasFocus
                ? [
                    BoxShadow(
                      color: widget.focusColor.withOpacity(0.6),
                      blurRadius: 20,
                      spreadRadius: 2,
                    )
                  ]
                : [],
            borderRadius: BorderRadius.circular(8),
          ),
          child: widget.child,
        ),
      ),
    );
  }
}

/// Grid layout with perfect D-pad navigation for TV
class TVGridView extends StatefulWidget {
  final List<Widget> items;
  final int columnsPerPage;
  final double itemSpacing;
  final EdgeInsets padding;
  final ScrollController? scrollController;

  const TVGridView({
    required this.items,
    this.columnsPerPage = 4,
    this.itemSpacing = 32,
    this.padding = const EdgeInsets.all(24),
    this.scrollController,
  });

  @override
  State<TVGridView> createState() => _TVGridViewState();
}

class _TVGridViewState extends State<TVGridView> {
  final List<FocusNode> _itemFocusNodes = [];
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = widget.scrollController ?? ScrollController();
    _initializeFocusNodes();
  }

  void _initializeFocusNodes() {
    for (int i = 0; i < widget.items.length; i++) {
      _itemFocusNodes.add(FocusNode());
    }
  }

  @override
  void dispose() {
    for (var node in _itemFocusNodes) {
      node.dispose();
    }
    if (widget.scrollController == null) {
      _scrollController.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      controller: _scrollController,
      padding: widget.padding,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: widget.columnsPerPage,
        mainAxisSpacing: widget.itemSpacing,
        crossAxisSpacing: widget.itemSpacing,
        childAspectRatio: 0.9,
      ),
      itemCount: widget.items.length,
      itemBuilder: (context, index) {
        return TVFocusable(
          child: widget.items[index],
          onSelected: () {
            // Handle selection
            print('Item $index selected');
          },
        );
      },
    );
  }
}
