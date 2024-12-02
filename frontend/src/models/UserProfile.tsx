export interface UserProfile {
}

export interface SpotifyUserProfile extends UserProfile {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
      filter_enabled: boolean;
      filter_locked: boolean;
    };
    external_urls: {
      spotify: string;
    };
    followers: {
      total: number;
    };
    href: string;
    id: string;
    images: Array<{
      height: number;
      url: string;
      width: number;
    }>;
    product: "free" | "premium" | "open"; // Assuming these are the only possible products
    type: string;
    uri: string;
}