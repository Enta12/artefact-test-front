'use client';

import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '../../hooks/useAuthQuery';
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
  const queryClient = useQueryClient();

  const deleteColumn = useAuthMutation(
    () => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/columns/${column.id}`,
      method: 'DELETE',
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['columns', column.projectId] });
        deleteModalRef.current?.close();
      },
    }
  );

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
          projectId={column.projectId}
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
        isLoading={deleteColumn.isPending}
        onConfirm={() => deleteColumn.mutate()}
        onCancel={() => deleteModalRef.current?.close()}
      />
    </>
  );
};

export default ColumnMenu; 