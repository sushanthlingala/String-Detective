import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="theme-modal border rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in relative space-y-5 font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg theme-nav-btn border transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clean Header */}
        <div className="pr-8">
          <h2 className="text-base font-bold font-display theme-text-primary tracking-tight">
            Assignment Details
          </h2>
        </div>

        {/* Details Card */}
        <div className="theme-subpanel border rounded-xl p-4 space-y-3 text-xs font-mono">
          <div className="flex justify-between items-center border-b theme-border-subtle pb-2">
            <span className="theme-text-secondary">Student ID:</span>
            <span className="font-bold theme-text-primary tracking-wider">SE24UCSE168</span>
          </div>
          <div className="flex justify-between items-center border-b theme-border-subtle pb-2">
            <span className="theme-text-secondary">Student Name:</span>
            <span className="font-bold theme-text-primary">Sushanth Lingala</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="theme-text-secondary">Course:</span>
            <span className="font-bold theme-text-primary">Object-Oriented Programming (Java)</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-1 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 theme-btn-primary rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
