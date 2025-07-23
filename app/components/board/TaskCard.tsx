'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types/board';
import { useState } from 'react';
import TaskDetailModal from './TaskDetailModal';
import { 
  FiCalendar,
  FiClock,
  FiUser,
  FiAlertCircle,
  FiCheckCircle,
  FiRotateCw,
  FiXCircle,
  FiMove,
  FiFlag,
  FiBox,
  FiArrowUp,
  FiArrowDown,
  FiMinus
} from 'react-icons/fi';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const priorityConfig = {
  HIGH: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: FiArrowUp,
    iconColor: 'text-red-600',
    label: 'Haute',
    dotColor: 'bg-red-500'
  },
  MEDIUM: {
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: FiMinus,
    iconColor: 'text-yellow-600',
    label: 'Moyenne',
    dotColor: 'bg-yellow-500'
  },
  LOW: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: FiArrowDown,
    iconColor: 'text-green-600',
    label: 'Basse',
    dotColor: 'bg-green-500'
  },
  URGENT: {
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: FiAlertCircle,
    iconColor: 'text-purple-600',
    label: 'Urgente',
    dotColor: 'bg-purple-500'
  },
};

const statusConfig = {
  TODO: {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: FiClock,
    iconColor: 'text-gray-500',
    label: 'À faire',
    progress: 0
  },
  IN_PROGRESS: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FiRotateCw,
    iconColor: 'text-blue-500',
    label: 'En cours',
    progress: 50
  },
  DONE: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: FiCheckCircle,
    iconColor: 'text-green-500',
    label: 'Terminé',
    progress: 100
  },
  BLOCKED: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: FiXCircle,
    iconColor: 'text-red-500',
    label: 'Bloqué',
    progress: 0
  },
};

const formatDate = (date: string | Date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Demain";
  if (diffInDays === -1) return "Hier";
  if (diffInDays > 0 && diffInDays <= 7) return `Dans ${diffInDays}j`;
  if (diffInDays < 0 && diffInDays >= -7) return `Il y a ${Math.abs(diffInDays)}j`;
  
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
};

const typeConfig = {
  TASK: { icon: FiBox, label: 'Tâche', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  FEATURE: { icon: FiFlag, label: 'Feature', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  BUG: { icon: FiAlertCircle, label: 'Bug', color: 'text-red-600', bgColor: 'bg-red-100' },
  IMPROVEMENT: { icon: FiRotateCw, label: 'Amélioration', color: 'text-green-600', bgColor: 'bg-green-100' },
};

const TaskCard = ({ task, isDragging = false }: TaskCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `task-${task.id}`,
    data: {
      type: 'task',
      task,
      sourceColumnId: task.columnId,
      columnId: task.columnId
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const status = statusConfig[task.status as keyof typeof statusConfig];
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
  const taskType = typeConfig[task.type as keyof typeof typeConfig];
  const TypeIcon = taskType?.icon;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const isDueSoon = task.dueDate && !isOverdue && task.status !== 'DONE' && 
    new Date(task.dueDate).getTime() - new Date().getTime() <= 2 * 24 * 60 * 60 * 1000; // 2 jours

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDetailOpen(true);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group relative bg-white rounded-xl shadow-sm border border-gray-200
          hover:shadow-lg hover:border-gray-300 transition-all duration-300 ease-out
          ${isDragging ? 'opacity-60 scale-95 rotate-3 shadow-2xl' : 'opacity-100'}
          ${isHovered ? 'scale-[1.02] -translate-y-1' : ''}
          overflow-hidden
        `}
      >
        <div className="h-1 w-full bg-gray-100">
          <div 
            className={`h-full transition-all duration-500 ${
              status?.progress === 100 ? 'bg-green-500' :
              status?.progress === 50 ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            style={{ width: `${status?.progress || 0}%` }}
          />
        </div>

        <div
          {...attributes}
          {...listeners}
          className={`
            absolute top-2 right-2 w-8 h-8 cursor-grab active:cursor-grabbing
            flex items-center justify-center rounded-lg
            ${isHovered || isDragging ? 'bg-gray-100 text-gray-600' : 'bg-transparent text-gray-300'}
            hover:bg-gray-200 hover:text-gray-700 transition-all duration-200
            z-10
          `}
          title="Glisser pour déplacer"
        >
          <FiMove className="w-4 h-4" />
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="w-full text-left cursor-pointer p-4 pr-12 space-y-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {TypeIcon && (
                <div className={`p-2 rounded-lg ${taskType.bgColor}`}>
                  <TypeIcon className={`w-4 h-4 ${taskType.color}`} />
                </div>
              )}
              
              {priority && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${priority.color}`}>
                  <div className={`w-2 h-2 rounded-full ${priority.dotColor}`} />
                  <span>{priority.label}</span>
                </div>
              )}
            </div>

            {isOverdue && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Retard</span>
              </div>
            )}
            
            {isDueSoon && !isOverdue && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Bientôt</span>
              </div>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 line-clamp-2 text-base leading-tight group-hover:text-blue-900 transition-colors">
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.slice(0, 3).map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium border"
                  style={{ 
                    backgroundColor: tag.color + '15', 
                    color: tag.color,
                    borderColor: tag.color + '30'
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="inline-flex items-center text-xs px-2 py-1 rounded-md font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </button>

        <div className="px-4 pb-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
          {task.assignedTo ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-700">
                  {task.assignedTo.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-gray-700">{task.assignedTo.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <FiUser className="w-3 h-3 text-gray-400" />
              </div>
              <span>Non assigné</span>
            </div>
          )}

          {task.dueDate && (
            <div className={`flex items-center gap-1.5 ${
              isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
            }`}>
              <FiCalendar className="w-3 h-3" />
              <span className="font-medium">
                {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>

        <div className={`
          absolute inset-0 rounded-xl border-2 border-blue-200 opacity-0 pointer-events-none
          transition-opacity duration-200
          ${isHovered ? 'opacity-100' : ''}
        `} />
      </div>

      {isDetailOpen && (
        <TaskDetailModal
          task={task}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  );
};

export default TaskCard; 