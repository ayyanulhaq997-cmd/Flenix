import { useState, useCallback, useRef } from 'react';

export interface FocusableElement {
  id: string;
  row: number;
  col: number;
}

export function useTVNavigation(totalRows: number, rowLengths: number[]) {
  const [focusedItem, setFocusedItem] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [selectedTab, setSelectedTab] = useState(0);
  const focusRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { row, col } = focusedItem;
    const currentRowLength = rowLengths[row] || 0;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) {
          const newRow = row - 1;
          const maxCol = Math.min(col, (rowLengths[newRow] || 1) - 1);
          setFocusedItem({ row: newRow, col: maxCol });
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (row < totalRows - 1) {
          const newRow = row + 1;
          const maxCol = Math.min(col, (rowLengths[newRow] || 1) - 1);
          setFocusedItem({ row: newRow, col: maxCol });
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) {
          setFocusedItem({ row, col: col - 1 });
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (col < currentRowLength - 1) {
          setFocusedItem({ row, col: col + 1 });
        }
        break;

      case 'Enter':
        e.preventDefault();
        const element = document.querySelector(`[data-focus-id="row-${row}-col-${col}"]`);
        if (element instanceof HTMLElement) {
          element.click();
        }
        break;

      default:
        break;
    }
  }, [focusedItem, rowLengths, totalRows]);

  return {
    focusedItem,
    setFocusedItem,
    handleKeyDown,
    selectedTab,
    setSelectedTab,
  };
}
