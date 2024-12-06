import { useState, useCallback } from 'react';
import axios from 'axios';
import { GameSession } from '../models/GameSession';
import { GameUser } from '../models/GameUser';

const useGameSessionFetch = () => {
    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGameSession = useCallback(async (sessionId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/game-sessions/${sessionId}`);

            const { createdAt, hostId, inviteLink, playlistId, playlistName, status, users, currentSongToGuess, addedSongs } = response.data;

            // Fetch user profiles for each user ID
            const gameUsers = await Promise.all(Object.entries(users).map(async ([userId, user]) => {
                try {
                    const userResponse = await axios.get(`/api/users/user-profile/${userId}`);
                    return {
                        id: userId,
                        displayName: userResponse.data.display_name,
                        score: (user as any).score || 0,
                        addedTrackId: (user as any).addedTrackId || null
                    } as GameUser;
                } catch (error) {
                    console.error(`Failed to fetch profile for user ${userId}:`, error);
                    return {
                        id: userId,
                        displayName: 'Unknown User',
                        score: (user as any).score || 0,
                        addedTrackId: (user as any).addedTrackId || null
                    } as GameUser;
                }
            }));

            // Construct the GameSession object
            const session: GameSession = {
                id: sessionId,
                createdAt,
                hostId,
                inviteLink,
                users: gameUsers,
                playlistId,
                playlistName,
                status,
                currentSongToGuess,
                addedSongs
            };
            setGameSession(session);

        } catch (fetchError) {
            console.error('Failed to fetch game session:', fetchError);
            setError('Failed to fetch game session');
        } finally {
            setIsLoading(false);
        }
    }, [setGameSession]);

    return { gameSession, fetchGameSession, isLoading, error };
};

export default useGameSessionFetch;