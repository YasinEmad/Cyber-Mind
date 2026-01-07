import React, { useState, useEffect } from 'react';
import { Puzzle } from '../redux/slices/puzzleSlice';

interface PuzzleFormProps {
  puzzle?: Puzzle | null;
  onSave: (puzzle: Omit<Puzzle, '_id'> | Puzzle) => void;
  onCancel: () => void;
}

export const PuzzleForm: React.FC<PuzzleFormProps> = ({ puzzle, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Puzzle, '_id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    tag: '',
    description: '',
    level: 1,
    hints: [],
    answer: '',
    scenario: '',
    category: '',
    active: true,
  });

  useEffect(() => {
    if (puzzle) {
        setFormData({
        title: puzzle.title,
          tag: puzzle.tag || '',
        description: puzzle.description,
        level: typeof puzzle.level === 'undefined' || puzzle.level === null ? 1 : Number(puzzle.level),
        hints: puzzle.hints,
        answer: puzzle.answer || '',
        scenario: puzzle.scenario,
        category: puzzle.category,
        active: puzzle.active,
      });
    }
  }, [puzzle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
  
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'level') {
      let parsed: number = (value === '' ? 1 : Number(value));
      if (!Number.isFinite(parsed) || Number.isNaN(parsed)) parsed = 1;
      parsed = Math.trunc(parsed);
      parsed = Math.max(1, Math.min(3, parsed));
      setFormData(prev => ({ ...prev, [name]: parsed as any }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  const addHint = () => {
    setFormData(prev => ({ ...prev, hints: [...prev.hints, ''] }));
  };

  const removeHint = (index: number) => {
    const newHints = formData.hints.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const computedLevel = Number((formData as any).level);
    const validatedLevel = Number.isInteger(computedLevel) && [1,2,3].includes(computedLevel) ? computedLevel : 1;
    const final = { ...formData, level: validatedLevel } as Omit<Puzzle, '_id' | 'createdAt' | 'updatedAt'>;
    if (puzzle) {
      onSave({ ...puzzle, ...final });
    } else {
      onSave(final);
    }
  };

  return (
    // Backdrop updated to a dark blur
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">
      {/* Modal Container: Deeper black and red border */}
      <div className="bg-black border border-red-900/50 rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_25px_rgba(220,38,38,0.15)]">
        <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
          <span className="w-1 h-6 bg-red-600"></span>
          {puzzle ? 'EDIT PUZZLE' : 'ADD NEW PUZZLE'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Tag', name: 'tag', type: 'text' },
            { label: 'Title', name: 'title', type: 'text' },
            { label: 'Description', name: 'description', type: 'textarea' },
            { label: 'Level (1-3)', name: 'level', type: 'number', min: 1, max: 3 },
            { label: 'Category', name: 'category', type: 'text' },
            { label: 'Scenario', name: 'scenario', type: 'textarea' },
            { label: 'Answer', name: 'answer', type: 'text' },
          ].map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-xs font-bold uppercase tracking-widest text-red-500 mb-1">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  id={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full bg-zinc-900 border border-red-900/30 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all"
                  required={field.name !== 'scenario'}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  min={field.min}
                  max={field.max}
                  className="mt-1 block w-full bg-zinc-900 border border-red-900/30 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all"
                  required={field.name !== 'answer'}
                />
              )}
            </div>
          ))}

          {/* Hints Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Hints</label>
            {formData.hints.map((hint, index) => (
              <div key={index} className="flex items-center space-x-2 mt-2">
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => handleHintChange(index, e.target.value)}
                  className="block w-full bg-zinc-900 border border-red-900/30 rounded-md py-2 px-3 text-white focus:ring-1 focus:ring-red-600 outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => removeHint(index)} 
                  className="text-red-600 hover:text-red-400 font-bold text-xs uppercase"
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={addHint} 
              className="mt-2 text-xs font-bold uppercase text-red-500 hover:text-red-400 flex items-center gap-1"
            >
              + Add Hint
            </button>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 bg-zinc-900 border-red-900 rounded focus:ring-red-600"
            />
            <label htmlFor="active" className="ml-2 block text-sm font-bold text-gray-400 uppercase tracking-tighter">
              Puzzle Active
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-red-900/20">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-6 py-2 bg-transparent text-gray-400 font-bold uppercase text-xs hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-red-700 text-white font-black uppercase text-xs rounded-sm hover:bg-red-600 shadow-[0_0_15px_rgba(185,28,28,0.4)] transition-all"
            >
              Save Security Puzzle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};