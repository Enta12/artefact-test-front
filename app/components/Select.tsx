'use client';

import SelectBase, { Props as SelectPropsBase, GroupBase } from 'react-select';

export interface SelectOption {
  value: string | number | undefined;
  label: string;
}

interface SelectProps extends Omit<SelectPropsBase<SelectOption, false, GroupBase<SelectOption>>, 'options' | 'value' | 'onChange'> {
  items: { id: string | number | undefined; label: string }[];
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  placeholder?: string;
  className?: string;
}

const Select = ({ items, value, onChange, placeholder = "Sélectionner...", className, ...rest }: SelectProps) => {
  const options: SelectOption[] = items.map(item => ({ value: item.id, label: item.label }));
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <SelectBase
      options={options}
      value={selectedOption}
      onChange={option => onChange(option ? option.value : undefined)}
      getOptionValue={option => String(option.value ?? '')}
      getOptionLabel={option => option.label}
      placeholder={placeholder}
      isClearable
      className={className}
      classNames={{
        control: (state) => 
          `!border-purple-200 !rounded-xl !min-h-[40px] !shadow-sm hover:!border-purple-300 
           ${state.isFocused ? '!border-purple-500 !ring-2 !ring-purple-500' : ''}`,
        menu: () => '!rounded-xl !overflow-hidden !shadow-lg !border !border-purple-100',
        option: (state) => 
          `!px-4 !py-3 ${state.isFocused ? '!bg-purple-50' : '!bg-white'} 
           ${state.isSelected ? '!bg-purple-100' : ''}
           hover:!bg-purple-50 transition-colors duration-150`,
        singleValue: () => '!text-purple-800 !font-medium',
      }}
      noOptionsMessage={() => 'Aucune option'}
      {...rest}
    />
  );
};

export default Select; 