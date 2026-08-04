// frontend/src/components/LibraryCombobox.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';

export default function LibraryCombobox({
  label,
  selectedIds = [],
  items = [],
  displayKey,
  placeholder,
  onToggle,
  onAddNew,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lower = searchTerm.toLowerCase();
    return items.filter(item => {
      const label = displayKey(item).toLowerCase();
      return label.includes(lower);
    });
  }, [items, searchTerm, displayKey]);

  const toggleItem = (id) => {
    onToggle(id);
    setIsOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        {/* Selected items chips */}
        <div className="flex flex-wrap gap-1 p-2 bg-gray-700 rounded border border-gray-600 min-h-[42px]">
          {selectedIds.map(id => {
            const item = items.find(i => i.id === id);
            if (!item) return null;
            return (
              <span key={id} className="bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded flex items-center gap-1 text-sm">
                {displayKey(item)}
                <button
                  type="button"
                  onClick={() => toggleItem(id)}
                  className="text-xs hover:text-red-300"
                >
                  ✕
                </button>
              </span>
            );
          })}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedIds.length === 0 ? placeholder : ''}
            className="flex-1 bg-transparent border-0 outline-none text-sm min-w-[100px]"
          />
        </div>
        {/* Dropdown list */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg max-h-48 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-2 text-sm text-gray-400">No items found</div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`p-2 hover:bg-gray-700 cursor-pointer text-sm flex justify-between items-center ${
                    selectedIds.includes(item.id) ? 'bg-blue-900/30' : ''
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <span>{displayKey(item)}</span>
                  {selectedIds.includes(item.id) && <span className="text-blue-400">✓</span>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onAddNew}
        className="mt-1 text-sm text-blue-400 hover:text-blue-300"
      >
        + Add new {label.toLowerCase()}
      </button>
    </div>
  );
}
