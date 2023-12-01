import { User } from "./auth-models";

export interface SetUsernameParams {
   username: string;
}

export interface SetUsernameResponse {
   user: User;
}
