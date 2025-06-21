import React, { createContext, useContext, useState } from 'react';
import { useDisconnect } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';

interface ModalContextType {
  showDisconnect: boolean;
  openDisconnect: () => void;
  closeDisconnect: () => void;
  onConfirmDisconnect: () => void;
  setOnConfirmDisconnect: (fn: () => void) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [onConfirmDisconnect, setOnConfirmDisconnect] = useState<() => void>(() => () => {});

  const openDisconnect = () => setShowDisconnect(true);
  const closeDisconnect = () => setShowDisconnect(false);
  
  return (
    <ModalContext.Provider
    value={{
        showDisconnect,
        openDisconnect,
        closeDisconnect,
        onConfirmDisconnect,
        setOnConfirmDisconnect,
      }}
      >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};

// --- Add and export the modal component here ---
export const DisconnectConfirmModal: React.FC<{
  open: boolean;
  onCancel: () => void;
}> = ({ open, onCancel }) => {
  const { authenticationType, logout } = useAuth();
  const { disconnect } = useDisconnect(); 
  if (!open) return null;
  const handleConfirm = () => {
    if (authenticationType === 'metamask') {
      disconnect();
      logout();
    }
    else if (authenticationType === 'google') {
      logout();
  }
  onCancel();
}
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-40"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Are you sure?
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Do you really want to disconnect your Account?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};