// src/context/useBoardContext.ts

import { useContext } from 'react';
import { BoardContext } from './BoardContext';

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};
