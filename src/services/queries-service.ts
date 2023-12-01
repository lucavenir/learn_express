import TweetDb from "../db/models/tweet";
import { Tweet } from "./models/tweet-models";
import { TweetsResponse, QueryTweetsParams } from "./models/queries-models";
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
         currentPage: page,
         count: tweets.length,
         totalCount: totalCount,
         tweets: tweets.map((tweet) => tweet.toJson() as Tweet),
      };
   }
}