import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { useWeb3 } from '../contexts/Web3Context';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { ethers } from 'ethers';
import axios from 'axios';
import { X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { Riple } from 'react-loading-indicators';
import { useWalletConnect } from '../contexts/WalletConnectContext';
import { Smartphone } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

const Login = () => {
  const { theme } = useTheme();
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const navigate = useNavigate();
  const { login, isAuthenticated, authenticationType } = useAuth();
  const [fetchloading, setFetchLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const {
    connectWalletConnect,
    disconnectWalletConnect,
    account: wcAccount,
    isConnected: wcIsConnected,
  } = useWalletConnect();
  const [connectClicked, setConnectClicked] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const closeEmailReq = () => {
    setConnectClicked(false);
    setFormData({ email: '' });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setFetchLoading(true);
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const userInfo = await userInfoResponse.json();
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/googleAccount`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userInfo.email }),
          }
        );

        const data = await res.json();
        if (data.success) {
          setFetchLoading(false);
          await login(userInfo.email, 'google');
          navigate('/dashboard');
        } else {
          alert('Account creation failed: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error fetching Google user info:', error);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
    },
  });

  const { updateGlobalProfileImage } = useProfile();

  const fetchAndSetProfileImage = async (
    addressOrEmail: string,
    type: string
  ) => {
    let url = '';
    if (type === 'google') {
      url = `${
        import.meta.env.VITE_BACKEND_PORT_URL
      }/api/profile/show/google/${addressOrEmail}`;
    } else {
      url = `${
        import.meta.env.VITE_BACKEND_PORT_URL
      }/api/profile/show/${addressOrEmail}`;
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data && data.data.profileImage) {
        updateGlobalProfileImage(data.data.profileImage);
      } else {
        updateGlobalProfileImage(null);
      }
    } catch {
      updateGlobalProfileImage(null);
    }
  };

  const handleLogin = async () => {
    const loginAddress = wcIsConnected ? wcAccount : address;

    if (!loginAddress) {
      toast({
        title: 'Select to Continue',
        description:
          'Please connect your MetaMask or WalletConnect wallet or continue with Google.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    setFetchLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_PORT_URL}/api/fetchUser`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: loginAddress.toUpperCase() }),
        }
      );
      const data = await res.json();
      if (data.success) {
        if (loginAddress) {
          await login(
            loginAddress,
            wcIsConnected ? 'walletConnect' : 'metamask'
          );
          // Fetch and set profile image
          await fetchAndSetProfileImage(
            loginAddress,
            wcIsConnected ? 'walletConnect' : 'metamask'
          );
        }
        setFetchLoading(false);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${
            loginAddress.slice(0, 6) + '...' + loginAddress.slice(-5) || 'User'
          }`,
        });
        navigate('/dashboard');
      } else {
        setFetchLoading(false);
        toast({
          title: 'No profile found',
          description: 'No user exists with this wallet address.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Login Failed',
        description:
          err.message || 'Could not generate wallet from seed phrase.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      <div className="w-full max-w-md p-6">
        <Card
          className={`${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}
        >
          <CardHeader className="text-center">
            <CardTitle
              className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
              }`}
            >
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                {/* MetaMask Connect Button */}
                <div className="relative">
                  <Button
                    variant="outline"
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      height: '50px',
                    }}
                    className={`w-full text-lg px-8 py-2 ${
                      theme === 'dark'
                        ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC] hover:text-black'
                        : 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                    } ${
                      isConnected || connecting
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    onClick={async () => {
                      setConnecting(true);
                      try {
                        await connectWallet();
                        !isConnected && setConnectClicked(true);
                      } finally {
                        setConnecting(false);
                      }
                    }}
                    disabled={isConnected || connecting || isAuthenticated}
                    type="button"
                  >
                    {isConnected
                      ? 'MetaMask Connected'
                      : connecting
                      ? 'Connecting...'
                      : 'Connect MetaMask'}
                    <Avatar className="w-6 h-6 mt-1 ml-1 rounded-full">
                      <AvatarFallback className="bg-transparent rounded-full">
                        <img
                          src="https://i.ibb.co/n4y03Fs/Metamask-NZ-Crypto-wallet.png"
                          alt="Metamask"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                  {isConnected && (
                    <button
                      type="button"
                      onClick={() => disconnectWallet()}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 w-6 h-6 p-1 bg-red-600 transparent hover:bg-red-700 text-white rounded flex items-center justify-center transition-all duration-200 shadow-md"
                      title="Disconnect wallet"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                {/* WalletConnect Connect Button */}
                <div className="relative mt-4">
                  <Button
                    variant="outline"
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      height: '50px',
                    }}
                    className={`w-full text-lg px-8 py-2 ${
                      theme === 'dark'
                        ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC] hover:text-black'
                        : 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                    } ${wcIsConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={connectWalletConnect}
                    disabled={wcIsConnected || isAuthenticated}
                    type="button"
                  >
                    <Avatar className="w-6 h-6 mt-1 ml-1 rounded-full">
                      <AvatarFallback className="bg-transparent rounded-full">
                        <img
                          src="https://i.ibb.co/rKKXhDtv/wallet-Connect.png"
                          alt="WalletConnect"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </AvatarFallback>
                    </Avatar>
                    {wcIsConnected ? 'Wallet Connected' : 'Connect Wallet'}
                  </Button>
                  {wcIsConnected && (
                    <button
                      type="button"
                      onClick={disconnectWalletConnect}
                      className="absolute top-1/3 right-3 transform -translate-y-1/2 w-6 h-6 p-1 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-all duration-200 shadow-md"
                      title="Disconnect WalletConnect"
                    >
                      <X size={13} />
                    </button>
                  )}
                  {wcIsConnected && wcAccount && (
                    <div className="text-xs mt-2 text-[#00BFFF] break-all">
                      Connected: {wcAccount}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  disabled={isAuthenticated}
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    height: '50px',
                  }}
                  className={`w-full text-lg px-8 py-2 ${
                    theme === 'dark'
                      ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC] hover:text-black'
                      : 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                  }`}
                  onClick={() => {
                    googleLogin();
                  }}
                  type="button"
                >
                  <svg
                    className="mr-1 w-5 h-5"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Continue with Google
                </Button>
              </div>
              <Button
                type="button"
                onClick={isConnected || wcIsConnected ? handleLogin : undefined}
                disabled={(!isConnected && !wcIsConnected) || isAuthenticated}
                variant="outline"
                style={{
                  marginTop: '3rem',
                  height: '75px',
                  fontSize: '1.2rem',
                }}
                className={`w-full rounded-lg border transition-all duration-300 ease-in-out
                  hover:scale-105 hover:shadow-lg 
                  ${
                    theme === 'dark'
                      ? 'border-[#0091c2] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-black'
                      : 'border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white'
                  }
                  ${
                    !isConnected && !wcIsConnected
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }
                `}
              >
                {isAuthenticated
                  ? `Already Logged in with ${
                      authenticationType === 'google'
                        ? 'Google'
                        : isConnected
                        ? 'MetaMask'
                        : wcIsConnected
                        ? 'WalletConnect'
                        : ''
                    }`
                  : isConnected || wcIsConnected
                  ? 'Login'
                  : 'Select to Continue'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className={`font-medium hover:underline ${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  }`}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {fetchloading && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-40"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white dark:bg-[#000] rounded-lg p-6 shadow-lg w-30 ring-[#00BFFF] ring-offset-1">
            <Riple color="#00bfff" size="medium" text="" textColor="" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
