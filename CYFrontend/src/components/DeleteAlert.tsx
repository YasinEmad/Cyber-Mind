import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface DeleteAlertProps {
  title: string;
  puzzleTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAlert: React.FC<DeleteAlertProps> = ({ title, puzzleTitle, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
            <ShieldAlert className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-lg text-gray-400">
              Are you sure you want to delete the puzzle "{puzzleTitle}"? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAlert;
