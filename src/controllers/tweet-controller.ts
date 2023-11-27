import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { Attachment, CreateTweetParams, Like, Tweet } from "../services/models/tweet-models";
import { Controller, Request, OperationId, Post, Response, Security, Body, Route, Tags, Path, Delete, Patch, Get } from "tsoa";
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
   public async likeTweet(
      @Path() tweetId: string,
      @Request() request: ExpressRequest,
   ): Promise<Like> {
      const user = request.user as AuthenticatedUser;
      const service = new TweetService();
      return service.like(user.id, tweetId);
   }

   /**
   * Removes a like from a tweet.
   */
   @Delete("/{tweetId}/like")
   @OperationId("unlikeTweet")
   @Security("jwt")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.NOT_FOUND, "reaction not found")
   public async unlikeTweet(
      @Path() tweetId: string,
      @Request() request: ExpressRequest,
   ): Promise<Like> {
      const user = request.user as AuthenticatedUser;
      const service = new TweetService();
      return service.unlike(user.id, tweetId);
   }

   @Patch("/{tweetId}")
   @OperationId("attachToTweet")
   @Security("jwt")
   @Response(StatusCodes.CREATED)
   @Response(StatusCodes.INTERNAL_SERVER_ERROR, "Could not attach picture to tweet")
   @Response(StatusCodes.NOT_FOUND, "Tweet not found")
   public async attachToTweet(@Path() tweetId: string, @Request() request: ExpressRequest): Promise<Attachment> {
      const user = request.user as AuthenticatedUser;
      const userId = user.id;
      const service = new TweetService();
      return service.attachToTweet(userId, tweetId, request as any);
   }

   @Get("/{tweetId}")
   @OperationId("getTweetAttachments")
   @Security("jwt")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.NOT_FOUND, "Picture not found")
   public async getAttachment(@Path() tweetId: string, @Request() request: ExpressRequest): Promise<void> {
      const service = new TweetService();
      const info = await service.getTweetAttachment(tweetId);
      const response = request.res as ExpressResponse;
      return new Promise<void>((resolve, reject) => {
         response.sendFile(info.pictureName, info.options, (err) => { if (err) return reject(err); return resolve(); });
      });
   }
}
