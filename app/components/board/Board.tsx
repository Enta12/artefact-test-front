'use client';

import { useCallback, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useAuthQuery, useAuthMutation } from '../../hooks/useAuthQuery';
import { useBoardState } from '../../hooks/useBoardState';
import { useBoardFilters } from '../../hooks/useBoardFilters';
import { Task as TaskType, Column as ColumnType, Tag, MinimalTag } from '../../types/board';
import ColumnComponent from './Column';
import TaskCard from './TaskCard';
import AddColumn from './AddColumn';
import LoadingState from '../LoadingState';
import BoardFilters from './BoardFilters';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../../types/board';

interface BoardProps {
  projectId: number;
}

export interface Task extends Omit<TaskType, 'tags'> {
  tags: MinimalTag[];
}

export interface Column extends Omit<ColumnType, 'tasks'> {
  tasks: Task[];
}

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

const Board = ({ projectId }: BoardProps) => {
  const queryClient = useQueryClient();
  const pendingMovesRef = useRef<PendingMove[]>([]);
  const pendingColumnMovesRef = useRef<PendingColumnMove[]>([]);
  const columnSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const { 
    data: initialColumns = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useAuthQuery<Column[]>(
    ['columns', projectId],
    `${process.env.NEXT_PUBLIC_API_URL}/columns/project/${projectId}`,
    {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      retry: 3,
      staleTime: 30000,
    }
  );

  const { data: users = [] } = useAuthQuery<User[]>(
    ['users'],
    `${process.env.NEXT_PUBLIC_API_URL}/users`,
    {
      staleTime: 300000,
    }
  );

  const { data: tags = [] } = useAuthQuery<Tag[]>(
    ['tags', projectId],
    `${process.env.NEXT_PUBLIC_API_URL}/tags/project/${projectId}`,
    {
      staleTime: 300000,
    }
  );

  const {
    columns,
    draggedItem,
    moveColumn,
    moveTask,
    startDrag,
    endDrag,
  } = useBoardState(initialColumns);

  const { filters, setFilters, filteredColumns } = useBoardFilters(columns);

  useEffect(() => {
    if (initialColumns.length > 0 && !draggedItem) {
      queryClient.setQueryData(['columns', projectId], initialColumns);
    }
  }, [initialColumns, projectId, queryClient, draggedItem]);

  useEffect(() => {
    return () => {
      if (columnSyncTimeoutRef.current) {
        clearTimeout(columnSyncTimeoutRef.current);
      }
    };
  }, []);

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
        // Supprimer le mouvement pending
        pendingMovesRef.current = pendingMovesRef.current.filter(
          move => move.taskId !== variables.taskId || move.timestamp !== variables.timestamp
        );
      },
      onError: (error, variables) => {
        console.error('❌ Erreur synchronisation tâche:', variables.taskId, error);
        
        // Supprimer le mouvement pending qui a échoué
        pendingMovesRef.current = pendingMovesRef.current.filter(
          move => move.taskId !== variables.taskId || move.timestamp !== variables.timestamp
        );
        
        // Seulement recharger les données en cas d'erreur persistante
        // Pour éviter de perdre l'état local à chaque erreur temporaire
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
        }, 1000);
      }
    }
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
      retry: 1, // Moins de retry pour éviter les conflits répétés
      retryDelay: 1000, // Attendre 1 seconde entre les retry
      onSuccess: (_, variables) => {
      },
      onError: (error, variables) => {
        
        // Ne recharger qu'en cas d'erreur critique (pas de conflit de contrainte)
        const isConstraintError = error.message?.includes('constraint') || error.message?.includes('P2002');
        
        if (!isConstraintError) {
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
          }, 2000);
        } else {
        }
      }
    }
  );

  // Fonction pour synchroniser immédiatement une seule tâche
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
    
    // Ajouter à la liste des mouvements en cours
    pendingMovesRef.current.push(pendingMove);
    
    
    // Attendre un peu pour éviter les appels trop rapides
    setTimeout(() => {
      // Vérifier si le mouvement est toujours pertinent
      if (pendingMovesRef.current.some(m => 
        m.taskId === taskId && m.timestamp === pendingMove.timestamp
      )) {
        updateTaskPosition.mutate(pendingMove);
      }
    }, 300); // Attendre 300ms avant de synchroniser
    
  }, [updateTaskPosition]);

  // Fonction pour synchroniser la position d'une colonne avec debouncing
  const syncColumnMove = useCallback((columnId: number, newPosition: number) => {
    
    // Ajouter le mouvement à la liste des mouvements en attente
    const pendingMove: PendingColumnMove = {
      columnId,
      newPosition,
      timestamp: Date.now()
    };
    
    // Supprimer les anciens mouvements de la même colonne pour éviter les conflits
    pendingColumnMovesRef.current = pendingColumnMovesRef.current.filter(
      move => move.columnId !== columnId
    );
    
    // Ajouter le nouveau mouvement
    pendingColumnMovesRef.current.push(pendingMove);
    
    // Annuler le timeout précédent s'il existe
    if (columnSyncTimeoutRef.current) {
      clearTimeout(columnSyncTimeoutRef.current);
    }
    
    // Programmer la synchronisation avec debouncing
    columnSyncTimeoutRef.current = setTimeout(() => {
      // Traiter tous les mouvements en attente
      const movesToProcess = [...pendingColumnMovesRef.current];
      pendingColumnMovesRef.current = [];
      
      if (movesToProcess.length === 0) return;
      
      
      // Traiter les mouvements un par un pour éviter les conflits
      const processMovesSequentially = async () => {
        for (const move of movesToProcess) {
          try {
            await updateColumnPosition.mutateAsync({ columnId: move.columnId, position: move.newPosition });
          } catch (error) {
          }
        }
      };
      
      processMovesSequentially();
      
    }, 800); // Attendre 800ms après le dernier changement pour synchroniser
    
  }, [updateColumnPosition]);


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
        const columnId = parseInt(String(active.id).split('-')[1]);
        
        
        moveColumn(oldIndex, newIndex);
        
        if (oldIndex !== newIndex) {
          syncColumnMove(columnId, newIndex);
        }
      }

      if (isTask) {
        const taskId = parseInt(String(active.id).split('-')[1]);
        const sourceColumnId = parseInt(String(active.data.current?.sourceColumnId));
        
        // Debug: Afficher l'état actuel des tâches dans la colonne
        const sourceColumn = columns.find(col => col.id === sourceColumnId);
        
        // Trier les tâches par position comme dans Column.tsx pour avoir l'ordre visuel réel
        const sortedTasks = [...(sourceColumn?.tasks || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
        
        sortedTasks.forEach((t, visualIndex) => {
        });
        
        let targetColumnId: number;
        let targetIndex: number;

        if (String(over.id).startsWith('task-')) {
          // Déposé sur une autre tâche - utiliser les données de sortable
          const overTask = columns.flatMap(col => col.tasks).find(t => t.id === parseInt(String(over.id).split('-')[1]));
          
          if (overTask) {
            targetColumnId = overTask.columnId;
            
            // Utiliser directement l'index de sortable qui reflète l'ordre visuel
            if (over.data.current?.sortable) {
              const sortableData = over.data.current.sortable;
              
              targetIndex = sortableData.index;
            } else {
              // Fallback: trouver l'index visuel de la tâche cible
              const targetColumnTasks = [...(columns.find(col => col.id === targetColumnId)?.tasks || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
              targetIndex = targetColumnTasks.findIndex(t => t.id === overTask.id);
            }
            
          } else {
            targetColumnId = sourceColumnId;
            targetIndex = 0;
          }
        } else if (String(over.id).startsWith('column-drop-')) {
          // Déposé dans la zone de drop de la colonne (à la fin)
          targetColumnId = parseInt(String(over.id).split('-')[2]);
          const targetColumn = columns.find(col => col.id === targetColumnId);
          targetIndex = targetColumn ? targetColumn.tasks.length : 0;
        } else if (String(over.id).startsWith('column-')) {
          // Déposé sur la colonne elle-même
          targetColumnId = parseInt(String(over.id).split('-')[1]);
          const targetColumn = columns.find(col => col.id === targetColumnId);
          targetIndex = targetColumn ? targetColumn.tasks.length : 0;
        } else {
          // Fallback
          targetColumnId = over.data.current?.columnId || sourceColumnId;
          targetIndex = over.data.current?.position || 0;
        }

        const targetColumn = columns.find(col => col.id === targetColumnId);
        const task = columns.flatMap(col => col.tasks).find(t => t.id === taskId);

        // Calculer les index visuels actuels
        const currentVisualIndex = sortedTasks.findIndex(t => t.id === taskId);
        

        // Vérifier s'il y a vraiment un changement
        if (sourceColumnId === targetColumnId && currentVisualIndex === targetIndex) {
          endDrag();
          return;
        }

        // 1. Mettre à jour l'état local immédiatement (optimistic update)
        moveTask(taskId, sourceColumnId, targetColumnId, targetIndex);
        
        // 2. Synchroniser avec le backend de manière ciblée
        syncSingleTaskMove(taskId, sourceColumnId, targetColumnId, targetIndex);
      }
    }

    endDrag();
  }, [columns, moveColumn, moveTask, endDrag, syncSingleTaskMove, syncColumnMove]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingState 
          message="Chargement du tableau..." 
          variant="primary"
          size="lg"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-600">
        <p className="text-lg font-semibold mb-4">
          Une erreur est survenue lors du chargement du tableau
        </p>
        <p className="text-sm text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Erreur inconnue'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="px-4">
        <BoardFilters
          users={users}
          tags={tags}
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
          
          <AddColumn projectId={projectId} />
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