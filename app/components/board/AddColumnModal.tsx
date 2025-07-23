'use client';

import { useState, forwardRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '../../hooks/useAuthQuery';
import Input from '../Input';
import Button from '../Button';
import Modal, { ModalRef } from '../Modal';

interface AddColumnModalProps {
  projectId: number;
  onClose?: () => void;
}

const AddColumnModal = forwardRef<ModalRef, AddColumnModalProps>(({ projectId, onClose }, ref) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#E2E8F0');
  const queryClient = useQueryClient();

  const addColumn = useAuthMutation(
    () => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/columns`,
      method: 'POST',
      data: {
        name,
        color,
        projectId,
      },
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
        if (ref && 'current' in ref) {
          ref.current?.close();
        }
        setName('');
        setColor('#0A0A0A');
      },
    }
  );

  return (
    <Modal 
      ref={ref}
      title="Ajouter une colonne"
      onAfterClose={() => {
        setName('');
        setColor('#0A0A0A');
        onClose?.();
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            addColumn.mutate();
          }
        }}
        className="space-y-4"
      >
        <Input
          label="Nom de la colonne"
          type="text"
          placeholder="Nom de la colonne"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="flex items-center gap-2">
          <Input
            label="Couleur de la colonne"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-8 p-0 cursor-pointer"
          />
          <span className="text-sm text-gray-500">Couleur de la colonne</span>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={() => {
              if (ref && 'current' in ref) {
                ref.current?.close();
              }
            }}
            variant="secondary"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={!name.trim() || addColumn.isPending}
          >
            {addColumn.isPending ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

AddColumnModal.displayName = 'AddColumnModal';

export default AddColumnModal; 