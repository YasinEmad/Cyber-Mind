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
        // Coerce incoming puzzle.level to a Number to keep internal state consistent
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
      // Always keep `level` as a number in state; treat empty input as 1 and clamp to allowed range
      let parsed: number = (value === '' ? 1 : Number(value));
      if (!Number.isFinite(parsed) || Number.isNaN(parsed)) parsed = 1;
      // Ensure integer and within [1,3]
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
    // Ensure number typing before saving and validate
    const computedLevel = Number((formData as any).level);
    const validatedLevel = Number.isInteger(computedLevel) && [1,2,3].includes(computedLevel) ? computedLevel : 1;
    const final = { ...formData, level: validatedLevel } as Omit<Puzzle, '_id' | 'createdAt' | 'updatedAt'>;
    try { console.debug('PuzzleForm.handleSubmit: final.level:', final.level, 'typeof:', typeof final.level); } catch (e) {}
    if (puzzle) {
      onSave({ ...puzzle, ...final });
    } else {
      onSave(final);
    }
  };

  return (
<div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">{puzzle ? 'Edit Puzzle' : 'Add New Puzzle'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-300">Tag</label>
            <input
              type="text"
              name="tag"
              id="tag"
              value={formData.tag}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-300">Level</label>
            <input
              type="number"
              name="level"
              id="level"
              value={formData.level}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
              max="3"
              step="1"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
            <input
              type="text"
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="scenario" className="block text-sm font-medium text-gray-300">Scenario</label>
            <textarea
              name="scenario"
              id="scenario"
              value={formData.scenario}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-300">Answer</label>
            <input
              type="text"
              name="answer"
              id="answer"
              value={formData.answer}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Hints</label>
            {formData.hints.map((hint, index) => (
              <div key={index} className="flex items-center space-x-2 mt-2">
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => handleHintChange(index, e.target.value)}
                  className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="button" onClick={() => removeHint(index)} className="text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addHint} className="mt-2 text-sm text-blue-500 hover:text-blue-700">Add Hint</button>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-300">Active</label>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Puzzle</button>
          </div>
        </form>
      </div>
    </div>
  );
};