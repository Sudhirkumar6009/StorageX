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
import { useGoogleLogin } from '@react-oauth/google';
import { Riple } from 'react-loading-indicators';

const Login = () => {
  const { theme } = useTheme();
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [fetchloading, setFetchLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [seedPhrase, setSeedPhrase] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
  
        const userInfo = await userInfoResponse.json();
        const res = await fetch(`${import.meta.env.VITE_BACKEND_PORT_URL}/api/googleAccount`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userInfo.email }),
        });
  
        const data = await res.json();
        if (data.success) {
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
                                }`}
                                onClick={() => {googleLogin()}}
                                type="button"
                              >
                                <svg className="mr-1 w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                                Continue with Google
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
