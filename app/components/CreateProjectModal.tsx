'use client';

import { forwardRef, useState } from 'react';
import Button from './Button';
import Input from './Input';
import TextArea from './TextArea';
import Modal, { ModalRef } from './Modal';

export type CreateProjectModalRef = ModalRef;

interface CreateProjectModalProps {
  onSubmit: (data: { name: string; description: string }) => void;
  isLoading?: boolean;
}

const CreateProjectModal = forwardRef<CreateProjectModalRef, CreateProjectModalProps>(({
  onSubmit,
  isLoading
}, ref) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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
        onSubmit({ name, description });
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
              isLoading={isLoading}
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