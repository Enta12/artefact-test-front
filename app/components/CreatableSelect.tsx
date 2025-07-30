'use client';

import CreatableSelect from 'react-select/creatable';
import { Props as SelectProps, GroupBase } from 'react-select';

export interface AdvancedSelectOption<T> {
  value: T;
  label: string;
  color?: string;
}

interface AdvancedSelectProps<T> extends Omit<SelectProps<AdvancedSelectOption<T>, true, GroupBase<AdvancedSelectOption<T>>>, 'options' | 'value' | 'onChange' | 'onCreateOption'> {
  options: AdvancedSelectOption<T>[];
  value: AdvancedSelectOption<T>[];
  onChange: (value: AdvancedSelectOption<T>[]) => void;
  onCreateOption?: (inputValue: string) => void;
  placeholder?: string;
  formatOptionLabel?: (option: AdvancedSelectOption<T>) => React.ReactNode;
  className?: string;
}

const AdvancedSelect = <T,>({
  options,
  value,
  onChange,
  onCreateOption,
  placeholder = 'Sélectionner...',
  formatOptionLabel,
  className,
  ...rest
}: AdvancedSelectProps<T>) => {
  return (
    <CreatableSelect
      isMulti
      options={options}
      value={value}
      onChange={(newValue) => onChange(newValue as AdvancedSelectOption<T>[])}
      onCreateOption={onCreateOption}
      formatOptionLabel={formatOptionLabel}
      placeholder={placeholder}
      className={className}
      classNames={{
        //TODO: use cn
        control: (state) => 
          `!border-purple-200 !rounded-xl !min-h-[48px] !shadow-sm hover:!border-purple-300 
           ${state.isFocused ? '!border-purple-500 !ring-2 !ring-purple-500' : ''}`,
        menu: () => '!rounded-xl !overflow-hidden !shadow-lg !border !border-purple-100',
        option: (state) => 
          `!px-4 !py-3 ${state.isFocused ? '!bg-purple-50' : '!bg-white'} 
           ${state.isSelected ? '!bg-purple-100' : ''}
           hover:!bg-purple-50 transition-colors duration-150`,
        multiValue: () => '!rounded-lg !bg-purple-100 !border !border-purple-200',
        multiValueRemove: () => 'hover:!bg-purple-200 !rounded-r-lg',
        multiValueLabel: () => '!text-purple-800 !font-medium',
      }}
      noOptionsMessage={() => 'Aucun tag trouvé'}
      formatCreateLabel={(inputValue) => `Créer le tag "${inputValue}"`}
      {...rest}
    />
  );
};

export default AdvancedSelect; 