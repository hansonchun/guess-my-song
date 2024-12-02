import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const GameSetup: React.FC = () => {
    const navigate = useNavigate();

    const { sessionId } = useParams<{ sessionId: string }>();

    const [playlistId, setPlaylistId] = useState<string>('');
    const [inviteLink, setInviteLink] = useState<string>('');
    const [players, setPlayers] = useState<string[]>([]);

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
            setInviteLink(response.data.inviteLink);
            setPlayers(response.data.players || []);
            // temp
            setPlaylistId(response.data.playlistId);
        } catch (error) {
            console.error('Failed to fetch game session:', error);
            // Handle error appropriately, maybe show error message to user
        }
    };

    const startGame = async () => {
        try {
            await axios.post(`/api/game-session/${sessionId}/start`);
            navigate(`/game/${sessionId}`); // Navigate to the game page
        } catch (error) {
            console.error('Failed to start game:', error);
            // Handle error, maybe show user feedback
        }
    };

    return (
        <div>
            <h1>Game Setup</h1>
            <>
                <p>Session ID: {sessionId}</p>
                <p>Playlist ID: {playlistId}</p>
                <p>Invite Link: <a href={inviteLink}>{inviteLink}</a></p>
                <p>Players:</p>
                <ul>
                    {Object.entries(players).map(([playerId, player]) => (
                        <li key={playerId}>{playerId}</li>
                    ))}
                </ul>
                <button onClick={startGame}>Start Game</button>
            </>
            {/* Add more game setup options or UI elements here */}
        </div>
    );
};

export default GameSetup;