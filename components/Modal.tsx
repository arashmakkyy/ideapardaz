import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      // 1. کلاس `items-center` به `items-start` تغییر کرد تا مودال به بالا بچسبد.
      // 2. کلاس `pt-16` اضافه شد تا از بالای صفحه فاصله بگیرد و زیباتر شود.
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-16"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md mx-auto flex flex-col rounded-3xl bg-slate-800/60 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 text-white animate-flow-in max-h-[85vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-wider">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-300 bg-white/10 hover:bg-white/20 transition-colors" aria-label="بستن">
            <i className="ph-bold ph-x text-xl"></i>
          </button>
        </div>
        {/* این بخش چون `overflow-y-auto` دارد، به درستی اسکرول خواهد شد */}
        <div className="flex-1 overflow-y-auto -ml-4 pl-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;