import { GameUser } from "./GameUser";

export interface GameSession {
    id: string | undefined;
    createdAt: string;
    hostId: string;
    inviteLink: string;
    users: GameUser[]; // Assuming users is an array of user IDs
    playlistId: string;
    playlistName: string;
    status: string;
    currentSongToGuess: string;
  }