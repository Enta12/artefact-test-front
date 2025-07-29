import { useState, useRef, forwardRef } from 'react';
import { TaskPriority, TaskType } from '@/app/types/task';
import Button from '../Button';
import Select from '../Select';
import { useOutsideClick } from '@/app/hooks/useOutsideClick';
import { FiFilter, FiAlertCircle, FiRotateCw } from 'react-icons/fi';
import cn from 'classnames';
import { useBoard } from '@/context/BoardContext';

interface FilterButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  color?: string;
}

const FilterButton = ({ label, isSelected, onClick, color }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      'px-3 py-1 rounded-full text-sm cursor-pointer',
      isSelected 
        ? color ? 'text-white' : 'bg-blue-500 text-white' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    )}
    style={color && isSelected ? { backgroundColor: color } : undefined}
  >
    {label}
  </button>
);

interface DateFilterButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const DateFilterButton = ({ label, isSelected, onClick, icon: Icon, bgColor, textColor, borderColor }: DateFilterButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-full text-sm cursor-pointer border transition-all',
      {
        'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200': !isSelected,
        [`${bgColor} ${textColor} ${borderColor} shadow-sm`]: isSelected
      }
    )}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export interface BoardFilters {
  priorities: TaskPriority[];
  types: TaskType[];
  tags: number[];
  assignedToId?: number;
  dueDateRange?: {
    start: Date | null;
    end: Date | null;
  };
  showOverdue?: boolean;
  showInProgress?: boolean;
}

interface BoardFiltersProps {

  filters: BoardFilters;
  onFiltersChange: (filters: BoardFilters) => void;
}

const BoardFilters = ({ filters, onFiltersChange }: BoardFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { tags, members } = useBoard();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef as React.RefObject<HTMLElement>, () => {
    if (isOpen) setIsOpen(false);
  }, [buttonRef as React.RefObject<HTMLElement>]);

  const priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const types: TaskType[] = ['FEATURE', 'BUG', 'TASK', 'IMPROVEMENT'];

  const toggleFilter = <T extends keyof BoardFilters>(
    type: T,
    value: BoardFilters[T] extends Array<infer U> ? U : never
  ) => {
    const currentValues = filters[type] as unknown[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [type]: newValues });
  };

  const toggleSpecialFilter = (filterKey: 'showOverdue' | 'showInProgress') => {
    onFiltersChange({ 
      ...filters, 
      [filterKey]: !filters[filterKey] 
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      priorities: [],
      types: [],
      tags: [],
      assignedToId: undefined,
      dueDateRange: undefined,
      showOverdue: false,
      showInProgress: false,
    });
  };

  const getActiveFiltersCount = () => {
    const count = 0 +
    filters.priorities.length +
    filters.types.length +
    filters.tags.length +
      (filters.assignedToId !== undefined ? 1 : 0) +
      (filters.dueDateRange && (filters.dueDateRange.start || filters.dueDateRange.end) ? 1 : 0) +
      (filters.showOverdue ? 1 : 0) +
      (filters.showInProgress ? 1 : 0);
    return count;
  };

  const FilterButtonWithRef = forwardRef<HTMLButtonElement, { onClick: () => void; className: string; children: React.ReactNode }>((props, ref) => (
    <button ref={ref} {...props} />
  ));
  FilterButtonWithRef.displayName = 'FilterButtonWithRef';

  return (
    <div className="relative">
      <FilterButtonWithRef
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "mb-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg",
          "text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none",
          "focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        )}
      >
        <FiFilter className={cn("h-5 w-5 mr-2")} />
        Filtres
        {getActiveFiltersCount() > 0 && (
          <span className={cn("ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full")}> 
            {getActiveFiltersCount()} actif{getActiveFiltersCount() > 1 ? 's' : ''}
          </span>
        )}
      </FilterButtonWithRef>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn("absolute z-50 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4")}
        >
          <div className="space-y-4">            <div>
              <h3 className="font-medium mb-2">Filtres rapides</h3>
              <div className="flex flex-wrap gap-2">
                <DateFilterButton
                  label="Tâches en retard"
                  isSelected={!!filters.showOverdue}
                  onClick={() => toggleSpecialFilter('showOverdue')}
                  icon={FiAlertCircle}
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                  borderColor="border-red-200"
                />
                <DateFilterButton
                  label="Tâches en cours"
                  isSelected={!!filters.showInProgress}
                  onClick={() => toggleSpecialFilter('showInProgress')}
                  icon={FiRotateCw}
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                  borderColor="border-blue-200"
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Priorité</h3>
              <div className="flex flex-wrap gap-2">
                {priorities.map(priority => (
                  <FilterButton
                    key={priority}
                    label={priority}
                    isSelected={filters.priorities.includes(priority)}
                    onClick={() => toggleFilter('priorities', priority)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Type</h3>
              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <FilterButton
                    key={type}
                    label={type}
                    isSelected={filters.types.includes(type)}
                    onClick={() => toggleFilter('types', type)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <FilterButton
                    key={tag.id}
                    label={tag.name}
                    isSelected={filters.tags.includes(tag.id)}
                    onClick={() => toggleFilter('tags', tag.id)}
                    color={tag.color}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Assigné à</h3>
              <Select
                items={[
                  { id: undefined, label: 'Tous' },
                  ...members.map(member => ({ id: member.user.id, label: member.user.name || 'Utilisateur sans nom' }))
                ]}
                value={filters.assignedToId}
                onChange={(value) => onFiltersChange({ ...filters, assignedToId: value === undefined ? undefined : typeof value === 'string' ? Number(value) : value })}
                className="w-full"
                placeholder="Sélectionner un utilisateur"
              />
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                onClick={clearFilters}
                variant="secondary"
                className="text-sm"
              >
                Réinitialiser les filtres
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="primary"
                className="text-sm"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardFilters; 