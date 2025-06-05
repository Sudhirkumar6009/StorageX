import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import Tooltip from '@mui/material/Tooltip';
import { useWeb3 } from '../contexts/Web3Context';
import {
  createCustomWallet,
  storePublicAddress,
} from '../Utils/AccountContext.js';

const Signup = () => {
  const { theme } = useTheme();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { address, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [walletInfo, setWalletInfo] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
  });
  const [showconnected, setShowConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setShowConnected(true);
    }
  }, [isConnected]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    return Object.keys(newErrors).length === 0;
  };

  const sendToast = () => {
    toast({
      title: 'Connect MetaMask First',
      description: 'Please connect your MetaMask wallet to continue.',
      variant: 'destructive',
      duration: 3000,
    });
  };
  const handleCreateWallet = async () => {
    if (!isConnected) {
      sendToast();
      return;
    }

    try {
      const wallet = createCustomWallet();
      const response = await storePublicAddress(formData.email, {
        public: wallet.address,
        MetaMask: address,
      });

      if (!response.success && response.exists) {
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
      } else if (response.success) {
        setWalletInfo(wallet);
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await signup(formData.email);
      if (success) {
        toast({
          title: 'Account created successfully',
          description: 'Welcome to StorageX!',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Signup failed',
          description: 'Unable to create account',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during signup',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Create your decentralized storage account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Label
                    htmlFor="email"
                    className={`flex items-center gap-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{ marginBottom: 0 }}
                  >
                    Email
                    <em
                      style={{
                        fontSize: '10px',
                        paddingLeft: '0.2rem',
                        letterSpacing: '0.03rem',
                        fontWeight: 'normal',
                        paddingTop: '0.1rem',
                      }}
                    >
                      Optional
                    </em>
                  </Label>
                  <div className="flex-1" />
                  <Tooltip
                    placement="top"
                    title="Providing Updates and notifications through email"
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
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  style={{
                    fontWeight: '600',
                    letterSpacing: '0.05rem',
                    height: '50px',
                    marginTop: '0.8rem',
                  }}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={`mt-1${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
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
                onClick={isConnected ? handleCreateWallet : sendToast}
                disabled={isLoading || !isConnected}
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
                {isLoading
                  ? 'Creating account...'
                  : !isConnected
                  ? 'Connect MetaMask First'
                  : 'Create Account'}
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
      {walletInfo && (
        <div>
          <p>
            <strong>Address:</strong> {walletInfo.address}
          </p>
          <p>
            <strong>Private Key:</strong> {walletInfo.privateKey}
          </p>
          <p>
            <strong>Mnemonic Key:</strong> {walletInfo.mnemonic}
          </p>
          <p>
            Please store your private and mnemonic key securely. They will not
            be shown again.
          </p>
        </div>
      )}
    </div>
  );
};

export default Signup;
