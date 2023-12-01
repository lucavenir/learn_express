import TweetDb from "../db/models/tweet";
import { TweetsResponse, QueryTweetsParams, RepliesParams } from "./models/queries-models";
const { min } = Math;

export default class QuriesService {
   public async queryTweets(params: QueryTweetsParams, userId: string): Promise<TweetsResponse> {
      const uId = params.userId || userId;
      const page = params.page ?? 0;
      const pageSize = min(params.pageSize ?? 10, 100);
      const request = { uId };

      const skipped = pageSize * page;
      const tweets = await TweetDb.find(request, null, {
         skip: skipped,
         limit: pageSize,
         sort: { createdAt: -1 }
      });
      const totalCount = await TweetDb.countDocuments(request);

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
}