
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className={`w-full border-t transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-black border-gray-800' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
            }`}>
              StorageX
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              A decentralized storage solution powered by IPFS and blockchain technology. 
              Store your files securely and access them from anywhere in the world.
            </p>
          </div>

          <div>
            <h4 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className={`text-sm hover:underline ${
                    theme === 'dark' ? 'text-gray-300 hover:text-[#00BFFF]' : 'text-gray-600 hover:text-[#00BFFF]'
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`text-sm hover:underline ${
                    theme === 'dark' ? 'text-gray-300 hover:text-[#00BFFF]' : 'text-gray-600 hover:text-[#00BFFF]'
                  }`}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/signup" 
                  className={`text-sm hover:underline ${
                    theme === 'dark' ? 'text-gray-300 hover:text-[#00BFFF]' : 'text-gray-600 hover:text-[#00BFFF]'
                  }`}
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Technology
            </h4>
            <ul className="space-y-2">
              <li className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                IPFS Storage
              </li>
              <li className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Blockchain Integration
              </li>
              <li className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Web3 Connectivity
              </li>
            </ul>
          </div>
        </div>

        <div className={`mt-8 pt-8 border-t text-center ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            © 2024 StorageX. Built with React.js, IPFS, and Web3 technologies.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
