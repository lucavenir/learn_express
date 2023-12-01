import { Tweet } from './tweet-models';

export interface QueryTweetsParams {
   userId?: string;
   pageSize?: number;
   page?: number;
}

export interface TweetsResponse {
   currentPage: number;
   count: number;
   totalCount: number;
   tweets: Tweet[];
}
