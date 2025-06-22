import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useAccountEffect } from 'wagmi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

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
  const { logout, authStatus, login, authenticationType } = useAuth();
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
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

  const effectiveConnection =
    authenticationType === 'google' ? false : isConnected;
  const connectWallet = async () => {
    if (connectors.length > 0) {
      try {
        await connect({ connector: connectors[0] });
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected: effectiveConnection,
        connectWallet,
        disconnectWallet: () => setShowDisconnectConfirm(true),
      }}
    >
      {children}
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
