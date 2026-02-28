import React from 'react';
import { MapPin, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface Location {
  id: string;
  name: string;
}

interface MultiSelectLocationsProps {
  locations: Location[];
  selectedLocations: string[];
  onChange: (selectedIds: string[]) => void;
}

export const MultiSelectLocations: React.FC<MultiSelectLocationsProps> = ({
  locations,
  selectedLocations,
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleLocation = (locationId: string) => {
    if (selectedLocations.includes(locationId)) {
      onChange(selectedLocations.filter(id => id !== locationId));
    } else {
      onChange([...selectedLocations, locationId]);
    }
  };

  const removeLocation = (locationId: string) => {
    onChange(selectedLocations.filter(id => id !== locationId));
  };

  const getSelectedLocationNames = () => {
    return locations
      .filter(loc => selectedLocations.includes(loc.id))
      .map(loc => loc.name);
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal bg-white hover:bg-slate-50 border-slate-300"
          >
            <span className="text-slate-700">
              {selectedLocations.length === 0
                ? 'Select locations...'
                : `${selectedLocations.length} location${selectedLocations.length !== 1 ? 's' : ''} selected`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white border-slate-200 shadow-lg" align="start">
          <div className="max-h-64 overflow-y-auto p-2 bg-white">
            <div className="space-y-1">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer bg-white"
                  onClick={() => toggleLocation(location.id)}
                >
                  <Checkbox
                    id={`location-${location.id}`}
                    checked={selectedLocations.includes(location.id)}
                    onCheckedChange={() => toggleLocation(location.id)}
                  />
                  <Label
                    htmlFor={`location-${location.id}`}
                    className="flex-1 cursor-pointer text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-blue-600" />
                      <span className="text-sm">{location.name}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Locations Display */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {getSelectedLocationNames().map((name, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-blue-100 text-blue-700 border-blue-300 pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{name}</span>
              <button
                onClick={() => {
                  const locationId = locations.find(loc => loc.name === name)?.id;
                  if (locationId) removeLocation(locationId);
                }}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
