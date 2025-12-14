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
import { Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const primaryLinks = isAuthenticated
    ? [
        { to: '/', label: 'Home' },
        { to: '/dashboard', label: 'Dashboard' },
      ]
    : [{ to: '/signup', label: 'Register Now' }];

  const navButtonClasses = `rounded-full border border-transparent px-4 py-2 transition-colors duration-200 font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-widest text-sm`;

  // Compact mode when hovered or scrolled
  const isCompact = scrolled;

  const navWidth = isCompact ? 'min(1100px, calc(100vw - 2rem))' : '100%';

  const handleMobileNavigate = () => {
    setMobileMenuOpen(false);
  };

  const profileMenuContent = (
    <>
      <Link to={`/profile`} onClick={handleMobileNavigate}>
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
          onClick={() => {
            handleMobileNavigate();
            disconnectWalletthis();
          }}
          className="block text-left w-full font-bold px-4 py-2 bg-red-300 darsk:bg-red-500 dark:hover:bg-red-500 dark:bg-red-800 hover:bg-red-600 hover:text-white dark:hover:text-white"
        >
          Disconnect Wallet
        </button>
      ) : (
        <button
          onClick={() => {
            handleMobileNavigate();
            disconnectEmail();
          }}
          className="block text-left w-full px-4 py-2 bg-red-300 darsk:bg-red-500 dark:hover:bg-red-500 dark:bg-red-800 hover:bg-red-600 hover:text-white dark:hover:text-white"
        >
          Sign out
        </button>
      )}
    </>
  );

  return (
    <>
      <nav
        ref={navRef}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-transform
          ${
            scrolled
              ? `mt-3 mx-4 sm:mx-8 md:mx-12 lg:mx-[100px] xl:mx-[150px] rounded-3xl ${
                  theme === 'dark'
                    ? 'bg-slate-950/90 backdrop-blur-md border border-[#00BFFF]/20 shadow-lg shadow-[#00BFFF]/5'
                    : 'bg-white/90 backdrop-blur-md border border-[#00BFFF]/30 shadow-lg'
                }`
              : `${
                  theme === 'dark'
                    ? 'bg-gradient-to-b from-gray-900/80 to-transparent'
                    : 'bg-gradient-to-b from-white/80 to-transparent'
                }`
          }
        `}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className={`flex items-center gap-2 group hover:scale-105 transition-transform duration-200 ${
                theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
              }`}
            >
              <img
                src="https://i.ibb.co/W4bsrLGW/logo.png"
                alt="Logo"
                className="h-7 w-auto transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {primaryLinks.map(({ to, label }) => (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center h-full"
                  >
                    <Button
                      variant="ghost"
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:text-[#00BFFF] hover:bg-[#00BFFF]/10'
                          : 'text-gray-600 hover:text-[#00BFFF] hover:bg-[#00BFFF]/10'
                      }`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {label}
                    </Button>
                  </Link>
                ))}
                {isAuthenticated && (
                  <div className="hidden md:block">
                    <DropdownMenu>{profileMenuContent}</DropdownMenu>
                  </div>
                )}
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  size="icon"
                  className={`hidden md:inline-flex p-3 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-[#00BFFF] hover:bg-slate-700 border-none'
                      : 'bg-gray-100 text-[#00BFFF] hover:bg-gray-200 border-none'
                  }`}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </Button>
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <Button
                  onClick={toggleTheme}
                  variant="outline"
                  size="icon"
                  className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-[#00BFFF] hover:bg-slate-700 border-none'
                      : 'bg-gray-100 text-[#00BFFF] hover:bg-gray-200 border-none'
                  }`}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </Button>
                <button
                  type="button"
                  className={`p-3 rounded-xl transition-all duration-200 active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className={`
            fixed left-4 right-4 z-40 md:hidden rounded-2xl
            transition-all duration-300 ease-out
            ${
              theme === 'dark'
                ? 'bg-slate-950/95 backdrop-blur-md border border-[#00BFFF]/20'
                : 'bg-white/95 backdrop-blur-md border border-[#00BFFF]/30 shadow-lg'
            }
          `}
          style={{ top: scrolled ? 'calc(76px + 12px)' : '76px' }}
        >
          <div className="px-4 py-4 space-y-2">
            {/* Navigation Links */}
            {primaryLinks.map(({ to, label }) => (
              <Link key={label} to={to} onClick={handleMobileNavigate}>
                <button
                  className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-colors duration-150 font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wider ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-slate-800 hover:text-[#00BFFF]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#00BFFF]'
                  }`}
                >
                  {label}
                </button>
              </Link>
            ))}

            {/* Profile Section for authenticated users */}
            {isAuthenticated && (
              <div className="pt-2 mt-2 border-t border-[#00BFFF]/20">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="w-10 h-10 ring-2 ring-[#00BFFF]/50">
                    {globalProfileImage || profileImage ? (
                      <AvatarImage
                        src={globalProfileImage || profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-800">
                        <img
                          src="https://i.ibb.co/XZmv5M8X/profile.png"
                          width={40}
                          height={40}
                          alt="Profile"
                          className="rounded-full"
                        />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span
                    className={`text-sm font-mono truncate max-w-[180px] ${
                      theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                    }`}
                  >
                    {authenticationType === 'metamask' && address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : authenticationType === 'walletConnect' && wcAccount
                      ? `${wcAccount.slice(0, 6)}...${wcAccount.slice(-4)}`
                      : authenticationType === 'google'
                      ? user?.email || 'Google User'
                      : ''}
                  </span>
                </div>
                <Link to={`/profile`} onClick={handleMobileNavigate}>
                  <button
                    className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-colors duration-150 ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-slate-800 hover:text-[#00BFFF]'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#00BFFF]'
                    }`}
                  >
                    Manage Profile
                  </button>
                </Link>
                {authenticationType === 'metamask' ||
                authenticationType === 'walletConnect' ? (
                  <button
                    onClick={() => {
                      handleMobileNavigate();
                      disconnectWalletthis();
                    }}
                    className="block w-full text-left font-bold px-4 py-3 mt-2 rounded-xl text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleMobileNavigate();
                      disconnectEmail();
                    }}
                    className="block w-full text-left font-bold px-4 py-3 mt-2 rounded-xl text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Sign out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
