import { StatusCodes } from "http-status-codes";
import { Profile } from "../services/models/profile-models";
import ProfileService from "../services/profile-service";
import {
   Controller, Request, Body, Response, Delete, Get, Post, OperationId, Path, Route, Security, Tags,
} from "tsoa";
import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { NoPictureUploadedError } from "../errors";

@Route("/api/v1/profile")
@Tags("profile")
export class ProfileController extends Controller {
   @Response(StatusCodes.OK)
   @Get("info/{userId}")
   @OperationId("getProfile")
   @Security("jwt")
   public async get(@Path() userId: string): Promise<Profile> {
      this.setStatus(StatusCodes.OK);
      const service = new ProfileService();
      return service.get(userId);
   }

   @Response(StatusCodes.OK)
   @Post("info")
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

   @Get("picture/{userId}")
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
}
