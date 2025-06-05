import React, { useState } from 'react';
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
import { Riple } from 'react-loading-indicators';

const Login = () => {
  const { theme } = useTheme();
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const navigate = useNavigate();
  const [fetchloading, setFetchLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [seedPhrase, setSeedPhrase] = useState('');

  const handleLogin = async () => {
    try {
      if (!isConnected) {
        toast({
          title: 'Connect MetaMask First',
          description: 'Please connect your MetaMask wallet to continue.',
          variant: 'destructive',
          duration: 3000,
        });
        return;
      } else if (!seedPhrase) {
        toast({
          title: 'Seed Phrase Required',
          description: 'Please enter your mnemonic seed phrase.',
          variant: 'destructive',
          duration: 3000,
        });
        return;
      }
      setFetchLoading(true);
      const wallet = ethers.Wallet.fromPhrase(seedPhrase.trim());
      const publicAddress = wallet.address;
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_PORT_URL}/api/fetchUserProfile`,
        {
          address: publicAddress,
        }
      );

      if (response.data.success) {
        setFetchLoading(false);
        const val = response.data.profile.MetaMask
          ? `${response.data.profile.MetaMask.slice(
              0,
              6
            )}...${response.data.profile.MetaMask.slice(-4)}`
          : '';
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${val || 'User'}`,
        });
        navigate('/dashboard');
      } else {
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
  const disableButton = () => {
    if (!isConnected) {
      toast({
        title: 'Connect MetaMask First',
        description: 'Please connect your MetaMask wallet to continue.',
        variant: 'destructive',
        duration: 3000,
      });
    } else if (!seedPhrase) {
      toast({
        title: 'Seed Phrase Required',
        description: 'Please enter your mnemonic seed phrase.',
        variant: 'destructive',
        duration: 3000,
      });
    } else {
      return false;
    }
  };
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Sign in to your StorageX account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tooltip
                placement="top"
                title="Please enter the Mnemonic key words was generated during account creation"
                arrow
              >
                <span
                  style={{
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    placeSelf: 'flex-end',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    border: `1.5px solid #00BFFF`,
                    color: theme === 'dark' ? '#00BFFF' : '#00BFFF',
                    background: theme === 'dark' ? '#222' : '#fff',
                    fontWeight: 'bold',
                    fontSize: '15px',
                  }}
                  className="shadow transition-opacity duration-300 hover:opacity-50"
                >
                  i
                </span>
              </Tooltip>
              <TextField
                id="Name"
                label="Mnemonic Key"
                margin="dense"
                variant="outlined"
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                size="medium"
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
              <div>
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
                  } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={connectWallet}
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
              </div>
              <Button
                type="button"
                onClick={handleLogin}
                style={{
                  marginTop: '3rem',
                  height: '75px',
                  fontSize: '1.2rem',
                }}
                className={`w-full bg-black rounded-lg border transition-all duration-300 ease-in-out
                  hover:scale-105 hover:shadow-lg 
                  ${
                    theme === 'dark'
                      ? 'border-[#0091c2] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-black'
                      : 'border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white'
                  }
                  ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
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
