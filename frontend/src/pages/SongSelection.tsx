import React, { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import { SpotifyTrack } from '../models/SpotifyTrack';
import { Button } from '@fluentui/react-components';
import { useNavigate, useParams } from 'react-router-dom';
import useGameSessionFetch from '../hooks/useGameSessionFetch'; // Adjust the path as necessary
import { useUserProfile } from '../context/UserProfileContext';

const SongSelection: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile } = useUserProfile();
    const { sessionId } = useParams<{ sessionId: string }>(); // Assuming you're using route parameters for session ID
    const { gameSession, fetchGameSession, isLoading, error } = useGameSessionFetch();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);

    // Fetch the game session when the component mounts or when sessionId changes
    useEffect(() => {
        if (sessionId) {
            fetchGameSession(sessionId);
        }
    }, [sessionId, fetchGameSession]);

    const handleSearch = async (event: ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);

        if (term.length > 2) { // Avoid searching for very short terms
            try {
                const response = await axios.get(`/api/search?query=${term}`);
                setSearchResults(response.data);
            } catch (error) {
                console.error('Search failed:', error);
                // Handle error (e.g., inform user search couldn't be performed)
            }
        } else {
            setSearchResults([]);
        }
    };

    const addSongToPlaylist = async (trackId: string) => {
        try {
            if (gameSession && gameSession.playlistId) {
                await axios.post(`/api/playlists/${gameSession.playlistId}/add`, {
                    trackId,
                    userId: userProfile?.id,
                    sessionId: gameSession.id
                });
                navigate(`/guess-phase/${gameSession.id}`);
                alert('Song added to playlist!');
            } else {
                console.error('Game session or playlist ID not available');
                // Handle error appropriately
            }
        } catch (error) {
            console.error('Failed to add song:', error);
            // Handle error (e.g., show error message)
        }
    };

    // Loading and error states
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!gameSession) return <div>Game session not found</div>;

    return (
        <div>
            <h1>Add Your Song</h1>
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search for songs to add..."
            />
            {searchResults.length > 0 && (
                <ul>
                    {searchResults.map((track, index) => (
                        <li key={track.id}>
                            {track.name} by {track.artists.map(artist => artist.name).join(', ')}
                            <Button onClick={() => addSongToPlaylist(track.id)}>Add to Game</Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SongSelection;