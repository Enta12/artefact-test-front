'use client';

import { useRef, useState } from 'react';
import Modal, { ModalRef } from '../Modal';
import TaskForm from './TaskForm';
import { FiPlus } from 'react-icons/fi';
import { Column, Tag } from '../../types/board';
import { TaskFormData } from '@/app/types/task';
import { useBoardActions } from '@/app/hooks/useBoardActions';
import { User } from '@/app/types/auth';
interface AddTaskProps {
  columnId: number;
  projectId: number;
  columns: Column[];
  tags: Tag[];
  users: User[];
}

const AddTask = ({ columnId, projectId }: AddTaskProps) => {
  const modalRef = useRef<ModalRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask } = useBoardActions();
  const handleSubmit = async (data: TaskFormData) => {
    //TODO: use isPending of addTaskMutation
    setIsSubmitting(true);
    await addTask(columnId, data);
    setIsSubmitting(false);
    modalRef.current?.close();
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
        className="lg:max-w-3xl!"
      >
        <TaskForm
          projectId={projectId}
          onSubmit={handleSubmit}
          onCancel={() => modalRef.current?.close()}
          submitLabel="Créer la tâche"
          isSubmitting={isSubmitting}
        />
      </Modal>
    </>
  );
};

export default AddTask; 