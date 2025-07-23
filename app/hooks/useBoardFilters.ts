import { useState, useMemo, useCallback } from 'react';
import { BoardFilters } from '../components/board/BoardFilters';
import { Column, Task } from '../types/board';
import { TaskPriority, TaskType } from '../types/task';

export const useBoardFilters = (columns: Column[]) => {
  const [filters, setFilters] = useState<BoardFilters>({
    priorities: [],
    types: [],
    tags: [],
    assignedToId: undefined,
    dueDateRange: undefined,
    showOverdue: false,
    showInProgress: false,
  });

  const isTaskMatchingFilters = useCallback((task: Task): boolean => {
    const {
      priorities,
      types,
      tags,
      assignedToId,
      dueDateRange,
      showOverdue,
      showInProgress,
    } = filters;

    if (
      priorities.length === 0 &&
      types.length === 0 &&
      tags.length === 0 &&
      !assignedToId &&
      !dueDateRange &&
      !showOverdue &&
      !showInProgress
    ) {
      return true;
    }

    if (priorities.length > 0 && !priorities.includes(task.priority as TaskPriority)) {
      return false;
    }

    if (types.length > 0 && !types.includes(task.type as TaskType)) {
      return false;
    }

    if (tags.length > 0 && !task.tags.some(tag => tags.includes(tag.id))) {
      return false;
    }

    if (assignedToId && task.assignedTo?.id !== assignedToId) {
      return false;
    }

    if (dueDateRange) {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      if (
        !dueDate ||
        (dueDateRange.start && dueDate < dueDateRange.start) ||
        (dueDateRange.end && dueDate > dueDateRange.end)
      ) {
        return false;
      }
    }

    if (showOverdue) {
      const isOverdue =
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== 'DONE';
      if (!isOverdue) return false;
    }

    if (showInProgress && task.status !== 'IN_PROGRESS') {
      return false;
    }

    return true;
  }, [filters]);

  const filteredColumns = useMemo(() => {
    return columns.map(column => ({
      ...column,
      tasks: column.tasks.filter(isTaskMatchingFilters),
    }));
  }, [columns, isTaskMatchingFilters]);

  return {
    filters,
    setFilters,
    filteredColumns,
  };
};
