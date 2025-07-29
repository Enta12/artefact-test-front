'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '../../hooks/useAuthQuery';
import Input from '../Input';
import Button from '../Button';
import type { Column } from '../../types/board';
import ColorInput from '@/app/components/ColorInput';

interface ColumnFormProps {
  projectId: number;
  onClose: () => void;
  column?: Column;
}

const ColumnForm = ({ projectId, onClose, column }: ColumnFormProps) => {
  const [name, setName] = useState(column?.name ?? '');
  const [color, setColor] = useState(column?.color ?? '#0A0A0A');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (column) {
      setName(column.name);
      setColor(column.color ?? '#0A0A0A');
    }
  }, [column]);

  const mutation = useAuthMutation(
    () => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/columns${column ? `/${column.id}` : ''}`,
      method: column ? 'PATCH' : 'POST',
      data: {
        name,
        color,
        ...(column ? {} : { projectId }),
      },
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
        onClose();
        if (!column) {
          setName('');
          setColor('#E2E8F0');
        }
      },
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) {
          mutation.mutate();
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

      <ColorInput value={color} onChange={setColor} />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={!name.trim() || mutation.isPending}
        >
          {mutation.isPending 
            ? column ? 'Modification...' : 'Création...'
            : column ? 'Modifier' : 'Créer'
          }
        </Button>
      </div>
    </form>
  );
};

export default ColumnForm; 