import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useGameSessionFetch from '../hooks/useGameSessionFetch';

const Scoreboard: React.FC = () => {
    const { gameSession, fetchGameSession } = useGameSessionFetch();
    const { sessionId } = useParams<{ sessionId: string }>();

    useEffect(() => {
        if (sessionId) {
            fetchGameSession(sessionId);
        }
    }, [sessionId, fetchGameSession]);

    if (!gameSession) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Scoreboard</h1>
            <ul>
                {Object.entries(gameSession.users).map(([userId, userData]) => (
                    <li key={userId}>
                        User {userData.displayName}: Score - {userData.score}
                    </li>
                ))}
            </ul>
            {/* Add more details or features as needed */}
        </div>
    );
};

export default Scoreboard;