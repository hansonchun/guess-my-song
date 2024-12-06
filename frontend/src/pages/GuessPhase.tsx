import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@fluentui/react-components';
import useGameSessionFetch from '../hooks/useGameSessionFetch';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useUserProfileFetch from '../hooks/useUserProfileFetch';

const GuessPhase: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile, fetchUserProfile } = useUserProfileFetch();
    const { gameSession, fetchGameSession, isLoading, error } = useGameSessionFetch();
    const { sessionId } = useParams<{ sessionId: string }>();
    const [songToGuess, setSongToGuess] = useState<string | null>(null);
    const [guess, setGuess] = useState<string>('');
    const [isGuessCorrect, setIsGuessCorrect] = useState<boolean | null>(null);
    const [isWaiting, setIsWaiting] = useState<boolean>(true);

    useEffect(() => {
        if (sessionId) {
            fetchGameSession(sessionId);
        }
        if (!userProfile) {
            fetchUserProfile();
        }
    }, [sessionId, fetchGameSession, userProfile, fetchUserProfile]);

    useEffect(() => {
        let ws: WebSocket | null = null;
        if (gameSession) {
            const port = 8080; 
            const url = `ws://localhost:${port}`;

            ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('WebSocket connected');
                ws?.send(JSON.stringify({ type: 'LISTEN_FOR_GAME', data: { gameSessionId: gameSession.id } }));
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log('Message from server:', message);
                if (message.type === 'SESSION_UPDATE') {
                    if (message.data.status === 'guessing') {
                        setSongToGuess(message.data.currentSongToGuess);
                        setIsWaiting(false);
                    } else if (message.data.status === 'waiting') {
                        setIsWaiting(true);
                        setSongToGuess(null);
                    }
                } else if (message.type === 'GAME_COMPLETED') {
                    // If the game is completed, navigate to the scoreboard immediately
                    navigate(`/scoreboard/${gameSession?.id}`);
                } else if (message.type === 'ERROR') {
                    console.error('WebSocket error:', message.message);
                }
            };

            ws.onclose = () => console.log('WebSocket disconnected');

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            return () => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            };
        }
    }, [gameSession, navigate]);

    const handleSubmitGuess = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const guessResponse = await axios.post(`/api/game/${gameSession?.id}/guess`, {
                userId: userProfile?.id,
                guessSongId: guess
            });

            const { guessedCorrectly } = guessResponse.data;

            setIsGuessCorrect(guessedCorrectly);

            // No need for setTimeout and navigation here, as the WebSocket will handle the navigation
        } catch (error) {
            console.error('Error making guess:', error);
        }
    };

    const renderSongOptions = useCallback(() => {
        if (isLoading) return <p>Loading songs...</p>;
        if (error) return <p>Error loading songs: {error}</p>;
        if (gameSession?.addedSongs) {
            return gameSession.addedSongs.map((song, index) => (
                <div key={song} onClick={() => setGuess(song)}>
                    {song}
                </div>
            ));
        }
        return null;
    }, [gameSession, isLoading, error]);
    
    return (
        <div>
            <h1>{isWaiting ? "Waiting for Others" : "Guess Phase"}</h1>
            {isWaiting ? (
                <p>Waiting for all players to pick their song...</p>
            ) : (
                <>
                    {renderSongOptions()}
                    <form onSubmit={handleSubmitGuess}>
                        <input 
                            type="text" 
                            value={guess} 
                            onChange={(e) => setGuess(e.target.value)} 
                            placeholder="Enter your guess..." 
                        />
                        <Button type="submit">Submit Guess</Button>
                    </form>
                    {isGuessCorrect !== null && (
                        <p>{isGuessCorrect ? 'Correct!' : 'Incorrect, try again!'}</p>
                    )}
                </>
            )}
        </div>
    );
};

export default GuessPhase;