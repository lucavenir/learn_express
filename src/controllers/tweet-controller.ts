import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { Attachment, CreateTweetParams, Like, Tweet } from "../services/models/tweet-models";
import { Query, Controller, Request, OperationId, Post, Response, Security, Body, Route, Tags, Path, Delete, Patch, Get } from "tsoa";
import { StatusCodes } from "http-status-codes";
import AuthenticatedUser from "../middleware/models/authenticated-user";
import TweetService from "../services/tweet-service";
import { TweetsResponse } from "../services/models/queries-models";
import QueriesService from "../services/queries-service";

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
   public createTweet(
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
   public likeTweet(
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
   public unlikeTweet(
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
   public attachToTweet(@Path() tweetId: string, @Request() request: ExpressRequest): Promise<Attachment> {
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

   @Delete("/{tweetId}")
   @OperationId("deleteTweet")
   @Security("jwt")
   @Response(StatusCodes.OK, "Tweet deleted")
   @Response(StatusCodes.NOT_FOUND, "Tweet not found")
   public deleteTweet(@Path() tweetId: string, @Request() request: ExpressRequest): Promise<Tweet> {
      const user = request.user as AuthenticatedUser;
      const service = new TweetService();
      return service.deleteTweet(user.id, tweetId);
   }


   /**
    * Retrieves tweets with given parameters, with pagination.
    */
   @Get("")
   @OperationId("queryTweets")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.UNAUTHORIZED, "Unauthorized")
   @Security("jwt")
   public queryTweets(
      @Request() request: ExpressRequest,
      @Query() userId?: string,
      @Query() pageSize?: number,
      @Query() page?: number,
   ): Promise<TweetsResponse> {
      const user = request.user as AuthenticatedUser;
      const uId = userId ?? user.id;
      const service = new QueriesService();
      return service.queryTweets(
         {
            userId: uId,
            pageSize,
            page,
         },
         uId
      );
   }

   /**
   * Retrieves replies to a tweet with given parameters, with pagination.
   */
   @Get("/{tweetId}/replies")
   @OperationId("getReplies")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.UNAUTHORIZED, "Unauthorized")
   @Security("jwt")
   public getReplies(
      @Path() tweetId: string,
      @Query() pageSize?: number,
      @Query() page?: number,
   ): Promise<TweetsResponse> {
      const service = new QueriesService();
      return service.getReplies({
         tweetId: tweetId,
         page: page,
         pageSize: pageSize,
      });
   }
}
