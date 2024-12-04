import React, { useState, useEffect } from 'react';
import { useGameSession } from '../context/GameSessionContext';
import { Button } from '@fluentui/react-components';
import useGameSessionFetch from '../hooks/useGameSessionFetch';
import { useParams } from 'react-router-dom';

const GuessPhase: React.FC = () => {
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
    }, [sessionId, fetchGameSession]);

    useEffect(() => {
        let ws: WebSocket | null = null;
        if (gameSession) {

            const port = 8080; // Assuming you have this in your .env file
            const url = `ws://localhost:${port}`; // Adjust this to match your server setup
            
            // Create a new WebSocket connection
            ws = new WebSocket(url);

            // Connection opened
            ws.onopen = () => {
                console.log('WebSocket connected');
                ws?.send(JSON.stringify({ type: 'LISTEN_FOR_GAME', data: { gameSessionId: gameSession.id } }));
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log('Message from server:', message);
                if (message.type === 'SESSION_UPDATE') {
                    //setGameSession(message.data);
                    if (message.data.status === 'guessing') {
                        setSongToGuess(message.data.currentSongToGuess);
                        setIsWaiting(false);
                    } else if (message.data.status === 'waiting') {
                        setIsWaiting(true);
                        setSongToGuess(null);
                    }
                } else if (message.type === 'ERROR') {
                    console.error('WebSocket error:', message.message);
                }
            };

            ws.onclose = () => console.log('WebSocket disconnected');

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                // Optionally, you can try to reconnect here or notify the user
            };
        }

        // Cleanup function to close WebSocket connection
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [gameSession, isLoading]);

    const handleSubmitGuess = (event: React.FormEvent) => {
        event.preventDefault();
        // Check if the guess matches the songToGuess
        if (guess === songToGuess) {
            setIsGuessCorrect(true);
        } else {
            setIsGuessCorrect(false);
        }
    };

    return (
        <div>
            <h1>{isWaiting ? "Waiting for Others" : "Guess Phase"}</h1>
            {isWaiting ? (
                <p>Waiting for all players to pick their song...</p>
            ) : (
                <>
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