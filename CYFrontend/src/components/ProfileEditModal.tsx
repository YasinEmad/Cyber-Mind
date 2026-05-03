import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ProfileEditModalProps {
  isEditing: boolean;
  formName: string;
  formPhoto: string;
  editLoading: boolean;
  onClose: () => void;
  onFormNameChange: (value: string) => void;
  onFormPhotoChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isEditing,
  formName,
  formPhoto,
  editLoading,
  onClose,
  onFormNameChange,
  onFormPhotoChange,
  onSubmit,
}) => (
  <AnimatePresence>
    {isEditing && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-[2rem] p-10 shadow-2xl relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-red-600 rounded-b-full shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Override Identity</h2>
          <form onSubmit={onSubmit} className="space-y-6">
            <InputGroup label="Alias" value={formName} onChange={onFormNameChange} />
            <InputGroup label="Avatar URL" value={formPhoto} onChange={onFormPhotoChange} />
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-neutral-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                Abort
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 uppercase text-xs tracking-widest"
              >
                {editLoading ? 'Syncing...' : 'Update'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const InputGroup = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-white focus:border-red-600 outline-none transition-all"
    />
  </div>
);

export default ProfileEditModal;
