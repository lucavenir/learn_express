import TweetDb from "../db/models/tweet";
import LikeDb from "../db/models/like";
import { TweetsResponse, QueryTweetsParams, RepliesParams, LikesResponse, GetUserLikesParams } from "./models/queries-models";
const { min } = Math;

export default class QueriesService {
   public async queryTweets(params: QueryTweetsParams, userId: string): Promise<TweetsResponse> {
      const uId = params.userId || userId;
      const page = params.page ?? 0;
      const pageSize = min(params.pageSize ?? 10, 100);

      const skipped = pageSize * page;
      const tweets = await TweetDb.find({ uId }, null, {
         skip: skipped,
         limit: pageSize,
         sort: { createdAt: -1 }
      });
      const totalCount = await TweetDb.countDocuments({ uId });

      return {
         totalCount: totalCount,
         count: tweets.length,
         tweets: tweets.map((tweet) => tweet.toJson()),
      };
   }

   public async getReplies(params: RepliesParams): Promise<TweetsResponse> {
      const pageSize = min(params.pageSize ?? 10, 100);
      const page = params.page ?? 0;

      const skipped = pageSize * page;
      const tweets = await TweetDb.find({ replyId: params.tweetId }, null, {
         skip: skipped,
         limit: pageSize
      });
      const totalCount = await TweetDb.countDocuments({ replyId: params.tweetId });

      return {
         totalCount: totalCount,
         count: tweets.length,
         tweets: tweets.map((tweet) => tweet.toJson()),
      }
   }

   public async getLikes(params: GetUserLikesParams, userId: string): Promise<LikesResponse> {
      const uId = params.userId ?? userId;
      const pageSize = min(params.pageSize ?? 10, 100);
      const page = params.page ?? 0;

      const skipped = pageSize * page;
      const likes = await LikeDb.find({ uId }, null, {
         skip: skipped,
         limit: pageSize,
         sort: { createdAt: -1 },
      });
      const totalCount = await LikeDb.countDocuments({ uId });

      return {
         totalCount: totalCount,
         count: likes.length,
         likes: likes.map((like) => like.toJson()),
      };
   }
}