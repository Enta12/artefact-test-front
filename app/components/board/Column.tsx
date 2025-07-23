'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { twMerge } from 'tailwind-merge';
import type { Column as ColumnType, Task, Tag, User } from '../../types/board';
import TaskCard from './TaskCard';
import AddTask from './AddTask';
import ColumnMenu from './ColumnMenu';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  columns: ColumnType[];
  tags: Tag[];
  users: User[];
}

const Column = ({ column, tasks, columns, tags, users }: ColumnProps) => {
  const sortedTasks = [...tasks].sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column,
    },
  });

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `column-drop-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
      position: sortedTasks.length,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setSortableNodeRef}
      style={style}
      className={twMerge(
        'flex flex-col w-96 gap-2',
        isDragging ? 'opacity-50' : 'opacity-100'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={twMerge(
          'px-2 font-semibold text-lg',
          'flex items-center gap-2',
          'rounded-t-lg'
        )}
      >
        <div className="flex-1 flex items-center gap-2 cursor-grab">
          <span
            style={{
              color: column.color || 'inherit'
            }}
          >{column.name}</span>
          <span className="text-xs text-gray-500">(ID: {column.id})</span>
          <span className="text-sm text-gray-500">({sortedTasks.length})</span>
        </div>
        <ColumnMenu column={column} />
      </div>

      <div 
        ref={setDroppableNodeRef}
        className="space-y-2 min-h-20 flex-1"
      >
        <SortableContext 
          items={sortedTasks.map(task => `task-${task.id}`)} 
          strategy={verticalListSortingStrategy}
        >
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={{
                ...task,
                columnId: column.id,
              }}
            />
          ))}
        </SortableContext>
        
        {sortedTasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Aucune tâche</p>
          </div>
        )}
      </div>

      <AddTask columnId={column.id} projectId={column.projectId} columns={columns} tags={tags} users={users} />
    </div>
  );
};

export default Column; 