import { Like, Tweet } from './tweet-models';

export interface QueryTweetsParams {
   userId?: string;
   pageSize?: number;
   page?: number;
}

export interface TweetsResponse {
   totalCount: number;
   count: number;
   tweets: Tweet[];
}

export interface RepliesParams {
   tweetId: string;
   pageSize?: number;
   page?: number;
}

export interface GetUserLikesParams {
   userId?: string;
   pageSize?: number;
   page?: number;
}

export interface LikesResponse {
   totalCount: number;
   count: number;
   likes: Like[];
}
