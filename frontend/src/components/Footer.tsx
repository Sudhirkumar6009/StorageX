import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
  const { isConnected } = useWeb3();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <footer
      className={`w-full border-t transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-black border-gray-800'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex-1 text-left flex p-6 sm:p-10 lg:p-20 gap-5 flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3
              className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
              }  font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide `}
            >
              StorageX
            </h3>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide `}
            >
              A decentralized storage solution powered by IPFS and blockchain
              technology. Store your files securely and access them from
              anywhere in the world.
            </p>
          </div>

          <div>
            <h4
              className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/Dashboard"
                      className={`text-sm hover:underline ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:text-[#00BFFF]'
                          : 'text-gray-600 hover:text-[#00BFFF]'
                      } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
                    >
                      <button
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      >
                        Dashboard
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Profile"
                      className={`text-sm hover:underline ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:text-[#00BFFF]'
                          : 'text-gray-600 hover:text-[#00BFFF]'
                      } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
                    >
                      <button
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      >
                        Profile
                      </button>
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/signup"
                      className={`text-sm hover:underline ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:text-[#00BFFF]'
                          : 'text-gray-600 hover:text-[#00BFFF]'
                      } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
                    >
                      <button
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      >
                        Join Now
                      </button>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4
              className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
            >
              Technology
            </h4>
            <ul className="space-y-2">
              <li
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
              >
                Filebase Storage
              </li>
              <li
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
              >
                Blockchain Wallet Integration
              </li>
              <li
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
              >
                Web3 Connectivity
              </li>
              <li
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
              >
                MongoDB Atlas metadata Management
              </li>
              <li
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
              >
                Google Registration for Web 2.0 users
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`mt-8 pt-8 border-t text-center ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}
        >
          <p
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
          >
            © 2024 StorageX. Built with React.js, IPFS, and Web3 technologies.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
