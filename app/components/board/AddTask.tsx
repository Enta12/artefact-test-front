'use client';

import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '../../hooks/useAuthQuery';
import Modal, { ModalRef } from '../Modal';
import TaskForm from './TaskForm';
import { FiPlus } from 'react-icons/fi';
import { Column, User, Tag } from '../../types/board';
import { TaskFormData } from '../../types/task';

interface AddTaskProps {
  columnId: number;
  projectId: number;
  columns: Column[];
  tags: Tag[];
  users: User[];
}

const AddTask = ({ columnId, projectId, columns, tags, users }: AddTaskProps) => {
  const modalRef = useRef<ModalRef>(null);
  const queryClient = useQueryClient();

  const createTag = useAuthMutation<Tag, Error, { name: string; color: string; projectId: number }>(
    (data) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/tags`,
      method: 'POST',
      data,
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
      },
    }
  );

  const addTask = useAuthMutation(
    (data: TaskFormData) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
      method: 'POST',
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        columnId,
        projectId,
        position: Math.max(...columns.find(col => col.id === columnId)?.tasks.map(task => task.position) || [-1]) + 1,
        tagIds: data.selectedTags.map(tag => tag.id),
        userId: data.assignedToId,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        dueDate: data.dueDate?.toISOString(),
      },
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
        modalRef.current?.close();
      },
    }
  );

  const handleCreateTag = async (name: string, color: string) => {
    await createTag.mutateAsync({
      name,
      color,
      projectId
    });
  };

  return (
    <>
      <button
        onClick={() => modalRef.current?.open()}
        className="
          w-full h-10 rounded-lg border border-dashed border-gray-300
          flex items-center justify-center gap-2 text-gray-600 text-sm
          bg-gray-50 hover:bg-white hover:text-gray-800 hover:border-gray-400
          transition-all duration-200 ease-in-out
          cursor-pointer
        "
      >
        <FiPlus className="w-4 h-4" />
        <span>Ajouter une tâche</span>
      </button>

      <Modal
        ref={modalRef}
        title="Nouvelle tâche"
        className="max-w-2xl"
      >
        <TaskForm
          projectId={projectId}
          onSubmit={addTask.mutate}
          onCancel={() => modalRef.current?.close()}
          submitLabel="Créer la tâche"
          isSubmitting={addTask.isPending}
          users={users}
          tags={tags}
          onCreateTag={handleCreateTag}
        />
      </Modal>
    </>
  );
};

export default AddTask; 