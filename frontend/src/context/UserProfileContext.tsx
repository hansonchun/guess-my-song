// src/context/UserProfileContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { SpotifyUserProfile } from '../models/UserProfile';

interface UserContextType {
  userProfile: SpotifyUserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<SpotifyUserProfile | null>>;
}

// Define the props for the UserProfileProvider, including children
interface UserProfileProviderProps {
  children: ReactNode;
}

const UserProfileContext = createContext<UserContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};