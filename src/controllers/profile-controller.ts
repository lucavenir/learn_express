import { StatusCodes } from "http-status-codes";
import { Profile } from "../services/models/profile-models";
import {
   Controller, Request, Body, Response, Get, OperationId, Path, Route, Security, Tags, Post
} from "tsoa";
import { Request as ExpressRequest } from "express";

import ProfileService from "../services/profile-service";

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
      return service.set(resource.id, body);
   }
}
