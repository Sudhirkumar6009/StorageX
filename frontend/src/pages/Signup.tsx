import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import Tooltip from '@mui/material/Tooltip';
import { useWeb3 } from '../contexts/Web3Context';
import { OrbitProgress, Riple } from 'react-loading-indicators';
import { useGoogleLogin } from '@react-oauth/google';
import { Info, X } from 'lucide-react';
import { userInfo } from 'os';
import { useAuth } from '@/contexts/AuthContext.js';

const Signup = () => {
  const { theme } = useTheme();
  const { login, isAuthenticated, authenticationType } = useAuth();
  const navigate = useNavigate();

  const { address, isConnected, connectWallet } = useWeb3();
  const [walletInfo, setWalletInfo] = useState(null);
  const [connectClicked, setConnectClicked] = useState(false);
  const [loadingCreation, setLoadingCreation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
  });

  const closeEmailReq = () => {
    setConnectClicked(false);
    setFormData({ email: '' });
  };

  const sendToast = () => {
    toast({
      title: 'Connect MetaMask First',
      description: 'Please connect your MetaMask wallet to continue.',
      variant: 'destructive',
      duration: 3000,
    });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoadingCreation(true);
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
          setLoadingCreation(false);
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
      setLoadingCreation(false);
      console.error('Login Failed:', error);
    },
  });

  const handleCreateWallet = async () => {
    if (!isConnected) {
      sendToast();
      return;
    }

    setLoadingCreation(true); // Set loading at the start

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_PORT_URL}/api/store-address`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, MetaMask: address }),
        }
      );
      const data = await res.json();
      if (!data.success && data.exists) {
        const toastID = toast({
          title: 'Account Already Exists',
          description: (
            <div className="flex flex-col gap-2">
              <p>An account with this MetaMask address already exists.</p>
              <Button
                onClick={() => {
                  navigate('/login');
                  toastID.dismiss();
                }}
                variant="outline"
                className="w-full"
              >
                Login Now
              </Button>
            </div>
          ),
          variant: 'destructive',
          duration: 5000,
        });
      } else if (data.success) {
        toast({
          title: 'Account Created Successfully',
          description: 'Your new wallet has been created and stored.',
          variant: 'default',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Error Creating Account',
          description: 'Failed to store wallet address.',
          variant: 'destructive',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create wallet',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoadingCreation(false); // Always stop loading at the end
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
              Join StorageX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6 pt-4">
              <div className="relative">
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
                  } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    connectWallet();
                    {
                      !isConnected && setConnectClicked(true);
                    }
                  }}
                  type="button"
                >
                  {isConnected ? 'MetaMask Connected' : 'Connect MetaMask'}
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
                <div
                  className={`
                    w-full
                    overflow-hidden
                    transition-all duration-1000 ease-in-out
                    ${
                      isConnected && connectClicked
                        ? 'max-h-40 opacity-100 translate-y-0 mt-6'
                        : 'max-h-0 opacity-0 -translate-y-4'
                    }
                  `}
                >
                  <div className="relative bg-black border border-cyan-400 rounded-xl shadow-lg p-5 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Label
                          htmlFor="email"
                          className={`flex items-center gap-2 text-sm font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          Email
                          <em className="text-xs font-normal not-italic text-gray-400">
                            Optional
                          </em>
                        </Label>
                        <Tooltip
                          placement="top"
                          title=" For Profile Management, Updates and Notifications facilities through email. User can modify or remove this anytime"
                          arrow
                        >
                          <span
                            className="w-4 h-4 flex items-center ml-2 justify-center text-cyan-400 border border-cyan-400 rounded-full font-bold p-2 cursor-pointer hover:opacity-70 transition-opacity"
                            style={{
                              fontFamily: 'algerian',
                              backgroundColor:
                                theme === 'dark' ? '#1a1a1a' : '#fff',
                            }}
                          >
                            i
                          </span>
                        </Tooltip>
                      </div>

                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        style={{
                          height: '50px',
                          paddingLeft: '1rem',
                          fontWeight: 600,
                          letterSpacing: '0.03rem',
                        }}
                        className={`w-full rounded-lg mt-1 border ${
                          theme === 'dark'
                            ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                            : 'bg-white border-gray-300 text-black'
                        } focus:ring-2 focus:ring-cyan-400 outline-none transition-all`}
                      />
                    </div>

                    {/* Close Button */}
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={closeEmailReq}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full hover:bg-red-300 text-red-900 text-xl font-bold grid place-items-center transition-all shadow-md"
                    >
                      <X size={15} />
                    </button>
                  </div>
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
                onClick={isConnected ? handleCreateWallet : sendToast}
                disabled={!isConnected || isAuthenticated}
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
                  ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isAuthenticated
                  ? `Already Logged in with ${
                      authenticationType === 'google' ? 'Google' : 'MetaMask'
                    }`
                  : isConnected
                  ? 'Create Account'
                  : 'Select any Method to Continue'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  className={`font-medium hover:underline ${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  }`}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {loadingCreation && (
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

export default Signup;
