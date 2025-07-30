'use client';

import { useRef } from 'react';
import { useBoardActions } from '../../hooks/useBoardActions';
import type { Column } from '../../types/board';
import Modal, { ModalRef } from '../Modal';
import DropdownMenu from '../DropdownMenu';
import ColumnForm from './ColumnForm';
import ConfirmModal from '../ConfirmModal';

interface ColumnMenuProps {
  column: Column;
}

const ColumnMenu = ({ column }: ColumnMenuProps) => {
  const editModalRef = useRef<ModalRef>(null);
  const deleteModalRef = useRef<ModalRef>(null);
  const { deleteColumn } = useBoardActions();

  const handleDelete = async () => await deleteColumn(column.id);

  const actions = [
    {
      label: 'Modifier',
      onClick: () => editModalRef.current?.open(),
    },
    {
      label: 'Supprimer',
      onClick: () => deleteModalRef.current?.open(),
      variant: 'danger' as const,
    },
  ];

  return (
    <>
      <DropdownMenu actions={actions} />

      <Modal
        ref={editModalRef}
        title="Modifier la colonne"
      >
        <ColumnForm 
          column={column}
          onClose={() => editModalRef.current?.close()}
        />
      </Modal>

      <ConfirmModal
        ref={deleteModalRef}
        title="Supprimer la colonne"
        description="Êtes-vous sûr de vouloir supprimer cette colonne et toutes ses tâches ?"
        itemLabel={column.name}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ColumnMenu; 