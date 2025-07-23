'use client';

import { useState, ReactNode } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { twMerge } from 'tailwind-merge';

export interface DropdownAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  actions: DropdownAction[];
  trigger?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

const DropdownMenu = ({ 
  actions, 
  trigger,
  align = 'right',
  className
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={twMerge("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
      >
        {trigger ?? <BsThreeDotsVertical className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div 
          className={
            "absolute mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 text-sm " +
            (align === 'right' ? "right-0" : "left-0")
          }
          onMouseLeave={() => setIsOpen(false)}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              className={twMerge(
                "w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer",
                action.variant === 'danger' && "text-red-600"
              )}
              onClick={() => {
                setIsOpen(false);
                action.onClick();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu; 