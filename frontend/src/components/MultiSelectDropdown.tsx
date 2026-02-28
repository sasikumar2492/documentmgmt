import React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Badge } from './ui/badge';

interface MultiSelectOption {
  id: string;
  name: string;
  color?: string;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
}

export const MultiSelectDropdown = React.forwardRef<HTMLDivElement, MultiSelectDropdownProps>(({
  options,
  selectedIds,
  onSelectionChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  label
}, ref) => {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (optionId: string) => {
    const newSelection = selectedIds.includes(optionId)
      ? selectedIds.filter(id => id !== optionId)
      : [...selectedIds, optionId];
    onSelectionChange(newSelection);
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  const selectAll = () => {
    onSelectionChange(options.map(opt => opt.id));
  };

  const selectedOptions = options.filter(opt => selectedIds.includes(opt.id));

  return (
    <div className="w-full" ref={ref}>
      {label && (
        <label className="text-sm text-slate-700 mb-2 block">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white h-auto min-h-[40px] py-2"
          >
            <div className="flex flex-wrap gap-1 flex-1 mr-2">
              {selectedIds.length === 0 ? (
                <span className="text-slate-500">{placeholder}</span>
              ) : selectedIds.length <= 2 ? (
                selectedOptions.map(opt => (
                  <Badge
                    key={opt.id}
                    variant="secondary"
                    className="mr-1 text-xs"
                  >
                    {opt.color && (
                      <div
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: opt.color }}
                      ></div>
                    )}
                    {opt.name}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {selectedIds.length} selected
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {/* Select All / Clear All Buttons */}
                <div className="flex items-center justify-between px-2 py-2 border-b border-slate-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="h-auto p-1 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-auto p-1 text-xs text-slate-600 hover:text-slate-700"
                  >
                    Clear All
                  </Button>
                </div>
                
                {options.map((option) => {
                  const isSelected = selectedIds.includes(option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      onSelect={() => toggleOption(option.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-4 h-4 rounded border ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-slate-300'
                        } flex items-center justify-center`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        {option.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: option.color }}
                          ></div>
                        )}
                        <span className="text-sm">{option.name}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
});

MultiSelectDropdown.displayName = 'MultiSelectDropdown';