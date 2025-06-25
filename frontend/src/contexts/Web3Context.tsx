import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useAccountEffect } from 'wagmi';
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
  const { logout, authStatus, login, authenticationType } = useAuth();
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

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
    },
  });

  // Always provide uppercase address for MetaMask
  const normalizedAddress =
    authenticationType === 'metamask' && address
      ? address.toUpperCase()
      : address;

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

  // Implement proper disconnectWallet function that actually disconnects
  const disconnectWallet = () => {
    try {
      disconnect();
      // If you need to clear any local state related to wallet connection
      if (authenticationType === 'metamask') {
        logout();
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        address: normalizedAddress, // Always uppercase for MetaMask
        isConnected: effectiveConnection,
        connectWallet,
        disconnectWallet, // Now passes the actual disconnect function
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
