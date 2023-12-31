import { StatusCodes } from "http-status-codes";
import { Profile } from "../services/models/profile-models";
import ProfileService from "../services/profile-service";
import {
   Controller, Request, Response, Delete, Get, Post, OperationId, Path, Route, Security, Tags, Query,
} from "tsoa";
import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { LikesResponse } from "../services/models/queries-models";
import AuthenticatedUser from "../middleware/models/authenticated-user";
import QueriesService from "../services/queries-service";
import { Follow, FollowsResponse } from "../services/models/follow-model";
import FollowService from "../services/follow-service";

@Route("/api/v1/profile")
@Tags("profile")
export class ProfileController extends Controller {
   @Response(StatusCodes.OK)
   @Get("{userId}")
   @OperationId("getProfile")
   @Security("jwt")
   public async get(@Path() userId: string): Promise<Profile> {
      this.setStatus(StatusCodes.OK);
      const service = new ProfileService();
      return service.get(userId);
   }

   @Get("{userId}/picture")
   @OperationId("getProfilePicture")
   @Security("jwt")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.NOT_FOUND, "No picture found")
   public async getProfilePicture(@Path() userId: string, @Request() request: ExpressRequest): Promise<void> {
      const service = new ProfileService();
      const info = await service.getProfilePicture(userId);
      const response = request.res as ExpressResponse;
      return new Promise<void>((resolve, reject) => {
         response.sendFile(info.pictureName, info.options, (err) => {
            if (err) return reject();
            resolve();
         });
      });
   }

   /**
    * Retrieves reactions made by a user, with pagination.
    */
   @Get("/{userId}/likes")
   @OperationId("getLikes")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.UNAUTHORIZED, "Unauthorized")
   @Security("jwt")
   public getLikes(
      @Request() request: ExpressRequest,
      @Path() userId: string,
      @Query() pageSize?: number,
      @Query() page?: number,
   ): Promise<LikesResponse> {
      const user = request.user as AuthenticatedUser;
      const service = new QueriesService();
      return service.getLikes({
         userId: userId,
         page: page,
         pageSize: pageSize,
      }, user.id);
   }

   /**
    * allows a user to follow another user.
    */
   @Post("/{userId}/follow")
   @OperationId("followUser")
   @Security("jwt")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.BAD_REQUEST, "Bad Request")
   public async followUser(
      @Request() request: ExpressRequest,
      @Path() userId: string
   ): Promise<Follow> {
      const user = request.user as AuthenticatedUser;
      const followerId = user.id;
      const followingId = userId;
      const service = new FollowService();
      return service.followUser({ followerId, followingId });
   }

   /**
    * allows a user to unfollow another user.
    */
   @Delete("/{userId}/follow")
   @OperationId("unfollowUser")
   @Security("jwt")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.BAD_REQUEST, "Bad Request")
   public async unfollowUser(
      @Request() request: ExpressRequest,
      @Path() userId: string
   ): Promise<Follow> {
      const user = request.user as AuthenticatedUser;
      const followerId = user.id;
      const followingId = userId;
      const service = new FollowService();
      return service.unfollowUser({ followerId, followingId });
   }

   /**
    * Retrieves the list of users that the specified user is following.
    */
   @Get("/{userId}/following")
   @OperationId("getUserFollowing")
   @Security("jwt")
   @Response(StatusCodes.OK)
   public getUserFollowing(
      @Path() userId: string,
      @Query() pageSize?: number,
      @Query() page?: number
   ): Promise<FollowsResponse> {
      const service = new FollowService();
      return service.getFollowing({ userId, pageSize, page });
   }

   /**
    * Retrieves the list of users that are following the specified user.
    */
   @Get("/{userId}/followers")
   @OperationId("getUserFollowers")
   @Security("jwt")
   @Response(StatusCodes.OK)
   public getUserFollowers(
      @Path() userId: string,
      @Query() pageSize?: number,
      @Query() page?: number
   ): Promise<FollowsResponse> {
      const service = new FollowService();
      return service.getFollowers({ userId, pageSize, page });
   }
}
