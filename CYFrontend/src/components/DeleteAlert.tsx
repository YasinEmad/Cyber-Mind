import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAlertProps {
  title: string;
  message?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteAlert: React.FC<DeleteAlertProps> = ({ 
  title, 
  message, 
  itemName, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-red-500/30 shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-red-950/60 to-red-900/40 border-b border-red-500/20 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40">
                  <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                {itemName && (
                  <p className="text-sm text-red-300/80 mt-1">
                    <span className="font-semibold">{itemName}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-base leading-6 text-slate-300">
            {message || `Are you sure you want to delete ${itemName ? `"${itemName}"` : 'this item'}? This action cannot be undone.`}
          </p>
          <div className="mt-4 rounded-lg bg-red-900/20 border border-red-500/20 p-3">
            <p className="text-xs font-medium text-red-300 uppercase tracking-wider">
              ⚠️ This action is permanent
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-700/50 bg-slate-900/50 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-bold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAlert;
