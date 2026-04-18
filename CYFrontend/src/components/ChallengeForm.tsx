import React, { useState, useEffect } from 'react';
import { Challenge, ChallengeDifficulty } from '../types';

interface ChallengeFormProps {
  challenge?: Challenge | null;
  onSave: (challenge: Omit<Challenge, 'id'> | Challenge) => void;
  onCancel: () => void;
}

export const ChallengeForm: React.FC<ChallengeFormProps> = ({ challenge, onSave, onCancel }) => {
  const normalizeDifficulty = (value?: ChallengeDifficulty | 'easy' | 'medium' | 'hard') => {
    if (!value) return ChallengeDifficulty.Easy;

    const lower = value.toString().toLowerCase();
    if (lower === 'medium') return ChallengeDifficulty.Medium;
    if (lower === 'hard') return ChallengeDifficulty.Hard;
    return ChallengeDifficulty.Easy;
  };

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    code: string;
    difficulty: ChallengeDifficulty;
    hints: string[];
    challengeDetails: string;
    recommendation: string;
  }>({
    title: '',
    description: '',
    code: '',
    difficulty: ChallengeDifficulty.Easy,
    hints: [],
    challengeDetails: '',
    recommendation: '',
  });

  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title,
        description: challenge.description || '',
        code: challenge.code || '',
        difficulty: normalizeDifficulty(challenge.difficulty ?? challenge.level),
        hints: (challenge.hints || []) as string[],
        challengeDetails: challenge.challengeDetails || '',
        recommendation: challenge.recommendation || '',
      });
    }
  }, [challenge]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const final: Omit<Challenge, 'id'> = {
      ...formData,
    };
    if (challenge) {
      onSave({ ...challenge, ...final });
    } else {
      onSave(final);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-black border border-red-900/50 rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_25px_rgba(220,38,38,0.15)]">
        <h2 className="text-2xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
          <span className="w-1 h-6 bg-red-600"></span>
          {challenge ? 'EDIT CHALLENGE' : 'ADD NEW CHALLENGE'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Title', name: 'title', type: 'text' },
            { label: 'Description', name: 'description', type: 'textarea' },
            { label: 'Code', name: 'code', type: 'textarea' },
            { label: 'Challenge Details', name: 'challengeDetails', type: 'textarea' },
            { label: 'Recommendation', name: 'recommendation', type: 'textarea' },
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
                  required={field.name === 'title'}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-zinc-900 border border-red-900/30 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all"
                  required={field.name === 'title'}
                />
              )}
            </div>
          ))}

          {/* Level Select */}
          <div>
            <label htmlFor="level" className="block text-xs font-bold uppercase tracking-widest text-red-500 mb-1">
              Level
            </label>
            <select
              name="difficulty"
              id="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full bg-zinc-900 border border-red-900/30 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all"
              required
            >
              <option value={ChallengeDifficulty.Easy}>Easy</option>
              <option value={ChallengeDifficulty.Medium}>Medium</option>
              <option value={ChallengeDifficulty.Hard}>Hard</option>
            </select>
          </div>

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
              Save Security Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};