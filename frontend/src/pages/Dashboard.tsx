import React, { useEffect, useState } from 'react';
import { useUserProfile } from '../context/UserProfileContext';
import Logout from '../components/Logout';
import axios from 'axios';
import { SpotifyUserProfile } from '../models/UserProfile';
import { Button } from '@fluentui/react-components';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { userProfile, setUserProfile } = useUserProfile();
    const navigate = useNavigate();

    const [userGames, setUserGames] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!userProfile) {
                try {
                    const response = await axios.get<SpotifyUserProfile>('/api/users/current-user-profile', { withCredentials: true });
                    setUserProfile(response.data);
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    // Handle error, maybe redirect to login if unauthorized
                }
            }

            if (userProfile && userProfile.id) {
                try {
                    const response = await axios.get(`/api/users/${userProfile.id}/games`);
                    setUserGames(response.data);
                } catch (error) {
                    console.error('Failed to fetch player games:', error);
                    // Handle error here
                }
            }
        };

        fetchData();
    }, [userProfile, setUserProfile]);

    const handleCreatePlaylist = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post('/api/playlists/create', {
                name: 'Guess My Song',
                description: `Guess My Song Game - Hosted by ${userProfile?.display_name}`,
                hostId: userProfile?.id,
                hostName: userProfile?.display_name,
                public: false, // Adjust based on your game rules
                collaborative: true // Since others will add songs
            });

            if (response.data.playlist && response.data.sessionId) {
                // Navigate to game setup with session details
                navigate(`/game-setup/${response.data.sessionId}`, {
                    state: { playlistId: response.data.playlist.id }
                });
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            // Handle error (e.g., show user feedback)
        }
    };


    return (
        <div>
            <h1>Guess My Song</h1>
            <h2>{userProfile?.display_name}'s Dashboard</h2>
            <h2>Your Games</h2>
            <ul>
                {userGames.map(game => (
                    <li key={game.id}>
                        <Link to={game.status === 'waiting' ? `/game-setup/${game.id}` : `/game-play/${game.id}`}>
                            Game ID: {game.id}, Status: {game.status}
                        </Link>
                    </li>
                ))}
            </ul>
            <Button onClick={handleCreatePlaylist}>Create Playlist & Start Game</Button>
            <Logout />
        </div>
    );
};

export default Dashboard;