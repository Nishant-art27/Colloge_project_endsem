type ChipProps = {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label: string;
};

export default function FilterChips({ options, selected, onChange, label }: ChipProps) {
  function toggle(option: string) {
    if (selected.includes(option)) onChange(selected.filter((s) => s !== option));
    else onChange([...selected, option]);
  }

  function selectAll() {
    onChange([...options]);
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="relative group">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{label}:</span>
        {selected.length > 0 && (
          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
            {selected.length}
          </span>
        )}
        <button 
          className="text-xs underline text-gray-500 hover:text-primary transition-colors"
          onClick={() => selected.length ? clearAll() : selectAll()}
        >
          {selected.length ? 'Clear' : 'Select All'}
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto p-1 custom-scrollbar">
        {options.map((op) => (
          <button
            key={op}
            type="button"
            className={`rounded-full px-3 py-1 border transition text-sm ${
              selected.includes(op)
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-accent/10"
            } hover:scale-105 flex items-center gap-1`}
            onClick={() => toggle(op)}
          >
            {selected.includes(op) && (
              <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
            )}
            {op}
          </button>
        ))}
      </div>
    </div>
  );
}
