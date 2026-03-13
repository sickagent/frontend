import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`
              relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'}
              bg-surface-1 border border-border
              rounded-2xl shadow-2xl shadow-black/40
              max-h-[85vh] flex flex-col
            `}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                <h2 className="text-lg font-semibold text-fg">{title}</h2>
                <IconButton onClick={onClose}>
                  <X className="w-4 h-4" />
                </IconButton>
              </div>
            )}
            <div className="overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
