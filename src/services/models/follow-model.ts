import { User } from "./auth-models";

export interface Follow {
   id: string,
   followerId: string;
   follower?: User;
   followingId: string;
   following?: User;
   createdAt: Date;
   updatedAt: Date;
}

export interface FollowUnfollowParams {
   followerId: string;
   followingId: string;
}
