'use client';

import { useState, useEffect } from 'react';
import { useBoardActions } from '../../hooks/useBoardActions';
import Input from '../Input';
import Button from '../Button';
import type { Column } from '../../types/board';
import ColorInput from '@/app/components/ColorInput';

interface ColumnFormProps {
  onClose: () => void;
  column?: Column;
}

const ColumnForm = ({ onClose, column }: ColumnFormProps) => {
  const [name, setName] = useState(column?.name ?? '');
  const [color, setColor] = useState(column?.color ?? '#0A0A0A');
  const { createColumn, updateColumn } = useBoardActions();

  useEffect(() => {
    if (column) {
      setName(column.name);
      setColor(column.color ?? '#0A0A0A');
    }
  }, [column]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        if (column) {
          await updateColumn(column.id, name.trim(), color);
        } else {
          await createColumn(name.trim(), color);
        }
        onClose();
        if (!column) {
          setName('');
          setColor('#E2E8F0');
        }
      } catch (error) {
        console.error('Error creating/updating column:', error);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
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
          disabled={!name.trim()}
        >
          {column ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default ColumnForm; 