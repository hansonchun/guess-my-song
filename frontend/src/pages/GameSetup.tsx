import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { GameSession } from '../models/GameSession';
import { useGameSession } from '../context/GameSessionContext';
import { GameUser } from '../models/GameUser';
import { Button } from '@fluentui/react-components';

const GameSetup: React.FC = () => {
    const navigate = useNavigate();
    const { gameSession, setGameSession } = useGameSession();

    const { sessionId } = useParams<{ sessionId: string }>();

    useEffect(() => {
        // Extract session and playlist info from route state
        console.log('Session ID:', sessionId);
        if (sessionId) {
            fetchGameSession();
        }
    }, [sessionId]);

    const fetchGameSession = async () => {
        try {
            const response = await axios.get(`/api/game-sessions/${sessionId}`);

            const { createdAt, hostId, inviteLink, playlistId, playlistName, status, users } = response.data;

            // Fetch user profiles for each user ID
            const gameUsers = await Promise.all(Object.entries(users).map(async ([userId, user]) => {
                try {
                    const userResponse = await axios.get(`/api/users/user-profile/${userId}`);
                    return {
                        id: userId,
                        displayName: userResponse.data.display_name,
                        score: (user as any).score || 0
                    } as GameUser;
                } catch (error) {
                    console.error(`Failed to fetch profile for user ${userId}:`, error);
                    return {
                        id: userId,
                        displayName: 'Unknown User',
                        score: (user as any).score || 0
                    } as GameUser;
                }
            }));

            // Construct the GameSession object
            const session: GameSession = {
                createdAt,
                hostId,
                inviteLink,
                users: gameUsers,
                playlistId,
                playlistName,
                status
            };
            setGameSession(session);

        } catch (error) {
            console.error('Failed to fetch game session:', error);
            // Handle error appropriately, maybe show error message to user
        }
    };

    const startGame = async () => {
        try {
            console.log(gameSession);
            // await axios.post(`/api/game-session/${sessionId}/start`);
            // navigate(`/game/${sessionId}`); // Navigate to the game page
        } catch (error) {
            console.error('Failed to start game:', error);
            // Handle error, maybe show user feedback
        }
    };

    return (
        <div>
            <h1>Game Setup</h1>
            {gameSession && (
                <>
                    <p>Session ID: {sessionId}</p>
                    <p>Invite Link: <a href={gameSession.inviteLink}>{gameSession.inviteLink}</a></p>
                    <p>Players:</p>
                    <ul>
                        {gameSession.users.map(user => (
                            <li key={user.id}>{user.displayName} (Score: {user.score})</li>
                        ))}
                    </ul>
                    <Button onClick={startGame}>Start Game</Button>
                </>
            )}
            {!gameSession && <p>Loading game session...</p>}
            {/* Add more game setup options or UI elements here */}
        </div>
    );
};

export default GameSetup;