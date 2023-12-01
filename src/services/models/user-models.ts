import { User } from "./auth-models";

export interface SetUsernameParams {
   username: string;
}

export interface SetUsernameResponse {
   user: User;
}

export interface DeleteUserStatsResponse {
   likes: number;
   attachments: number;
   tweets: number;
   profiles: number;
   follows: number;
   users: number;
}
