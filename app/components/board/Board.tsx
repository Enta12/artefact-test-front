'use client';

import { useCallback } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardFilters } from '../../hooks/useBoardFilters';
import { Task as TaskType, Column as ColumnType, MinimalTag } from '../../types/board';
import ColumnComponent from './Column';
import TaskCard from './TaskCard';
import AddColumn from './AddColumn';
import BoardFilters from './BoardFilters';
import { useBoardActions } from '../../hooks/useBoardActions';



export interface Task extends Omit<TaskType, 'tags'> {
  tags: MinimalTag[];
}

export interface Column extends Omit<ColumnType, 'tasks'> {
  tasks: Task[];
}

const Board = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const { 
    columns, 
    tags, 
    members, 
    draggedItem, 
    startDrag, 
    endDrag, 
    moveColumn, 
    moveTask, 
  } = useBoardActions();

  const users = members.map((member) => member.user);
  const { filters, setFilters, filteredColumns } = useBoardFilters(columns);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeType = active.data.current?.type;
    const sourceIndex = columns.findIndex(col => 
      activeType === 'column' 
        ? `column-${col.id}` === active.id
        : col.tasks.some(task => `task-${task.id}` === active.id)
    );

    if (activeType === 'task') {
      const sourceColumnId = columns[sourceIndex].id;
      const taskId = parseInt(String(active.id).split('-')[1]);
      startDrag('task', taskId, sourceIndex, sourceColumnId);
    } else {
      startDrag('column', parseInt(String(active.id).split('-')[1]), sourceIndex);
    }
  }, [columns, startDrag]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      endDrag();
      return;
    }

    if (active.id !== over.id) {
      const isColumn = active.data.current?.type === 'column';
      const isTask = active.data.current?.type === 'task';

      if (isColumn) {
        const oldIndex = columns.findIndex(col => `column-${col.id}` === active.id);
        const newIndex = columns.findIndex(col => `column-${col.id}` === over.id);
        
        if (oldIndex !== newIndex) {
          moveColumn(oldIndex, newIndex);
        }
      }

      if (isTask) {
        const taskId = parseInt(String(active.id).split('-')[1]);
        const sourceColumnId = parseInt(String(active.data.current?.sourceColumnId));
                const sourceColumn = columns.find(col => col.id === sourceColumnId);
                const sortedTasks = [...(sourceColumn?.tasks || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
        
        
        let targetColumnId: number;
        let targetIndex: number;

        if (String(over.id).startsWith('task-')) {
          const overTask = columns.flatMap(col => col.tasks).find(t => t.id === parseInt(String(over.id).split('-')[1]));
          
          if (overTask) {
            targetColumnId = overTask.columnId;
            if (over.data.current?.sortable) {
              const sortableData = over.data.current.sortable;
              targetIndex = sortableData.index;
            } else {
              const targetColumnTasks = [...(columns.find(col => col.id === targetColumnId)?.tasks || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
              targetIndex = targetColumnTasks.findIndex(t => t.id === overTask.id);
            }
            
          } else {
            targetColumnId = sourceColumnId;
            targetIndex = 0;
          }
        } else if (String(over.id).startsWith('column-drop-')) {
          targetColumnId = parseInt(String(over.id).split('-')[2]);
          const targetColumn = columns.find(col => col.id === targetColumnId);
          targetIndex = targetColumn ? targetColumn.tasks.length : 0;
        } else if (String(over.id).startsWith('column-')) {
          targetColumnId = parseInt(String(over.id).split('-')[1]);
          const targetColumn = columns.find(col => col.id === targetColumnId);
          targetIndex = targetColumn ? targetColumn.tasks.length : 0;
        } else {
          targetColumnId = over.data.current?.columnId || sourceColumnId;
          targetIndex = over.data.current?.position || 0;
        }

        const currentVisualIndex = sortedTasks.findIndex(t => t.id === taskId);
    

        if (sourceColumnId === targetColumnId && currentVisualIndex === targetIndex) {
          endDrag();
          return;
        }
        moveTask(taskId, sourceColumnId, targetColumnId, targetIndex);
      }
    }

    endDrag();
  }, [columns, moveColumn, moveTask, endDrag]);


  return (
    <>
      <div className="px-4">
        <BoardFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full items-start pb-4 px-4">
          <SortableContext items={filteredColumns.map(col => `column-${col.id}`)} strategy={horizontalListSortingStrategy}>
            {filteredColumns.map(column => (
              <ColumnComponent
                key={column.id}
                column={column}
                tasks={column.tasks}
                columns={columns}
                tags={tags}
                users={users}
              />
            ))}
          </SortableContext>
          
          <AddColumn />
        </div>

        <DragOverlay>
          {draggedItem && draggedItem.type === 'task' && (
            <TaskCard
              task={columns
                .flatMap(col => col.tasks)
                .find(task => task.id === draggedItem.id)!}
              isDragging
            />
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default Board; 