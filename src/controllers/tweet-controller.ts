import { Request as ExpressRequest } from "express";
import { CreateTweetParams, Tweet } from "../services/models/tweet-models";
import { Controller, Request, OperationId, Post, Response, Security, Body, Route, Tags } from "tsoa";
import { StatusCodes } from "http-status-codes";
import AuthenticatedUser from "../middleware/models/authenticated-user";
import TweetService from "../services/tweet-service";

@Route("/api/v1/tweet")
@Tags("tweets")
export class TweetController extends Controller {
   /**
   * Creates a new tweet, allows you to reply to an existing tweet or simply retweet the original one.
   * For replies and retweets, the original post id must be specified.
   * For a new post, the original post id will be ignored.
   */
   @Post("")
   @OperationId("createTweet")
   @Security("jwt")
   @Response(StatusCodes.CREATED)
   @Response(StatusCodes.BAD_REQUEST, "invalid original tweet id")
   public async createTweet(
      @Request() request: ExpressRequest,
      @Body() body: CreateTweetParams
   ): Promise<Tweet> {
      const user = request.user as AuthenticatedUser;
      const service = new TweetService();
      return service.createTweet(user.id, body);
   }
}
