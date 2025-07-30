'use client';
import cn from 'classnames';

import { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  navClassName?: string;
  contentClassName?: string;
  variant?: 'primary' | 'secondary';
}

const Tabs = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '',
  navClassName = '',
  contentClassName = '',
  variant = 'primary',
}: TabsProps) => {
  return (
    <div className={className}>
      <div className={cn(navClassName, {
        'border-b border-gray-200': variant === 'primary'
      })}>
        <nav className={cn("flex", {
          'gap-8': variant === 'primary',
          'gap-4': variant === 'secondary'
        })}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 font-medium text-sm transition-colors cursor-pointer',
                  {
                    'py-3 px-1 border-b-2': variant === 'primary',
                    'border-blue-500 text-blue-600': variant === 'primary' && isActive,
                    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': variant === 'primary' && !isActive,
                    
                    'py-2 px-6 rounded-full font-semibold': variant === 'secondary',
                    'bg-blue-600 text-white shadow-md': variant === 'secondary' && isActive,
                    'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700': variant === 'secondary' && !isActive,
                  }
                )}
                type="button"
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={cn('mt-6', contentClassName)}>
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <div key={tab.id}>
              {tab.content}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Tabs; 