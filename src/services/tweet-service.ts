import TweetDb from "../db/models/tweet";
import { InvalidTweetIdError } from "../errors";
import { CreateTweetParams, Tweet } from "./models/tweet-models";

export default class TweetService {
   public async createTweet(userId: string, params: CreateTweetParams): Promise<Tweet> {
      const replyId = params.replyId;
      if (replyId) {
         const reply = TweetDb.findById(replyId);
         if (!reply) throw new InvalidTweetIdError();
      }
      const quoteId = params.quoteId;
      if (quoteId) {
         const quote = TweetDb.findById(quoteId);
         if (!quote) throw new InvalidTweetIdError();
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
}

