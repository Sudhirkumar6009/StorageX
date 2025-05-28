
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back to StorageX!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      <div className="w-full max-w-md p-6">
        <Card className={`${
          theme === 'dark' 
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <CardHeader className="text-center">
            <CardTitle className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
            }`}>
              Welcome Back
            </CardTitle>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Sign in to your StorageX account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label 
                  htmlFor="email"
                  className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300'
                  } ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label 
                  htmlFor="password"
                  className={theme === 'dark' ? 'text-white' : 'text-gray-900'}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-1 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300'
                  } ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full ${
                  theme === 'dark'
                    ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                    : 'bg-[#00BFFF] text-white hover:bg-[#0099CC]'
                }`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
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
    </div>
  );
};

export default Login;
