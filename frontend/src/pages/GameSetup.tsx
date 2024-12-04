import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGameSessionFetch from '../hooks/useGameSessionFetch';
import { Button } from '@fluentui/react-components';
import axios from 'axios';

const GameSetup: React.FC = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams<{ sessionId: string }>();
    const { gameSession, fetchGameSession, isLoading, error } = useGameSessionFetch();

    useEffect(() => {
        if (sessionId) {
            fetchGameSession(sessionId);
        }
    }, [sessionId, fetchGameSession]);

    const startGame = async () => {
        try {
            await axios.post(`/api/game-sessions/${sessionId}/start`);
            navigate(`/song-selection/${sessionId}`);
        } catch (error) {
            console.error('Failed to start game:', error);
            // Handle error
        }
    };

    if (isLoading) return <div>Loading game session...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!gameSession) return <div>No game session found.</div>;

    return (
        <div>
            <h1>Game Setup</h1>
            <p>Session ID: {sessionId}</p>
            <p>Invite Link: <a href={gameSession.inviteLink}>{gameSession.inviteLink}</a></p>
            <p>Players:</p>
            <ul>
                {gameSession.users.map(user => (
                    <li key={user.id}>{user.displayName} (Score: {user.score})</li>
                ))}
            </ul>
            <Button onClick={startGame}>Start Game</Button>
        </div>
    );
};

export default GameSetup;