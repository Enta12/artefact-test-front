'use client';

import { useRef } from 'react';
import Button from '../Button';
import Modal, { ModalRef } from '../Modal';
import ColumnForm from './ColumnForm';

interface AddColumnProps {
  projectId: number;
}

const AddColumn = ({ projectId }: AddColumnProps) => {
  const modalRef = useRef<ModalRef>(null);

  return (
    <>
      <Button onClick={() => modalRef.current?.open()}>
        + Ajouter une colonne
      </Button>

      <Modal 
        ref={modalRef}
        title="Ajouter une colonne"
      >
        <ColumnForm 
          projectId={projectId}
          onClose={() => modalRef.current?.close()}
        />
      </Modal>
    </>
  );
};

export default AddColumn; 