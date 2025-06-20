import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useAccountEffect } from 'wagmi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useModal } from '@/components/helperComponents/ConfirmationModal';

interface IWeb3Context {
  address?: string;
  isConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const Web3Context = createContext<IWeb3Context | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, authStatus, login } = useAuth();
  const { openDisconnect, setOnConfirmDisconnect } = useModal();
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  useAccountEffect({
    onConnect(data) {
      console.log('Connected!', {
        address: data.address,
        chainId: data.chainId,
        isReconnected: data.isReconnected,
      });
    },
    onDisconnect() {
      console.log('Disconnected!');
      const protectedRoutes = ['/profile', '/dashboard'];
      if (protectedRoutes.includes(location.pathname)) {
        navigate('/');
      }
    },
  });

  const connectWallet = async (e?: React.MouseEvent) => {
    if (connectors.length > 0) {
      try {
        await connect({ connector: connectors[0] });
        // After successful connection, update auth status
        if (address) {
          await login(address, 'metamask');
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const disconnectWallethis = () => {
    setOnConfirmDisconnect(() => {
      disconnect();
      logout();
    });
    openDisconnect();
  };

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected: authStatus === 'authenticated',

        connectWallet,
        disconnectWallet: () => setShowDisconnectConfirm(true),
      }}
    >
      {children}
      {showDisconnectConfirm && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-40"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Are you sure?
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Do you really want to disconnect your wallet?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDisconnectConfirm(false);
                  disconnectWallethis();
                }}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
  return context;
};

export const ConnectWallet: React.FC = () => {
  const { address, isConnected, disconnectWallet } = useWeb3();
  const { connectors, connect, isPending } = useConnect();

  if (isConnected && address) {
    return (
      <div>
        <div>Connected to {address}</div>
        <button onClick={disconnectWallet}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
};
