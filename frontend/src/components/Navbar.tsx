import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useWeb3 } from '@/contexts/Web3Context';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useModal } from './helperComponents/ConfirmationModal';
import { useProfile } from '../contexts/ProfileContext';
import { useWalletConnect } from '../contexts/WalletConnectContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, authenticationType, user } = useAuth();
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { openDisconnect, setOnConfirmDisconnect } = useModal();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mongoStatus, setMongoStatus] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { globalProfileImage, updateGlobalProfileImage } = useProfile();
  const { account: wcAccount, isConnected: wcIsConnected } = useWalletConnect();
  const backendUrl = import.meta.env.VITE_BACKEND_PORT_URL;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated) {
        setTimeout(async () => {
          try {
            await fetchProfileData();
          } catch (err) {
            console.error('Error loading profile on mount:', err);
          }
        }, 100);
      } else {
        setProfileImage(null);
        updateGlobalProfileImage(null);
      }
    };

    loadProfile();
  }, [
    isAuthenticated,
    authenticationType,
    address,
    wcAccount,
    wcIsConnected,
    isConnected,
    user?.email,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const disconnectEmail = async () => {
    setOnConfirmDisconnect(() => logout);
    openDisconnect();
  };
  const finalAddress = (() => {
    if (authenticationType === 'metamask' && address) {
      return address;
    } else if (authenticationType === 'walletConnect' && wcAccount) {
      return wcAccount;
    } else if (authenticationType === 'google' && user?.email) {
      return user.email;
    }
    return '';
  })();
  const disconnectWalletthis = async () => {
    setOnConfirmDisconnect(() => logout);
    openDisconnect();
  };
  const fetchProfileData = async () => {
    try {
      let res;
      if (
        authenticationType === 'metamask' ||
        authenticationType === 'walletConnect'
      ) {
        // Check if finalAddress exists and is valid
        if (!finalAddress) {
          console.log('No wallet address available');
          return;
        }
        res = await fetch(`${backendUrl}/api/profile/show/${finalAddress}`);
      } else if (authenticationType === 'google') {
        if (!user?.email) {
          console.log('No email available');
          return;
        }
        res = await fetch(
          `${backendUrl}/api/profile/show/google/${user.email}`
        );
      } else {
        return; // Exit early if no valid auth type
      }

      if (!res || !res.ok) {
        const status = res ? res.status : 'unknown';
        let errorText = `HTTP error! status: ${status}`;
        if (res) {
          try {
            const errData = await res.text();
            errorText += ` | Response: ${errData}`;
          } catch {}
        }
        throw new Error(errorText);
      }
      const data = await res.json();

      if (data.success) {
        if (data.data.profileImage) {
          setProfileImage(data.data.profileImage);
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      toast({
        title: 'Error loading profile',
        className:
          'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative group" ref={ref}>
        <div
          className="relative rounded-full p-1 bg-[#00BFFF]/20 cursor-pointer"
          onClick={() => setOpen((o) => !o)}
        >
          <Avatar className="w-9 h-9 ring-1 ring-[#00BFFF] ring-offset-1 ring-offset-gray-900">
            {globalProfileImage || profileImage ? (
              <AvatarImage
                src={globalProfileImage || profileImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '';
                  toast({
                    title: 'Error loading image',
                    className:
                      'font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider',
                    description: 'Could not load profile image',
                    variant: 'destructive',
                  });
                }}
              />
            ) : (
              <AvatarFallback className="bg-gray-800 dark:bg-gray-700">
                <img
                  src="https://i.ibb.co/XZmv5M8X/profile.png"
                  width={50}
                  height={50}
                  alt="Profile"
                  className="border-r-2 border-[#00BFFF] rounded-full transition-all duration-300 active:scale-95 hover:shadow-lg py-2"
                  style={{
                    boxShadow:
                      theme === 'dark'
                        ? '0 2px 8px #00BFFF33'
                        : '0 2px 8px #00BFFF22',
                  }}
                />
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div
          className={`
          absolute left-0 transform -translate-x-0 translate-y-3 opacity-0
          group-hover:translate-y-5 group-hover:opacity-100
          transition-all duration-300
          flex items-center
          pointer-events-none
          bg-transparent
          ${authenticationType === 'google' ? 'w-60' : 'w-48'}
        `}
          style={{ zIndex: 10 }}
        >
          <span className="text-[#00BFFF] text-sm font-mono bg-white dark:bg-gray-800 rounded px-2 py-1 shadow">
            {authenticationType === 'metamask' && address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : authenticationType === 'walletConnect' && wcAccount
              ? `${wcAccount.slice(0, 6)}...${wcAccount.slice(-4)}`
              : authenticationType === 'google'
              ? user?.email || 'Google User'
              : ''}
          </span>
        </div>

        {open && (
          <div className="border-b absolute right-0 mt-5 w-48 bg-white dark:bg-gray-800 rounded shadow-lg z-50 flex flex-col border border-none">
            {children}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className={`
        fixed z-50 border-b transition-all duration-500 backdrop-blur-sm
        left-1/2 -translate-x-1/2
        ${
          theme === 'dark'
            ? 'bg-transparent/80 border-gray-800'
            : 'bg-white/90 border-gray-200'
        }
        rounded-full shadow-lg
      `}
      style={{
        top: scrolled ? 20 : 0,
        width: scrolled ? '90vw' : '100vw',
        margin: 0,
        borderColor: '#00bfff',
        borderRadius: scrolled ? '2rem' : '0rem',
        transform: 'translateX(-50%)',
        transition:
          'top 0.4s cubic-bezier(.4,2,.6,1), width 0.4s cubic-bezier(.4,2,.6,1)',
      }}
    >
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`text-3xl transition-colors duration-200 pl-2 ${
              theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
            }`}
          >
            <img
              src="https://i.ibb.co/W4bsrLGW/logo.png"
              alt="Logo"
              className={`${
                scrolled
                  ? 'pr-4 h-6 w-13 inline-block mb-2'
                  : 'pr-3 h-7 w-13 inline-block mb-1'
              }`}
            />
          </Link>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="items-center h-full flex">
                <div>
                  <Link to="/" className="flex items-center h-full">
                    <Button
                      variant="outline"
                      className={`rounded-none h-full sm:mr-5 font-10 border-0 transition-colors duration-200
                      ${
                        theme === 'dark'
                          ? 'bg-transparent text-white hover:text-[#00BFFF]'
                          : 'bg-transparent text-black hover:text-[#00BFFF]'
                      }
                      font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-widest
                    `}
                      style={{
                        textTransform: 'none',
                      }}
                    >
                      Home
                    </Button>
                  </Link>
                </div>
                <div>
                  <Link to="/dashboard" className="flex items-center h-full">
                    <Button
                      variant="outline"
                      className={`rounded-none border-0 font-normal sm:mr-5 capitalize transition-colors duration-200
                      ${
                        theme === 'dark'
                          ? 'bg-transparent text-white hover:text-[#00BFFF]'
                          : 'bg-transparent text-black hover:text-[#00BFFF]'
                      }
                      font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-widest
                    `}
                      style={{
                        textTransform: 'none',
                      }}
                    >
                      Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <Link to="/signup" className="flex items-center h-full">
                  <Button
                    variant="outline"
                    className={`rounded-none border-0 font-normal sm:mr-5 capitalize transition-colors duration-200
                      ${
                        theme === 'dark'
                          ? 'bg-transparent text-white hover:text-[#00BFFF]'
                          : 'bg-transparent text-black hover:text-[#00BFFF]'
                      }
                      font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-widest
                    `}
                    style={{
                      textTransform: 'none',
                    }}
                  >
                    Register Now
                  </Button>
                </Link>
              </div>
            )}
            <div
              className={`flex items-center space-x-4 font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider`}
            >
              {isAuthenticated && (
                <DropdownMenu>
                  <Link to={`/profile`}>
                    <button className="block text-left w-full px-4 py-2 text-black hover:bg-[#00BFFF] dark:hover:text-white dark:text-white">
                      Manage Profile
                    </button>
                  </Link>
                  <button className="block text-left w-full px-4 py-2 text-black hover:bg-[#00BFFF] dark:hover:text-white dark:text-white">
                    Option 2
                  </button>
                  <button className="block text-left w-full px-4 py-2 text-black hover:bg-[#00BFFF] dark:hover:text-white dark:text-white">
                    Option 3
                  </button>
                  <button className="block text-left w-full px-4 py-2 text-black hover:bg-[#00BFFF] dark:hover:text-white dark:text-white">
                    Option 4
                  </button>
                  {authenticationType === 'metamask' ||
                  authenticationType === 'walletConnect' ? (
                    <button
                      onClick={disconnectWalletthis}
                      className="block text-left w-full font-bold px-4 py-2 bg-red-300 darsk:bg-red-500 dark:hover:bg-red-500 dark:bg-red-800 hover:bg-red-600 hover:text-white dark:hover:text-white"
                    >
                      Disconnect Wallet
                    </button>
                  ) : (
                    <button
                      onClick={disconnectEmail}
                      className="block text-left w-full px-4 py-2 bg-red-300 darsk:bg-red-500 dark:hover:bg-red-500 dark:bg-red-800 hover:bg-red-600 hover:text-white dark:hover:text-white"
                    >
                      Sign out
                    </button>
                  )}
                </DropdownMenu>
              )}

              <Button
                onClick={toggleTheme}
                variant="outline"
                size="icon"
                className={`border-none p-2 rounded-full ${
                  theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                }`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
