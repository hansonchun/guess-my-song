import React, { createContext, useState, useContext, ReactNode } from 'react';
import { GameSession } from '../models/GameSession';

interface GameSessionContextType {
  gameSession: GameSession;
  setGameSession: (session: GameSession) => void;
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

export const GameSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameSession, setGameSession] = useState<GameSession>({
    id: '',
    createdAt: '',
    hostId: '',
    inviteLink: '',
    users: [],
    playlistId: '',
    playlistName: '',
    status: '',
    currentSongToGuess: ''
  });

  return (
    <GameSessionContext.Provider value={{ gameSession, setGameSession }}>
      {children}
    </GameSessionContext.Provider>
  );
};

export const useGameSession = (): GameSessionContextType => {
  const context = useContext(GameSessionContext);
  if (context === undefined) {
    throw new Error('useGameSession must be used within a GameSessionProvider');
  }
  return context;
};