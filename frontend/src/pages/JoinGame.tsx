import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserProfileFetch from '../hooks/useUserProfileFetch';

const JoinGame: React.FC = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams<{ sessionId: string }>();
    const { userProfile, fetchUserProfile, isLoading, error: profileError } = useUserProfileFetch();
    const [joinError, setJoinError] = useState<string | null>(null);

    useEffect(() => {
        if (!userProfile && !isLoading && !profileError) {
            fetchUserProfile();
        }
    }, [userProfile, isLoading, profileError, fetchUserProfile]);

    useEffect(() => {
        const joinSession = async () => {
            if (userProfile && userProfile.id) {
                try {
                    await axios.post(`/api/game-sessions/${sessionId}/join`, {
                        userId: userProfile.id, 
                        displayName: userProfile.display_name || 'Anonymous'
                    });
                    navigate(`/game-setup/${sessionId}`);
                } catch (err) {
                    if (axios.isAxiosError(err)) {
                        setJoinError(err.response?.data?.error || 'An error occurred while joining the game.');
                    } else {
                        setJoinError('Failed to join the game session.');
                    }
                }
            }
        };

        if (sessionId && !isLoading && userProfile) {
            joinSession();
        }
    }, [sessionId, navigate, userProfile, isLoading]);

    if (isLoading) return <div>Loading user profile...</div>;
    if (profileError) return <div>Error fetching user profile: {profileError}</div>;
    if (joinError) return <div>Error: {joinError}</div>;

    return <div>Joining game session...</div>;
};

export default JoinGame;