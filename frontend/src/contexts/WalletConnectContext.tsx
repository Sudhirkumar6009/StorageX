import React, { createContext, useContext, useState, useEffect } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { useAuth } from './AuthContext';

const INFURA_ID = import.meta.env.VITE_INFURA_ID;
interface IWalletConnectContext {
  connectWalletConnect: () => Promise<void>;
  disconnectWalletConnect: () => Promise<void>;
  account: string | null;
  isConnected: boolean;
}

const WalletConnectContext = createContext<IWalletConnectContext | undefined>(
  undefined
);

export const WalletConnectProviderComponent: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [provider, setProvider] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { login, logout, authenticationType, user } = useAuth();

  // Try to restore WalletConnect session on component mount
  useEffect(() => {
    const initWalletConnect = async () => {
      // Only try to reconnect if user has walletConnect as authenticationType
      if (authenticationType === 'walletConnect' && user?.email) {
        try {
          const ethProvider = await EthereumProvider.init({
            projectId: INFURA_ID,
            chains: [1],
            showQrModal: false, // Don't show QR code on auto reconnect
            rpcMap: {
              1: `https://mainnet.infura.io/v3/${INFURA_ID}`,
            },
          });

          // Check if there's an existing session
          if (ethProvider.session) {
            await ethProvider.enable();
            setProvider(ethProvider);
            setAccount(ethProvider.accounts[0]?.toUpperCase() || null);
            setIsConnected(true);

            // Set up disconnect handler
            ethProvider.on('disconnect', () => {
              setAccount(null);
              setIsConnected(false);
              setProvider(null);
              if (authenticationType === 'walletConnect') {
                logout();
              }
            });
          }
        } catch (error) {
          console.log('Failed to restore WalletConnect session:', error);
        }
      }
    };

    initWalletConnect();
  }, [authenticationType, user]);

  useEffect(() => {
    const tryRestoreSession = async () => {};
    tryRestoreSession();
  }, []);

  const connectWalletConnect = async () => {
    try {
      const ethProvider = await EthereumProvider.init({
        projectId: INFURA_ID,
        chains: [1],
        showQrModal: true,
        rpcMap: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`,
        },
      });

      await ethProvider.enable();
      setProvider(ethProvider);
      setAccount(ethProvider.accounts[0]?.toUpperCase() || null);
      setIsConnected(true);

      ethProvider.on('disconnect', () => {
        setAccount(null);
        setIsConnected(false);
        setProvider(null);
        if (authenticationType === 'walletConnect') {
          logout();
        }
      });
    } catch (error) {
      console.error('Failed to connect WalletConnect:', error);
      throw error;
    }
  };

  const disconnectWalletConnect = async () => {
    try {
      if (provider) {
        await provider.disconnect();
      }
      setAccount(null);
      setIsConnected(false);
      setProvider(null);
      if (authenticationType === 'walletConnect') {
        logout();
      }
    } catch (error) {
      console.error('Failed to disconnect WalletConnect:', error);
    }
  };

  return (
    <WalletConnectContext.Provider
      value={{
        connectWalletConnect,
        disconnectWalletConnect,
        account: account ? account.toUpperCase() : null,
        isConnected,
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error(
      'useWalletConnect must be used within a WalletConnectProviderComponent'
    );
  }
  return context;
};
