import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface User {
  email: string;
  id: string;
  loginMethod?: 'metamask' | 'google'; // Add login method tracking
}

interface AuthContextType {
  user: User | null;
  login: (email: string, method: 'metamask' | 'google') => Promise<boolean>;
  signup: (email: string, method: 'metamask' | 'google') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  authStatus: 'authenticated' | 'unauthenticated' | 'loading';
  authenticationType: 'metamask' | 'google' | null;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add Protected Route Component
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, authStatus } = useAuth();
  const location = useLocation();

  if (authStatus === 'loading') {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loginMethod, setLoginMethod] = useState<'metamask' | 'google' | null>(
    null
  );
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading');

  const checkAuthStatus = useCallback(async () => {
    if (user && loginMethod) {
      setAuthStatus('authenticated');
      return true;
    }
    setAuthStatus('unauthenticated');
    return false;
  }, [user, loginMethod]);

  useEffect(() => {
    checkAuthStatus();
  }, [user, loginMethod]);
  const login = async (
    email: string,
    method: 'metamask' | 'google'
  ): Promise<boolean> => {
    try {
      setAuthStatus('loading');
      // Store auth info in localStorage for persistence
      localStorage.setItem(
        'user',
        JSON.stringify({ email, loginMethod: method })
      );

      setUser({
        email,
        id: Date.now().toString(),
        loginMethod: method,
      });
      setLoginMethod(method);
      setAuthStatus('authenticated');
      return true;
    } catch (error) {
      setAuthStatus('unauthenticated');
      return false;
    }
  };

  const signup = async (
    email: string,
    method: 'metamask' | 'google'
  ): Promise<boolean> => {
    if (email) {
      setUser({
        email,
        id: Date.now().toString(),
        loginMethod: method,
      });
      setLoginMethod(method);
      return true;
    }
    return false;
  };
  // ...existing code...
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setLoginMethod(parsedUser.loginMethod);
      setAuthStatus('authenticated');
      // Check with backend for Google or MetaMask
      if (parsedUser.loginMethod === 'google') {
        fetch(`${import.meta.env.VITE_BACKEND_PORT_URL}/api/googleAccount`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: parsedUser.email }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) {
              logout();
            }
          })
          .catch(() => {
            logout();
          });
      } else if (parsedUser.loginMethod === 'metamask') {
        fetch(`${import.meta.env.VITE_BACKEND_PORT_URL}/api/fetchUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: parsedUser.email }), // or parsedUser.address if you store it
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) {
              logout();
            }
          })
          .catch(() => {
            logout();
          });
      }
    } else {
      setAuthStatus('unauthenticated');
    }
  }, []);

  const isAuthenticated = authStatus === 'authenticated';

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setLoginMethod(null);
    setAuthStatus('unauthenticated');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: authStatus === 'authenticated',
        authStatus,
        authenticationType: loginMethod,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
