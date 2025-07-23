import { useReducer, useCallback, useEffect, useRef } from 'react';
import { Column, Task } from '../components/board/Board';


const recalculatePositions = (tasks: Task[]): Task[] =>
  tasks.map((task, index) => ({ ...task, position: index }));

const reorderTasksInSameColumn = (
  tasks: Task[],
  taskId: number,
  toIndex: number
): Task[] => {
  const sorted = [...tasks].sort((a, b) => (a.position || 0) - (b.position || 0));
  const task = sorted.find(t => t.id === taskId);
  if (!task) return tasks;
  const filtered = sorted.filter(t => t.id !== taskId);
  filtered.splice(toIndex, 0, { ...task });
  return recalculatePositions(filtered);
};

const moveTaskToAnotherColumn = (
  sourceTasks: Task[],
  targetTasks: Task[],
  task: Task,
  toIndex: number,
  toColumnId: number
): { source: Task[]; target: Task[] } => {
  const updatedTask = { ...task, columnId: toColumnId };
  const cleanedSource = recalculatePositions(sourceTasks.filter(t => t.id !== task.id));
  const targetWithNew = [...targetTasks, updatedTask].sort(
    (a, b) => (a.position || 0) - (b.position || 0)
  );
  targetWithNew.splice(toIndex, 0, updatedTask);
  return {
    source: cleanedSource,
    target: recalculatePositions(targetWithNew.filter((t, i, arr) => arr.indexOf(t) === i)),
  };
};

const areColumnsEqual = (cols1: Column[], cols2: Column[]): boolean => {
  if (cols1.length !== cols2.length) return false;

  return cols1.every((col1, i) => {
    const col2 = cols2[i];
    if (
      col1.id !== col2.id ||
      col1.name !== col2.name ||
      col1.color !== col2.color ||
      col1.position !== col2.position ||
      col1.tasks.length !== col2.tasks.length
    )
      return false;

    const sorted1 = [...col1.tasks].sort((a, b) => a.id - b.id);
    const sorted2 = [...col2.tasks].sort((a, b) => a.id - b.id);

    return sorted1.every((t1, j) => {
      const t2 = sorted2[j];
      return t1.id === t2.id && t1.columnId === t2.columnId;
    });
  });
};


type BoardState = {
  columns: Column[];
  draggedItem: {
    type: 'column' | 'task';
    id: number;
    sourceIndex: number;
    sourceColumnId?: number;
  } | null;
};

type BoardAction =
  | { type: 'SET_COLUMNS'; payload: Column[] }
  | { type: 'MOVE_COLUMN'; payload: { fromIndex: number; toIndex: number } }
  | {
      type: 'MOVE_TASK';
      payload: {
        taskId: number;
        fromColumnId: number;
        toColumnId: number;
        toIndex: number;
      };
    }
  | {
      type: 'START_DRAG';
      payload: {
        type: 'column' | 'task';
        id: number;
        sourceIndex: number;
        sourceColumnId?: number;
      };
    }
  | { type: 'END_DRAG' }
  | { type: 'UPDATE_TASK'; payload: { taskId: number; updates: Partial<Task> } }
  | { type: 'ADD_TASK'; payload: { columnId: number; task: Task } }
  | { type: 'REMOVE_TASK'; payload: { columnId: number; taskId: number } };


const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'SET_COLUMNS':
      return { ...state, columns: action.payload };

    case 'MOVE_COLUMN': {
      const columns = [...state.columns];
      const [moved] = columns.splice(action.payload.fromIndex, 1);
      columns.splice(action.payload.toIndex, 0, moved);
      return { ...state, columns };
    }

    case 'MOVE_TASK': {
      const { taskId, fromColumnId, toColumnId, toIndex } = action.payload;
      const task = state.columns
        .flatMap(col => col.tasks)
        .find(t => t.id === taskId);
      if (!task) return state;

      const updatedColumns = state.columns.map(col => {
        if (col.id === fromColumnId && col.id === toColumnId) {
          return {
            ...col,
            tasks: reorderTasksInSameColumn(col.tasks, taskId, toIndex),
          };
        }
        if (col.id === fromColumnId) {
          const result = moveTaskToAnotherColumn(col.tasks, [], task, 0, toColumnId);
          return { ...col, tasks: result.source };
        }
        if (col.id === toColumnId) {
          const result = moveTaskToAnotherColumn([], col.tasks, task, toIndex, toColumnId);
          return { ...col, tasks: result.target };
        }
        return col;
      });

      return { ...state, columns: updatedColumns };
    }

    case 'START_DRAG':
      return { ...state, draggedItem: action.payload };

    case 'END_DRAG':
      return { ...state, draggedItem: null };

    case 'UPDATE_TASK': {
      const columns = state.columns.map(col => ({
        ...col,
        tasks: col.tasks.map(t =>
          t.id === action.payload.taskId ? { ...t, ...action.payload.updates } : t
        ),
      }));
      return { ...state, columns };
    }

    case 'ADD_TASK': {
      const columns = state.columns.map(col =>
        col.id === action.payload.columnId
          ? {
              ...col,
              tasks: recalculatePositions([...col.tasks, action.payload.task]),
            }
          : col
      );
      return { ...state, columns };
    }

    case 'REMOVE_TASK': {
      const columns = state.columns.map(col =>
        col.id === action.payload.columnId
          ? {
              ...col,
              tasks: recalculatePositions(
                col.tasks.filter(t => t.id !== action.payload.taskId)
              ),
            }
          : col
      );
      return { ...state, columns };
    }

    default:
      return state;
  }
};


export const useBoardState = (initialColumns: Column[] = []) => {
  const [state, dispatch] = useReducer(boardReducer, {
    columns: initialColumns,
    draggedItem: null,
  });

  const prevColumnsRef = useRef<Column[]>([]);

  useEffect(() => {
    if (!areColumnsEqual(initialColumns, prevColumnsRef.current)) {
      prevColumnsRef.current = initialColumns;
      dispatch({ type: 'SET_COLUMNS', payload: initialColumns });
    }
  }, [initialColumns]);

  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'MOVE_COLUMN', payload: { fromIndex, toIndex } });
  }, []);

  const moveTask = useCallback(
    (taskId: number, fromColumnId: number, toColumnId: number, toIndex: number) => {
      dispatch({
        type: 'MOVE_TASK',
        payload: { taskId, fromColumnId, toColumnId, toIndex },
      });
    },
    []
  );

  const startDrag = useCallback(
    (type: 'column' | 'task', id: number, sourceIndex: number, sourceColumnId?: number) => {
      dispatch({ type: 'START_DRAG', payload: { type, id, sourceIndex, sourceColumnId } });
    },
    []
  );

  const endDrag = useCallback(() => {
    dispatch({ type: 'END_DRAG' });
  }, []);

  const updateTask = useCallback((taskId: number, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } });
  }, []);

  const addTask = useCallback((columnId: number, task: Task) => {
    dispatch({ type: 'ADD_TASK', payload: { columnId, task } });
  }, []);

  const removeTask = useCallback((columnId: number, taskId: number) => {
    dispatch({ type: 'REMOVE_TASK', payload: { columnId, taskId } });
  }, []);

  return {
    columns: state.columns,
    draggedItem: state.draggedItem,
    moveColumn,
    moveTask,
    startDrag,
    endDrag,
    updateTask,
    addTask,
    removeTask,
  };
};
