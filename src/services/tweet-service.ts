import TweetDb from "../db/models/tweet";
import LikeDb from "../db/models/like";
import { TweetNotFoundError } from "../errors";
import { CreateTweetParams, Like, Tweet } from "./models/tweet-models";

export default class TweetService {
   public async createTweet(userId: string, params: CreateTweetParams): Promise<Tweet> {
      const replyId = params.replyId;
      if (replyId) {
         const reply = await TweetDb.findById(replyId);
         if (!reply) throw new TweetNotFoundError();
      }
      const quoteId = params.quoteId;
      if (quoteId) {
         const quote = await TweetDb.findById(quoteId);
         if (!quote) throw new TweetNotFoundError();
      }

      const tweet = await TweetDb.create({
         userId,
         text: params.text,
         replyId: params.replyId,
         quoteId: params.quoteId,
      });
      const json = tweet.toJson() as Tweet;
      return json;
   }

   public async like(userId: string, tweetId: string): Promise<Like> {
      const tweet = await TweetDb.findById(tweetId);
      if (!tweet) throw new TweetNotFoundError();

      const query = { userId, tweetId };
      const like = await LikeDb.findOneAndUpdate(
         query,
         { ...query },
         { upsert: true, new: true }
      );

      const json = like.toJson() as Like;
      return json;
   }
}
