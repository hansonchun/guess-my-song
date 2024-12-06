import React, { useEffect, useState } from 'react';
import Logout from '../components/Logout';
import axios from 'axios';
import { Button } from '@fluentui/react-components';
import { Link, useNavigate } from 'react-router-dom';
import useUserProfileFetch from '../hooks/useUserProfileFetch';

const Dashboard: React.FC = () => {
    const { userProfile, fetchUserProfile, isLoading, error } = useUserProfileFetch();
    const navigate = useNavigate();

    const [userGames, setUserGames] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!userProfile) {
                fetchUserProfile();
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
    }, [userProfile, navigate]);

    const handleCreatePlaylist = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            // Create the playlist first
            const playlistResponse = await axios.post('/api/playlists/create', {
                name: 'Guess My Song',
                description: `Guess My Song Game - Hosted by ${userProfile?.display_name}`,
                hostId: userProfile?.id,
                public: false, // Adjust based on your game rules
                collaborative: true // Since others will add songs
            });

            if (playlistResponse.data.playlist) {
                const { id: playlistId, name: playlistName } = playlistResponse.data.playlist;

                // Now create the game session with the playlist information
                const gameSessionResponse = await axios.post('/api/game-sessions/create', {
                    hostId: userProfile?.id,
                    hostName: userProfile?.display_name,
                    playlistId: playlistId,
                    playlistName: playlistName
                });

                if (gameSessionResponse.data.gameSessionId) {
                    navigate(`/game-setup/${gameSessionResponse.data.gameSessionId}`, {
                        state: { playlistId: playlistId }
                    })
                } else {
                    throw new Error('Game session creation failed');
                }

            } else {
                throw new Error('Playlist creation failed');
            }
        } catch (error) {
            console.error('Error creating playlist or game session:', error);
            // Handle error (e.g., show user feedback)
        }
    };

    const getGameLink = (game: any) => { // Use 'any' since the exact structure isn't known
        if (game.status === 'waiting') {
            return `/game-setup/${game.id}`;
        }
    
        // Ensure userProfile is defined and has an id
        const userId = userProfile?.id;
        if (!userId) {
            console.error('User ID not found');
            return '/some-error-page'; // or handle as needed
        }
    
        // Access the user by their ID, assuming users is an object with string keys
        const user = game.users[userId];
    
        if (game.status === 'complete') {
            return `/scoreboard/${game.id}`;
        }    

        if (user && user.addedTrackId) {
            // If the user has an addedTrackId, they've added a track, so go to guess phase
            return `/guess-phase/${game.id}`;
        } else {
            // Otherwise, they need to select a song
            return `/song-selection/${game.id}`;
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
                        <Link to={getGameLink(game)}>
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