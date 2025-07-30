'use client';

import { useRef } from 'react';
import Button from '@/app/components/Button';
import Modal, { ModalRef } from '../Modal';
import ColumnForm from './ColumnForm';



const AddColumn = () => {
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
          onClose={() => modalRef.current?.close()}
        />
      </Modal>
    </>
  );
};

export default AddColumn; 