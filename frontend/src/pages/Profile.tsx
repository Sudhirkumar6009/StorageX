import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { User, Upload, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useProfile } from '../contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { OrbitProgress, Riple } from 'react-loading-indicators';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletConnect } from '../contexts/WalletConnectContext';

const AvatarComponent = React.memo(
  ({ profileImage }: { profileImage: string | null }) => (
    <div className="relative rounded-full p-2 m-8 bg-[#00BFFF]/10">
      <Avatar className="w-25 h-25 ring-1 ring-[#00BFFF] ring-offset-2 ring-offset-gray-900">
        {profileImage ? (
          <AvatarImage
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.currentTarget.src = '';
              toast({
                title: 'Error loading image',
                description: 'Could not load profile image',
                variant: 'destructive',
              });
            }}
          />
        ) : (
          <AvatarFallback className="bg-gray-800 dark:bg-gray-700">
            <User className="w-16 h-16 text-[#00BFFF]" />
          </AvatarFallback>
        )}
      </Avatar>
    </div>
  )
);

const Profile = () => {
  const { theme } = useTheme();
  const { address, isConnected } = useWeb3();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const {
    connectWalletConnect,
    disconnectWalletConnect,
    account: wcAccount,
    isConnected: wcIsConnected,
  } = useWalletConnect();
  const { isAuthenticated, authenticationType, user } = useAuth();
  const [fetchloading, setFetchLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState<String | null>(null);
  const { updateGlobalProfileImage } = useProfile();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_PORT_URL;

  const selectionAddress =
    authenticationType === 'metamask'
      ? address
      : authenticationType === 'google'
      ? user?.email
      : authenticationType === 'walletConnect'
      ? wcAccount
      : '';

  useEffect(() => {
    if (selectionAddress) {
      fetchProfileData();
    }
  }, [selectionAddress]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const fetchProfileData = async () => {
    setFetchLoading(true);
    try {
      let res;
      if (
        authenticationType === 'metamask' ||
        authenticationType === 'walletConnect'
      ) {
        if (
          !selectionAddress ||
          selectionAddress.length !== 42 ||
          !selectionAddress.startsWith('0x')
        ) {
          throw new Error('Invalid wallet address');
        }
        res = await fetch(`${backendUrl}/api/profile/show/${selectionAddress}`);
      } else if (authenticationType === 'google') {
        res = await fetch(
          `${backendUrl}/api/profile/show/google/${user?.email}`
        );
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      if (data.success) {
        console.log('Decrypted Profile Data:', data.data);
        setName(data.data.name || '');
        setEmail(data.data.email || '');
        if (data.data.profileImage) {
          setProfileImage(data.data.profileImage);
          updateGlobalProfileImage(data.data.profileImage);
        }
      } else {
        throw new Error(data.message || 'Failed to load profile');
      }
      setFetchLoading(false);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      toast({
        title: 'Error loading profile',
        description: err.message || 'Failed to load profile data',
        variant: 'destructive',
      });
      // Clear form data on error
      setName('');
      setEmail('');
      setProfileImage(null);
      updateGlobalProfileImage(null);
    }
  };

  const validateEmail = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
    setEmail(trimmed);
  };

  const handleUpdateProfile = async () => {
    setUpdatedProfile('Connecting...');
    setSavingLoading(true);
    try {
      let res;
      const formData = new FormData();
      if (authenticationType === 'metamask') {
        formData.append('name', name);
        formData.append('email', email);
        formData.append('walletAddress', selectionAddress);
        formData.append('profileImage', profileImage);
        res = await fetch(`${backendUrl}/api/profile/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            address: selectionAddress,
            profileImage,
          }),
        });
      } else if (authenticationType === 'walletConnect') {
        formData.append('name', name);
        formData.append('email', email);
        formData.append('walletAddress', selectionAddress);
        formData.append('profileImage', profileImage);
        res = await fetch(`${backendUrl}/api/profile/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            address: selectionAddress,
            profileImage,
          }),
        });
      } else if (authenticationType === 'google') {
        res = await fetch(`${backendUrl}/api/profile/google/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            profileImage,
          }),
        });
      }

      const data = await res.json();

      if (data.success) {
        setSavingLoading(false);
        setUpdatedProfile('✅ ' + data.message);
        // Update global profile image
        updateGlobalProfileImage(profileImage);
        toast({
          title: 'Profile Updated Successfully',
        });
        await fetchProfileData();
      } else {
      }
    } catch (err: any) {}
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectionAddress || '');
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Address copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target?.result as string);
      toast({
        title: 'Photo uploaded',
      });
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
          theme === 'dark' ? 'bg-black' : 'bg-white'
        }`}
      >
        <Card
          className={`max-w-sm w-full ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}
        >
          <CardContent className="pt-6 text-center">
            <p
              className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Authentication Failure. Login again !
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {name ? `Welcome, ${name}` : 'My Profile'}
          </h1>
          <p
            className={`mt-2 text-[12px] ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Your profile information is securely stored and used only to
            personalize your experience. We ensure that your data remains
            protected and is never shared without your consent.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className="text-center">
                <div className="flex justify-center">
                  <AvatarComponent profileImage={profileImage} />
                </div>

                <div>
                  <input
                    type="file"
                    id="profile-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() =>
                      document.getElementById('profile-upload')?.click()
                    }
                    variant="outline"
                    className={` ${
                      theme === 'dark'
                        ? 'border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-black'
                        : 'border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {profileImage ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details Section */}
          <div className="lg:col-span-2">
            <Card
              className={`${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                  }`}
                >
                  Confidential Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label
                    className={` pl-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }
                      `}
                  >
                    {authenticationType === 'metamask' ||
                    authenticationType === 'walletConnect'
                      ? 'Wallet Address'
                      : 'Email Address'}
                  </Label>
                  <div className="relative">
                    <Input
                      value={selectionAddress}
                      readOnly
                      className={`
                        mt-3 
                        cursor-not-allowed 
                        select-none 
                        opacity-100
                        focus:ring-0
                        focus-visible:ring-0
                        focus:outline-none
                        focus-visible:outline-none
                        hover:opacity-80
                        tracking-wider
                        font-semibold
                        ${
                          theme === 'dark'
                            ? 'bg-black border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-600'
                        }
                        border-gray-600
                        hover:border-gray-300
                        p-7
                      `}
                    />
                    <button
                      onClick={handleCopy}
                      className={`
                        absolute 
                        right-3 
                        top-1/2 
                        transform 
                        -translate-y-1/2
                        p-2
                        rounded-md
                        transition-colors
                        hover:bg-gray-100
                        dark:hover:bg-gray-800
                      `}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400 hover:text-[#00BFFF]" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <TextField
                    id="Name"
                    label="Enter Name"
                    margin="dense"
                    variant="outlined"
                    size="medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: '1px solid gray',
                        },
                        '&:hover fieldset': {
                          border: '1px solid white',
                        },
                        '&.Mui-focused fieldset': {
                          border: '2px solid #00BFFF',
                        },
                        input: {
                          color: theme === 'dark' ? '#FFFFFF' : '#000000', // Input text color
                          fontFamily: 'Inter, sans-serif', // Custom font family
                          fontSize: '1rem',
                          fontWeight: 400,
                          letterSpacing: '0.025em',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#fff', // Label color
                        fontFamily: 'Inter, sans-serif',
                        '&.Mui-focused': {
                          color: '#00BFFF', // Focused label color
                        },
                      },
                    }}
                  />

                  {fetchloading && (
                    <div
                      className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-40"
                      style={{ zIndex: 9999 }}
                    >
                      <div className="bg-white dark:bg-[#000] rounded-lg p-6 shadow-lg w-30 ring-[#00BFFF] ring-offset-1">
                        <Riple
                          color="#00bfff"
                          size="medium"
                          text=""
                          textColor=""
                        />
                      </div>
                    </div>
                  )}
                  <TextField
                    id="Email"
                    type="email"
                    label="Enter Email"
                    margin="dense"
                    variant="outlined"
                    size="medium"
                    value={email}
                    onChange={(e) => validateEmail(e.target.value)}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: '1px solid gray',
                        },
                        '&:hover fieldset': {
                          border: '1px solid white',
                        },
                        '&.Mui-focused fieldset': {
                          border: '2px solid #00BFFF',
                        },
                        input: {
                          color: theme === 'dark' ? '#FFFFFF' : '#000000', // Input text color
                          fontFamily: 'Inter, sans-serif', // Custom font family
                          fontSize: '1rem',
                          fontWeight: 400,
                          letterSpacing: '0.025em',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#fff', // Label color
                        fontFamily: 'Inter, sans-serif',
                        '&.Mui-focused': {
                          color: '#00BFFF', // Focused label color
                        },
                      },
                    }}
                  />
                </div>

                <div className="flex pt-4">
                  <Button
                    onClick={handleUpdateProfile}
                    className={`${
                      theme === 'dark'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
