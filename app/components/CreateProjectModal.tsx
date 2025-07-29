'use client';

import { forwardRef, useState } from 'react';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
import Modal, { ModalRef } from './Modal';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '@/app/hooks/useAuthQuery';

export type CreateProjectModalRef = ModalRef;

interface CreateProjectModalProps {
  onCreate: (
    project: {
      id: string;
      name: string;
      description: string;
    }
  ) => void;
}

const CreateProjectModal = forwardRef<CreateProjectModalRef, CreateProjectModalProps>(({ onCreate: handleCreate }, ref) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createProject = useAuthMutation<
    { id: string; name: string; description: string },
    Error,
    { name: string; description: string }
  >(
    (data) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/projects`,
      method: 'POST',
      data,
    }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        if (typeof ref !== 'function' && ref?.current) {
          ref.current?.close();
        }
        handleCreate(data);
      },
    }
  );

  const handleSubmit = (data: { name: string; description: string }) => {
    createProject.mutate(data);
  };

  const handleClose = () => {
    if (typeof ref !== 'function' && ref?.current) {
      ref.current?.close();
    }
  };

  return (
    <Modal
      ref={ref}
      title="Créer un nouveau projet"
      onAfterClose={() => {
        setName('');
        setDescription('');
      }}
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit({ name, description });
      }}>
        <div className="space-y-4">
          <div>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon super projet"
              required
              label="Nom du projet"
            />
          </div>

          <div>
            <TextArea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du projet..."
              label="Description"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={createProject.isPending}
              loadingText="Création en cours..."
            >
              Créer le projet
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
});

CreateProjectModal.displayName = 'CreateProjectModal';

export default CreateProjectModal; 