import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    useRef,
    ReactNode,
  } from "react";
  import { Column, Member, Tag, Task } from "@/app/types/board";
  
  const recalculatePositions = (tasks: Task[]): Task[] =>
    tasks.map((task, index) => ({ ...task, position: index }));
  
  const reorderTasksInSameColumn = (
    tasks: Task[],
    taskId: number,
    toIndex: number
  ): Task[] => {
    const sorted = [...tasks].sort((a, b) => (a.position || 0) - (b.position || 0));
    const task = sorted.find((t) => t.id === taskId);
    if (!task) return tasks;
    const filtered = sorted.filter((t) => t.id !== taskId);
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
    const cleanedSource = recalculatePositions(sourceTasks.filter((t) => t.id !== task.id));
    const targetWithNew = [...targetTasks, updatedTask].sort((a, b) => (a.position || 0) - (b.position || 0));
    targetWithNew.splice(toIndex, 0, updatedTask);
    return {
      source: cleanedSource,
      target: recalculatePositions([...new Set(targetWithNew)]),
    };
  };
  
  const areColumnsEqual = (cols1: Column[], cols2: Column[]): boolean => {
    if (cols1.length !== cols2.length) return false;
    return cols1.every((col1, i) => {
      const col2 = cols2[i];
      return (
        col1.id === col2.id &&
        col1.name === col2.name &&
        col1.color === col2.color &&
        col1.position === col2.position &&
        col1.tasks.length === col2.tasks.length &&
        col1.tasks.every((t1, j) => {
          const t2 = col2.tasks[j];
          return t1?.id === t2?.id && t1?.columnId === t2?.columnId;
        })
      );
    });
  };
  
  type BoardState = {
    columns: Column[];
    tags: Tag[];
    members: Member[];
    draggedItem: {
      type: "column" | "task";
      id: number;
      sourceIndex: number;
      sourceColumnId?: number;
    } | null;
    projectId: number;
  };
  
  type BoardAction =
    | { type: "SET_COLUMNS"; payload: Column[] }
    | { type: "MOVE_COLUMN"; payload: { fromIndex: number; toIndex: number } }
    | { type: "ADD_COLUMN"; payload: Column }
    | { type: "UPDATE_COLUMN"; payload: { columnId: number; column: Column } }
    | { type: "REMOVE_COLUMN"; payload: number }
    | { type: "MOVE_TASK"; payload: { taskId: number; fromColumnId: number; toColumnId: number; toIndex: number } }
    | { type: "START_DRAG"; payload: { type: "column" | "task"; id: number; sourceIndex: number; sourceColumnId?: number } }
    | { type: "END_DRAG" }
    | { type: "UPDATE_TASK"; payload: { taskId: number; updates: Partial<Task> } }
    | { type: "ADD_TASK"; payload: { columnId: number; task: Task } }
    | { type: "REMOVE_TASK"; payload: { columnId: number; taskId: number } }
    | { type: "ADD_TAG"; payload: Tag }
    | { type: "SET_MEMBERS"; payload: Member[] }
    | { type: "ADD_MEMBER"; payload: Member }
    | { type: "UPDATE_MEMBER"; payload: { memberId: number; updates: Partial<Member> } }
    | { type: "REMOVE_MEMBER"; payload: number };
  
  const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
    switch (action.type) {
      case "SET_COLUMNS":
        return { ...state, columns: action.payload };
      case "MOVE_COLUMN": {
        const columns = [...state.columns];
        const [moved] = columns.splice(action.payload.fromIndex, 1);
        columns.splice(action.payload.toIndex, 0, moved);
        return { ...state, columns };
      }
      case "ADD_COLUMN": {
        const newColumn = action.payload;
        const updatedColumns = [...state.columns, newColumn];
        return { ...state, columns: updatedColumns };
      }
      case "UPDATE_COLUMN": {
        const { columnId, column } = action.payload;
        const updatedColumns = state.columns.map((col) => 
          col.id === columnId ? column : col
        );
        return { ...state, columns: updatedColumns };
      }
      case "REMOVE_COLUMN": {
        const columnIdToRemove = action.payload;
        const updatedColumns = state.columns.filter((col) => col.id !== columnIdToRemove);
        return { ...state, columns: updatedColumns };
      }
      case "MOVE_TASK": {
        const { taskId, fromColumnId, toColumnId, toIndex } = action.payload;
        const task = state.columns.flatMap((col) => col.tasks).find((t) => t.id === taskId);
        if (!task) return state;
        const updatedColumns = state.columns.map((col) => {
          if (col.id === fromColumnId && col.id === toColumnId) {
            return { ...col, tasks: reorderTasksInSameColumn(col.tasks, taskId, toIndex) };
          }
          if (col.id === fromColumnId) {
            const { source } = moveTaskToAnotherColumn(col.tasks, [], task, 0, toColumnId);
            return { ...col, tasks: source };
          }
          if (col.id === toColumnId) {
            const { target } = moveTaskToAnotherColumn([], col.tasks, task, toIndex, toColumnId);
            return { ...col, tasks: target };
          }
          return col;
        });
        return { ...state, columns: updatedColumns };
      }
      case "START_DRAG":
        return { ...state, draggedItem: action.payload };
      case "END_DRAG":
        return { ...state, draggedItem: null };
      case "UPDATE_TASK": {
        const columns = state.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === action.payload.taskId ? { ...t, ...action.payload.updates } : t)),
        }));
        return { ...state, columns };
      }
      case "ADD_TASK": {
        const columns = state.columns.map((col) =>
          col.id === action.payload.columnId
            ? { ...col, tasks: recalculatePositions([...col.tasks, action.payload.task]) }
            : col
        );
        return { ...state, columns };
      }
      case "REMOVE_TASK": {
        const columns = state.columns.map((col) =>
          col.id === action.payload.columnId
            ? { ...col, tasks: recalculatePositions(col.tasks.filter((t) => t.id !== action.payload.taskId)) }
            : col
        );
        return { ...state, columns };
      }
      case "ADD_TAG":
        return { ...state, tags: [...state.tags, action.payload] };
      case "SET_MEMBERS":
        return { ...state, members: action.payload };
      case "ADD_MEMBER":
        return { ...state, members: [...state.members, action.payload] };
      case "UPDATE_MEMBER":
        return {
          ...state,
          members: state.members.map((m) => (m.id === action.payload.memberId ? { ...m, ...action.payload.updates } : m)),
        };
      case "REMOVE_MEMBER":
        return { ...state, members: state.members.filter((m) => m.id !== action.payload) };
      default:
        return state;
    }
  };
  
  const initialBoardState = (
    columns: Column[] = [],
    tags: Tag[] = [],
    members: Member[] = [],
    projectId: number
  ): BoardState => ({
    columns,
    tags,
    members,
    draggedItem: null,
    projectId,
  });
  
  const useBoardLogic = (initialColumns: Column[], initialTags: Tag[], initialMembers: Member[], projectId: number) => {
    const [state, dispatch] = useReducer(boardReducer, initialBoardState(initialColumns, initialTags, initialMembers, projectId));
    const prevColumnsRef = useRef<Column[]>([]);
  
    useEffect(() => {
      if (!areColumnsEqual(initialColumns, prevColumnsRef.current)) {
        prevColumnsRef.current = initialColumns;
        dispatch({ type: "SET_COLUMNS", payload: initialColumns });
      }
    }, [initialColumns]);
  
    const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
      dispatch({ type: "MOVE_COLUMN", payload: { fromIndex, toIndex } });
    }, []);
  
        const addColumn = useCallback((column: Column) => {
      dispatch({ type: "ADD_COLUMN", payload: column });
    }, []);

    const updateColumn = useCallback((columnId: number, column: Column) => {
      dispatch({ type: "UPDATE_COLUMN", payload: { columnId, column } });
    }, []);

    const removeColumn = useCallback((columnId: number) => {
      dispatch({ type: "REMOVE_COLUMN", payload: columnId });
    }, []);
  
    const moveTask = useCallback((taskId: number, fromColumnId: number, toColumnId: number, toIndex: number) => {
      dispatch({ type: "MOVE_TASK", payload: { taskId, fromColumnId, toColumnId, toIndex } });
    }, []);
  
    const startDrag = useCallback((type: "column" | "task", id: number, sourceIndex: number, sourceColumnId?: number) => {
      dispatch({ type: "START_DRAG", payload: { type, id, sourceIndex, sourceColumnId } });
    }, []);
  
    const endDrag = useCallback(() => {
      dispatch({ type: "END_DRAG" });
    }, []);
  
    const updateTask = useCallback((taskId: number, updates: Partial<Task>) => {
      dispatch({ type: "UPDATE_TASK", payload: { taskId, updates } });
    }, []);
  
    const addTask = useCallback((columnId: number, task: Task) => {
      dispatch({ type: "ADD_TASK", payload: { columnId, task } });
    }, []);
  
    const removeTask = useCallback((columnId: number, taskId: number) => {
      dispatch({ type: "REMOVE_TASK", payload: { columnId, taskId } });
    }, []);
  
    const addTag = useCallback((tag: Tag) => {
      dispatch({ type: "ADD_TAG", payload: tag });
    }, []);
  
    const addMember = useCallback((member: Member) => {
      dispatch({ type: "ADD_MEMBER", payload: member });
    }, []);
  
    const updateMember = useCallback((memberId: number, updates: Partial<Member>) => {
      dispatch({ type: "UPDATE_MEMBER", payload: { memberId, updates } });
    }, []);
  
    const removeMember = useCallback((memberId: number) => {
      dispatch({ type: "REMOVE_MEMBER", payload: memberId });
    }, []);
  
    return {
      ...state,
      moveColumn,
      addColumn,
      updateColumn,
      removeColumn,
      moveTask,
      startDrag,
      endDrag,
      updateTask,
      addTask,
      removeTask,
      addTag,
      addMember,
      updateMember,
      removeMember,
      projectId,
    };
  };
  
  type BoardContextType = ReturnType<typeof useBoardLogic>;
  export const BoardContext = createContext<BoardContextType | undefined>(undefined);
  
  export const BoardProvider = ({
    initialColumns = [],
    initialTags = [],
    initialMembers = [],
    projectId,
    children,
  }: {
    initialColumns?: Column[];
    initialTags?: Tag[];
    initialMembers?: Member[];
    projectId: number;
    children: ReactNode;
  }) => {
    const board = useBoardLogic(initialColumns, initialTags, initialMembers, projectId);
    return <BoardContext.Provider value={board}>{children}</BoardContext.Provider>;
  };
  
  export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) throw new Error("useBoard must be used within a BoardProvider");
    return context;
  };
  