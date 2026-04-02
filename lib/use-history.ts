import { useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';

interface HistoryState {
  past: Array<{ nodes: Node[]; edges: Edge[] }>;
  present: { nodes: Node[]; edges: Edge[] };
  future: Array<{ nodes: Node[]; edges: Edge[] }>;
}

export function useHistory(initialState: { nodes: Node[]; edges: Edge[] }) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: [],
  });

  const set = useCallback((newState: { nodes: Node[]; edges: Edge[] }) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: newState,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    nodes: history.present.nodes,
    edges: history.present.edges,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
  };
}
