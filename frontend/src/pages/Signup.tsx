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
import {
  X,
  ArrowRightFromLine,
  ChevronRight,
  ChevronRightCircleIcon,
} from 'lucide-react';
import { useWalletConnect } from '../contexts/WalletConnectContext';
import { userInfo } from 'os';
import { useAuth } from '@/contexts/AuthContext.js';
import { useProfile } from '@/contexts/ProfileContext';
import { form } from 'viem/chains';

const Signup = () => {
  const { theme } = useTheme();
  const { login, isAuthenticated, authenticationType } = useAuth();
  const navigate = useNavigate();
  const {
    connectWalletConnect,
    disconnectWalletConnect,
    account: wcAccount,
    isConnected: wcIsConnected,
  } = useWalletConnect();
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [walletInfo, setWalletInfo] = useState(null);
  const [connectClicked, setConnectClicked] = useState(false);
  const [wcConnectClicked, setWcConnectClicked] = useState(false);
  const [wcEmail, setWcEmail] = useState('');
  const { updateGlobalProfileImage } = useProfile();
  const [loadingCreation, setLoadingCreation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
  });
  const closeWcEmailReq = () => {
    setWcConnectClicked(false);
    setWcEmail('');
  };
  const closeEmailReq = () => {
    setConnectClicked(false);
    setFormData({ email: '' });
  };
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
  const sendToast = () => {
    if (!isConnected && !wcIsConnected) {
      toast({
        title: 'Connect Wallet First',
        className:
          'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
        description: 'Please connect your wallet to continue.',
        variant: 'destructive',
        duration: 3000,
      });
    } else {
      console.log('Wallet already connected');
    }
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

  const handleCreateAccount = async () => {
    if (!isConnected && !wcIsConnected) {
      sendToast();
      return;
    }
    setLoadingCreation(true);

    let walletAddress = '';
    let loginType: 'metamask' | 'walletConnect' = 'metamask';
    let emailToUse = '';
    if (isConnected) {
      walletAddress = address;
      loginType = 'metamask';
      emailToUse = formData.email;
    } else if (wcIsConnected) {
      walletAddress = wcAccount;
      loginType = 'walletConnect';
      emailToUse = wcEmail;
    }

    try {
      // 1. Check if account exists
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_PORT_URL}/api/fetchUser`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: walletAddress.toUpperCase() }),
        }
      );
      const data = await res.json();

      if (data.success) {
        // 2. If account exists, login
        await login(walletAddress, loginType);
        await fetchAndSetProfileImage(walletAddress, loginType);
        toast({
          title: 'Login Successful',
          className:
            'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
          description: `Welcome back, ${
            walletAddress.slice(0, 6) + '...' + walletAddress.slice(-5)
          }`,
        });
        navigate('/dashboard');
      } else {
        // 3. If not found, create account then login
        const createRes = await fetch(
          `${import.meta.env.VITE_BACKEND_PORT_URL}/api/store-address`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: emailToUse, // Use the email based on connection type
              Wallet: walletAddress,
            }),
          }
        );
        const createData = await createRes.json();

        if (createData.success) {
          await login(walletAddress, loginType);
          await fetchAndSetProfileImage(walletAddress, loginType);
          toast({
            title: 'Account Created & Logged In',
            className:
              'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
            description: 'Your account was created and you are now logged in.',
            variant: 'default',
            duration: 3000,
          });
          navigate('/dashboard');
        } else if (createData.exists) {
          // Defensive: fallback if race condition
          await login(walletAddress, loginType);
          await fetchAndSetProfileImage(walletAddress, loginType);
          toast({
            title: 'Login Successful',
            className:
              'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider',
            description: `Welcome back, ${
              walletAddress.slice(0, 6) + '...' + walletAddress.slice(-5)
            }`,
            variant: 'default',
            duration: 3000,
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Error Creating Account',
            className:
              'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
            description: createData.message || 'Failed to create account.',
            variant: 'destructive',
            duration: 3000,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        className:
          'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
        description: error.message || 'Failed to login or create account.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setLoadingCreation(false);
    }
  };

  const fetchUserData = async (walletAddress: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_PORT_URL}/api/fetchUser`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: walletAddress.toUpperCase() }),
        }
      );
      const data = await res.json();

      if (data.success && data.profile && data.profile.email) {
        return data.profile.email;
      }
      return '';
    } catch (error) {
      console.error('Error fetching user data:', error);
      return '';
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData(address).then((email) => {
        if (email) {
          setFormData((prev) => ({ ...prev, email }));
          setConnectClicked(true);
        }
      });
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (wcIsConnected && wcAccount) {
      fetchUserData(wcAccount).then((email) => {
        if (email) {
          setWcEmail(email);
          setWcConnectClicked(true);
        }
      });
    }
  }, [wcIsConnected, wcAccount]);

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
              className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
              } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider `}
            >
              JOIN StorageX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 pt-4">
              <div>
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
                    } ${
                      isConnected ? 'opacity-50 cursor-not-allowed' : ''
                    } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider `}
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
                {isConnected && address && (
                  <div
                    className={`font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider text-xs mt-2 text-[#00BFFF] break-all`}
                  >
                    Connected: {address}
                  </div>
                )}
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
                          } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider `}
                        >
                          Email
                          <em
                            className={` font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider text-xs font-normal not-italic text-gray-400`}
                          >
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
                        } focus:ring-2 focus:ring-cyan-400 outline-none transition-all font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider`}
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
                  } ${
                    wcIsConnected ? 'opacity-50 cursor-not-allowed' : ''
                  } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider `}
                  onClick={() => {
                    connectWalletConnect();
                    !wcIsConnected && setWcConnectClicked(true);
                  }}
                  disabled={wcIsConnected || isAuthenticated}
                  type="button"
                >
                  <Avatar className="w-6 h-6 mt-1 ml-1 rounded-full">
                    <AvatarFallback className="bg-transparent rounded-full">
                      <img
                        src="https://i.ibb.co/rKKXhDtv/wallet-Connect.png"
                        alt="Metamask"
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
                    className={`absolute right-3 transform -translate-y-1/2 w-6 h-6 p-1 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center transition-all duration-1000 shadow-md ${
                      wcIsConnected && wcConnectClicked ? 'top-6' : 'top-1/4'
                    }`}
                    title="Disconnect WalletConnect"
                  >
                    <X size={13} />
                  </button>
                )}
                {wcIsConnected && wcAccount && (
                  <div
                    className={`font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider text-xs mt-2 text-[#00BFFF] break-all`}
                  >
                    Connected: {wcAccount}
                  </div>
                )}
                <div
                  className={`
    w-full
    overflow-hidden
    transition-all duration-1000 ease-in-out
    ${
      wcIsConnected && wcConnectClicked
        ? 'max-h-40 opacity-100 translate-y-0 mt-6'
        : 'max-h-0 opacity-0 -translate-y-4'
    } 
  `}
                >
                  <div className="relative bg-black border border-cyan-400 rounded-xl shadow-lg p-5 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Label
                          htmlFor="wc-email"
                          className={`flex items-center gap-2 text-sm font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider `}
                        >
                          Email
                          <em
                            className={` font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider text-xs font-normal not-italic text-gray-400`}
                          >
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
                        id="wc-email"
                        name="wc-email"
                        type="email"
                        placeholder="Enter your email"
                        value={wcEmail}
                        onChange={(e) => setWcEmail(e.target.value)}
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
                        } focus:ring-2 focus:ring-cyan-400 outline-none transition-all font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider`}
                      />
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={closeWcEmailReq}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full hover:bg-red-300 text-red-900 text-xl font-bold grid place-items-center transition-all shadow-md"
                  >
                    <X size={15} />
                  </button>
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
                  } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider `}
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
                onClick={
                  isConnected || wcIsConnected ? handleCreateAccount : sendToast
                }
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
    ${!isConnected && !wcIsConnected ? 'opacity-50 cursor-not-allowed' : ''}
  `}
              >
                {isAuthenticated ? (
                  `Already Logged in with ${
                    authenticationType === 'google'
                      ? 'Google'
                      : isConnected
                      ? 'MetaMask'
                      : wcIsConnected
                      ? 'WalletConnect'
                      : ''
                  }`
                ) : isConnected || wcIsConnected ? (
                  <span
                    className={`flex items-center justify-center font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider`}
                  >
                    CONTINUE{' '}
                    <ChevronRight
                      strokeWidth={2}
                      className="ml-2"
                      style={{
                        width: 25,
                        height: 25,
                        minWidth: 25,
                        minHeight: 25,
                      }}
                    />
                  </span>
                ) : (
                  <span
                    className={`font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider`}
                  >
                    SELECT TO CONTINUE
                  </span>
                )}
              </Button>
            </form>
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
