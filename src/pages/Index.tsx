
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Decentralized Storage',
      description: 'Store your files on IPFS network with permanent, distributed access',
      icon: '🌐'
    },
    {
      title: 'Blockchain Integration',
      description: 'Connect your Web3 wallet for secure blockchain interactions',
      icon: '⛓️'
    },
    {
      title: 'Secure & Private',
      description: 'Your files are encrypted and distributed across the network',
      icon: '🔒'
    },
    {
      title: 'Global Access',
      description: 'Access your files from anywhere in the world, anytime',
      icon: '🌍'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome to{' '}
            <span className={`${theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'}`}>
              StorageX
            </span>
          </h1>
          <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            The future of decentralized storage. Store, access, and manage your files 
            on the InterPlanetary File System with blockchain security.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button 
                  size="lg"
                  className={`text-lg px-8 py-3 ${
                    theme === 'dark'
                      ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                      : 'bg-[#00BFFF] text-white hover:bg-[#0099CC]'
                  }`}
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button 
                    size="lg"
                    className={`text-lg px-8 py-3 ${
                      theme === 'dark'
                        ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                        : 'bg-[#00BFFF] text-white hover:bg-[#0099CC]'
                    }`}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    variant="outline"
                    size="lg"
                    className={`text-lg px-8 py-3 ${
                      theme === 'dark'
                        ? 'border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-black'
                        : 'border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white'
                    }`}
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Why Choose StorageX?
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Experience the next generation of file storage with cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`text-center hover:scale-105 transition-transform duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-900 border-gray-800 hover:border-[#00BFFF]' 
                  : 'bg-white border-gray-200 hover:border-[#00BFFF]'
              }`}
            >
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle className={`text-xl ${
                  theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                }`}>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Section */}
      <div className={`py-20 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Powered by Modern Technology
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Built with the latest in decentralized technology stack
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`text-center p-8 rounded-lg ${
              theme === 'dark' ? 'bg-black' : 'bg-white'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
              }`}>
                IPFS Network
              </h3>
              <p className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                InterPlanetary File System for distributed, permanent storage
              </p>
            </div>

            <div className={`text-center p-8 rounded-lg ${
              theme === 'dark' ? 'bg-black' : 'bg-white'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
              }`}>
                Web3 Integration
              </h3>
              <p className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Connect your wallet and interact with blockchain technology
              </p>
            </div>

            <div className={`text-center p-8 rounded-lg ${
              theme === 'dark' ? 'bg-black' : 'bg-white'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
              }`}>
                React Frontend
              </h3>
              <p className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Modern, responsive interface built with React and Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`text-center p-12 rounded-2xl ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700' 
              : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
          }`}>
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to Get Started?
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join thousands of users who trust StorageX for their decentralized storage needs
            </p>
            <Link to="/signup">
              <Button 
                size="lg"
                className={`text-lg px-12 py-4 ${
                  theme === 'dark'
                    ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                    : 'bg-[#00BFFF] text-white hover:bg-[#0099CC]'
                }`}
              >
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
