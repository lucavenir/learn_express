import { Request as ExpressRequest } from "express";
import { CreateTweetParams, Like, Tweet } from "../services/models/tweet-models";
import { Controller, Request, OperationId, Post, Response, Security, Body, Route, Tags, Path } from "tsoa";
import { StatusCodes } from "http-status-codes";
import AuthenticatedUser from "../middleware/models/authenticated-user";
import TweetService from "../services/tweet-service";

@Route("/api/v1/tweets")
@Tags("tweets")
export class TweetController extends Controller {
   /**
   * Creates a new tweet, allows you to reply to an existing tweet or simply retweet the original one.
   * For replies and retweets, the original tweet id must be specified.
   * For a new tweet, the original tweet id will be ignored.
   */
   @Post("")
   @OperationId("createTweet")
   @Security("jwt")
   @Response(StatusCodes.CREATED)
   @Response(StatusCodes.NOT_FOUND, "original tweet not found")
   public async createTweet(
      @Request() request: ExpressRequest,
      @Body() body: CreateTweetParams
   ): Promise<Tweet> {
      const user = request.user as AuthenticatedUser;
      const service = new TweetService();
      return service.createTweet(user.id, body);
   }

   /**
   * Reacts to a tweet with a like.
   */
   @Post("/{tweetId}/like")
   @OperationId("likeTweet")
   @Security("jwt")
   @Response(StatusCodes.CREATED)
   @Response(StatusCodes.NOT_FOUND, "tweet not found")
   public async reactToPost(
      @Path() tweetId: string,
      @Request() request: ExpressRequest,
   ): Promise<Like> {
      const user = request.user as AuthenticatedUser;
      const service = new TweetService();
      return service.like(user.id, tweetId);
   }
}
