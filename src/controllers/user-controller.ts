import { Request as ExpressRequest } from "express";
import { StatusCodes } from "http-status-codes";
import { SetUsernameParams, SetUsernameResponse } from "../services/models/user-models";
import { Body, Controller, Delete, OperationId, Post, Request, Response, Route, Security, Tags } from "tsoa";
import AuthenticatedUser from "../middleware/models/authenticated-user";
import UserService from "../services/user-service";
import ProfileService from "../services/profile-service";
import { Profile } from "../services/models/profile-models";
import { NoPictureUploadedError } from "../errors";

@Route("/api/v1/user")
@Tags("user")
export class UserController extends Controller {
   @Response(StatusCodes.OK)
   @Post("profile-info")
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
    * Set the username of the authenticated user.
    */
   @Post("/username")
   @OperationId("setUsername")
   @Response(StatusCodes.OK)
   @Response(StatusCodes.BAD_REQUEST, "Bad Request")
   @Security("jwt")
   public async setUsername(
      @Request() request: ExpressRequest,
      @Body() params: SetUsernameParams
   ): Promise<SetUsernameResponse> {
      const { id: userId } = request.user as AuthenticatedUser;

      return new UserService().setUsername(userId, params);
   }
}