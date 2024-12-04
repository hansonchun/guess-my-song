export interface SpotifyTrack {
    id: string;
    name: string;
    duration_ms: number;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
    preview_url?: string; // Optional, not all tracks have a preview
    uri: string;
    popularity: number;
    track_number: number;
    explicit: boolean;
    external_urls: {
        spotify: string;
    };
    is_local: boolean;
    href: string;
    type: 'track';
}

export interface SpotifyArtist {
    id: string;
    name: string;
    href: string;
    type: 'artist';
    uri: string;
    external_urls: {
        spotify: string;
    };
}

export interface SpotifyAlbum {
    id: string;
    name: string;
    release_date: string;
    release_date_precision: 'year' | 'month' | 'day';
    total_tracks: number;
    href: string;
    type: 'album';
    uri: string;
    images: SpotifyImage[];
    external_urls: {
        spotify: string;
    };
    album_type: 'album' | 'single' | 'compilation';
    artists: SpotifyArtist[];
}

export interface SpotifyImage {
    height: number;
    url: string;
    width: number;
}