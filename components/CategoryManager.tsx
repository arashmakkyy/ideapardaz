import React, { useState } from 'react';
import type { Vibe } from '../types';

interface CategoryManagerProps {
  categories: Vibe[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_VIBE_IDS = ['1', '2', '3'];

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories: vibes, onAdd, onDelete }) => {
  const [newVibeName, setNewVibeName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVibeName.trim() && !vibes.some(c => c.name === newVibeName.trim())) {
      onAdd(newVibeName.trim());
      setNewVibeName('');
    }
  };
  
  const inputStyle = "flex-grow p-3 bg-slate-900/50 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-slate-100";

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="نام وایب جدید (با ایموجی هم میشه!)"
          value={newVibeName}
          onChange={(e) => setNewVibeName(e.target.value)}
          className={inputStyle}
          required
        />
        <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors">افزودن</button>
      </form>
      <div className="max-h-60 overflow-y-auto -mr-2 pr-2">
        <ul className="space-y-2">
          {vibes.map(vibe => (
            <li key={vibe.id} className="flex justify-between items-center p-3 bg-slate-900/20 rounded-lg">
              <span>{vibe.name}</span>
              {!DEFAULT_VIBE_IDS.includes(vibe.id) && (
                <button onClick={() => onDelete(vibe.id)} className="p-1 rounded-full text-red-400 hover:bg-red-400/20 transition-colors" aria-label={`حذف وایب ${vibe.name}`}>
                  <i className="ph-bold ph-trash"></i>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryManager;
