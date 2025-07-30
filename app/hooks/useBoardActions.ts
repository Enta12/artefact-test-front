import { useCallback, useRef, useEffect } from "react";
import { useBoardContext } from "@/context/useBoardContext";
import { useAuthMutation } from "./useAuthQuery";
import { Task, Tag, Member, Column } from "@/app/types/board";
import { TaskFormData } from "../types/task";

interface PendingMove {
  taskId: number;
  sourceColumnId: number;
  targetColumnId: number;
  targetPosition: number;
  timestamp: number;
}

interface PendingColumnMove {
  columnId: number;
  newPosition: number;
  timestamp: number;
}

export const useBoardActions = () => {
  const board = useBoardContext();
  const pendingMovesRef = useRef<PendingMove[]>([]);
  const pendingColumnMovesRef = useRef<PendingColumnMove[]>([]);
  const columnSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (columnSyncTimeoutRef.current) {
        clearTimeout(columnSyncTimeoutRef.current);
      }
    };
  }, []);

  const addTaskMutation = useAuthMutation<
    Task,
    Error,
    {
      task: {
        tagIds: Array<number>;
        startDate?: string;
        endDate?: string;
        dueDate?: string;
      } & Omit<
        Task,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "tags"
        | "startDate"
        | "endDate"
        | "dueDate"
      >;
    }
  >(({ task }) => ({
    url: `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
    method: "POST",
    data: task,
  }));

  const removeTaskMutation = useAuthMutation<void, Error, { taskId: number }>(
    ({ taskId }) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
      method: "DELETE",
    })
  );

  const updateTaskMutation = useAuthMutation<
    Task,
    Error,
    {
      taskId: number;
      updates: {
        tagIds: Array<number>;
        startDate?: string;
        endDate?: string;
        dueDate?: string;
      } & Omit<
        Task,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "tags"
        | "startDate"
        | "endDate"
        | "dueDate"
        | "columnId"
        | "position"
        | "projectId"
      >;
    }
  >(({ taskId, updates }) => ({
    url: `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
    method: "PATCH",
    data: updates,
  }));

  const updateTaskPosition = useAuthMutation<void, Error, PendingMove>(
    ({ taskId, targetColumnId, targetPosition }) => {
      return {
        url: `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
        method: 'PATCH',
        data: { columnId: targetColumnId, position: targetPosition },
      };
    },
    {
      retry: 2,
      onSuccess: (_, variables) => {
        pendingMovesRef.current = pendingMovesRef.current.filter(
          move => move.taskId !== variables.taskId || move.timestamp !== variables.timestamp
        );
      },
      onError: (error, variables) => {
        console.error('❌ Task synchronization error:', variables.taskId, error);
        
        pendingMovesRef.current = pendingMovesRef.current.filter(
          move => move.taskId !== variables.taskId || move.timestamp !== variables.timestamp
        );
  
      }
    }
  );

  const addTask = useCallback(
    async (columnId: number, data: TaskFormData) => {
      const formattedTask = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        columnId,
        projectId: board.projectId,
        position:
          Math.max(
            0,
            ...(board.columns
              .find((col) => col.id === columnId)
              ?.tasks.map((task) => task.position) || [-1])
          ) + 1,
        tagIds: data.selectedTags.map((tag) => tag.id),
        userId: data.assignedToId,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        dueDate: data.dueDate?.toISOString(),
      };
      const res = await addTaskMutation.mutateAsync({ task: formattedTask });
      board.addTask(columnId, res);
    },
    [board, addTaskMutation]
  );

  const removeTask = useCallback(
    (columnId: number, taskId: number) => {
      board.removeTask(columnId, taskId);
      removeTaskMutation.mutate({ taskId });
    },
    [board, removeTaskMutation]
  );

  const updateTask = useCallback(
    async (taskId: number, data: TaskFormData) => {
      const formattedTask = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        tagIds: data.selectedTags.map((tag) => tag.id),
        userId: data.assignedToId,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        dueDate: data.dueDate?.toISOString(),
      };
      const res = await updateTaskMutation.mutateAsync({
        taskId,
        updates: formattedTask,
      });
      board.updateTask(taskId, res);
    },
    [board, updateTaskMutation]
  );

  const syncSingleTaskMove = useCallback(async (
    taskId: number, 
    sourceColumnId: number, 
    targetColumnId: number, 
    targetPosition: number
  ) => {
    const pendingMove: PendingMove = {
      taskId,
      sourceColumnId,
      targetColumnId,
      targetPosition,
      timestamp: Date.now()
    };
    
    pendingMovesRef.current.push(pendingMove);
    
    setTimeout(() => {
      if (pendingMovesRef.current.some(m => 
        m.taskId === taskId && m.timestamp === pendingMove.timestamp
      )) {
        updateTaskPosition.mutate(pendingMove);
      }
    }, 300);
  }, [updateTaskPosition]);

  const moveTask = useCallback(
    (
      taskId: number,
      fromColumnId: number,
      toColumnId: number,
      toIndex: number
    ) => {
      board.moveTask(taskId, fromColumnId, toColumnId, toIndex);
      syncSingleTaskMove(taskId, fromColumnId, toColumnId, toIndex);
    },
    [board, syncSingleTaskMove]
  );

  const updateColumnPosition = useAuthMutation<void, Error, { columnId: number; position: number }>(
    ({ columnId, position }) => {
      return {
        url: `${process.env.NEXT_PUBLIC_API_URL}/columns/${columnId}`,
        method: 'PATCH',
        data: { position },
      };
    },
    {
      retry: 2,
      retryDelay: 1000,
    }
  );

  const createColumnMutation = useAuthMutation<
    Column,
    Error,
    { name: string; color?: string; position: number; projectId: number }
  >(({ name, color, position, projectId }) => ({
    url: `${process.env.NEXT_PUBLIC_API_URL}/columns`,
    method: "POST",
    data: { name, color, position, projectId },
  }));

  const updateColumnMutation = useAuthMutation<
    Column,
    Error,
    { columnId: number; name: string; color: string }
  >(({ columnId, name, color }) => ({
    url: `${process.env.NEXT_PUBLIC_API_URL}/columns/${columnId}`,
    method: "PATCH",
    data: { name, color },
  }));

  const deleteColumnMutation = useAuthMutation<
    void,
    Error,
    { columnId: number }
  >(({ columnId }) => ({
    url: `${process.env.NEXT_PUBLIC_API_URL}/columns/${columnId}`,
    method: "DELETE",
  }));

  const syncColumnMove = useCallback((columnId: number, newPosition: number) => {
    if (newPosition < 0) {
      console.warn('❌ Invalid position for column:', columnId, 'position:', newPosition);
      return;
    }
    
    const pendingMove: PendingColumnMove = {
      columnId,
      newPosition,
      timestamp: Date.now()
    };
    
    pendingColumnMovesRef.current = pendingColumnMovesRef.current.filter(
      move => move.columnId !== columnId
    );
    
    pendingColumnMovesRef.current.push(pendingMove);
    
    if (columnSyncTimeoutRef.current) {
      clearTimeout(columnSyncTimeoutRef.current);
    }
    
    columnSyncTimeoutRef.current = setTimeout(() => {
      const movesToProcess = [...pendingColumnMovesRef.current];
      pendingColumnMovesRef.current = [];
      
      if (movesToProcess.length === 0) return;
      
      const processMovesSequentially = async () => {
        for (const move of movesToProcess) {
          try {
            if (move.newPosition >= 0) {
              await updateColumnPosition.mutateAsync({ columnId: move.columnId, position: move.newPosition });
            } else {
              console.warn('❌ Invalid position ignored:', move.columnId, 'position:', move.newPosition);
            }
          } catch (error) {
            console.error('❌ Column synchronization error:', error);
          }
        }
      };
      
      processMovesSequentially();
    }, 800); 
  }, [updateColumnPosition]);

  const moveColumn = useCallback(
    (from: number, to: number) => {
      const columnId = board.columns[from]?.id;
      if (columnId && to >= 0 && to < board.columns.length) {
        board.moveColumn(from, to);
        syncColumnMove(columnId, to);
      }
    },
    [board, syncColumnMove]
  );

  const createColumn = useCallback(
    async (name: string, color?: string, position?: number) => {
      const columnPosition = position ?? board.columns.length;
      const res = await createColumnMutation.mutateAsync({
        name,
        color,
        position: columnPosition,
        projectId: board.projectId,
      });
      board.addColumn(res);
      return res;
    },
    [board, createColumnMutation]
  );

  const updateColumn = useCallback(
    async (columnId: number, name: string, color: string) => {
      const res = await updateColumnMutation.mutateAsync({ columnId, name, color });
      board.updateColumn(columnId, res);
      return res;
    },
    [board, updateColumnMutation]
  );

  const deleteColumn = useCallback(
    async (columnId: number) => {
      await deleteColumnMutation.mutateAsync({ columnId });
      board.removeColumn(columnId);
    },
    [board, deleteColumnMutation]
  );

  const startDrag = board.startDrag;
  const endDrag = board.endDrag;

  const addTagMutation = useAuthMutation<
    Tag,
    Error,
    { name: string; color: string }
  >((tag) => ({
    url: `${process.env.NEXT_PUBLIC_API_URL}/tags`,
    method: "POST",
    data: tag,
  }));

  const addTag = useCallback(
    async (tag: { name: string; color: string }) => {
      const newTag = await addTagMutation.mutateAsync(tag);
      board.addTag(newTag);
      return newTag;
    },
    [board, addTagMutation]
  );

  const addMemberMutation = useAuthMutation<
    Member,
    Error,
    { projectId: number; userId?: number; email?: string; role?: string }
  >(({ projectId, userId, email, role }) => ({
    url: `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/members`,
    method: "POST",
    data: { userId, email, role },
  }));

  const updateMemberMutation = useAuthMutation<
    void,
    Error,
    { projectId: number; userId: number; updates: Partial<Member> }
  >(({ projectId, userId, updates }) => ({
    url: `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/members/${userId}`,
    method: "PATCH",
    data: updates,
  }));

  const removeMemberMutation = useAuthMutation<
    void,
    Error,
    { projectId: number; userId: number }
  >(({ projectId, userId }) => ({
    url: `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/members/${userId}`,
    method: "DELETE",
  }));

  const addMember = useCallback(
    async (member: Member) => {
      const res = await addMemberMutation.mutateAsync({
        ...member,
        ...member.user,
      });
      board.addMember(res);
    },
    [addMemberMutation, board]
  );

  const updateMember = useCallback(
    async (member: Member, updates: Partial<Member>) => {
      board.updateMember(member.id, updates);
      await updateMemberMutation.mutate({
        projectId: board.projectId,
        userId: member.user.id,
        updates,
      });
    },
    [board, updateMemberMutation]
  );

  const removeMember = useCallback(
    async (member: Member) => {
      await removeMemberMutation.mutate({
        projectId: board.projectId,
        userId: member.user.id,
      });
      board.removeMember(member.id);
    },
    [board, removeMemberMutation]
  );

  return {
    columns: board.columns,
    tags: board.tags,
    members: board.members,
    draggedItem: board.draggedItem,

    addTask,
    removeTask,
    updateTask,
    moveTask,

    moveColumn,
    createColumn,
    updateColumn,
    deleteColumn,

    startDrag,
    endDrag,

    addTag,
    addMember,
    updateMember,
    removeMember,
    projectId: board.projectId,
  };
};
