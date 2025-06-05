import React, { createContext, useContext, useState } from 'react';

interface User {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  signup: (email: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string): Promise<boolean> => {
    // Simulate API call - replace with actual authentication logic
    if (email) {
      setUser({ email, id: Date.now().toString() });
      return true;
    }
    return false;
  };

  const signup = async (email: string): Promise<boolean> => {
    // Simulate API call - replace with actual registration logic
    if (email) {
      setUser({ email, id: Date.now().toString() });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
