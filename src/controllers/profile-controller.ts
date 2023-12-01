import { StatusCodes } from "http-status-codes";
import { Profile } from "../services/models/profile-models";
import ProfileService from "../services/profile-service";
import {
   Controller, Request, Body, Response, Delete, Get, Post, OperationId, Path, Route, Security, Tags, Query,
} from "tsoa";
import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { NoPictureUploadedError } from "../errors";
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

   @Response(StatusCodes.OK)
   @Post("")
   @OperationId("setProfile")
   @Security("jwt")
   public async set(@Request() request: ExpressRequest, @Body() body: Profile): Promise<Profile> {
      this.setStatus(StatusCodes.OK);
      const service = new ProfileService();
      const resource = request.user as { id: string };
      return service.setInfo(resource.id, body);
   }

   @Post("picture")
   @OperationId("setProfilePicture")
   @Security("jwt")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.BAD_REQUEST, "No picture uploaded")
   @Response(StatusCodes.BAD_REQUEST, "Invalid mime type")
   public async setProfilePicture(@Request() request: ExpressRequest): Promise<void> {
      const files = request.files;
      if (!files || Object.keys(files).length === 0) throw new NoPictureUploadedError();

      this.setStatus(StatusCodes.OK);
      const user = request.user as { id: string };
      const service = new ProfileService();
      return service.setProfilePicture(user.id, request as any);
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

   @Delete("picture")
   @OperationId("deleteProfilePicture")
   @Security("jwt")
   @Response(StatusCodes.NO_CONTENT)
   @Response(StatusCodes.NOT_FOUND, "No picture found")
   public deleteProfilePicture(@Request() request: ExpressRequest): Promise<void> {
      const user = request.user as { id: string };
      this.setStatus(StatusCodes.NO_CONTENT);
      const service = new ProfileService();
      return service.deleteProfilePicture(user.id);
   }

   /**
    * Retrieves reactions made by a user, with pagination.
    */
   @Get("/{userId}/like")
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
