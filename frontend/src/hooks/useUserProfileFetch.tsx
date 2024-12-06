import { useCallback, useState } from "react"
import { SpotifyUserProfile } from "../models/SpotifyUserProfile";
import axios from "axios";

const useUserProfileFetch = () => {
    const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get<SpotifyUserProfile>('/api/users/current-user-profile', { withCredentials: true });
            setUserProfile(response.data);
        }
        catch(fetchError) {
            console.error('Failed to fetch user profile:', fetchError);
            setError('Failed to fetch user profile');
        } finally {
            setIsLoading(false);
        }
    }, [setUserProfile]);

    return {userProfile, fetchUserProfile, isLoading, error};
}

export default useUserProfileFetch;