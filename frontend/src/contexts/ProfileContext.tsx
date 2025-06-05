import React, { createContext, useContext, useState } from 'react';

interface ProfileContextType {
  globalProfileImage: string | null;
  updateGlobalProfileImage: (image: string | null) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalProfileImage, setGlobalProfileImage] = useState<string | null>(
    null
  );

  const updateGlobalProfileImage = (image: string | null) => {
    setGlobalProfileImage(image);
  };

  return (
    <ProfileContext.Provider
      value={{ globalProfileImage, updateGlobalProfileImage }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
