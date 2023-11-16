import { StatusCodes } from "http-status-codes";
import { Request, Body, Controller, OperationId, Post, Delete, Route, Tags, Security } from "tsoa";
import { LoginParams, UserAndCredentials, UserCreationParams } from "../services/models/auth-models";
import { Request as ExpressRequest } from "express";
import AuthService from "../services/auth-service";

@Route("/api/v1/auth")
@Tags("Auth")
export class AuthController extends Controller {
   @Post("register")
   @OperationId("registerUser")
   public async register(@Body() requestBody: UserCreationParams): Promise<UserAndCredentials> {
      this.setStatus(StatusCodes.CREATED);
      const service = new AuthService();
      return service.register(requestBody);
   }

   // TODO: remove this dummy endpoint later, when we have proper endpoints that use authentication
   @Post("dummy")
   @OperationId("dummy")
   @Security("jwt")
   public async dummy(): Promise<void> {
      this.setStatus(StatusCodes.OK);
      return Promise.resolve();
   }

   @Post("login")
   @OperationId("loginUser")
   public async login(@Body() requestBody: LoginParams): Promise<UserAndCredentials> {
      this.setStatus(StatusCodes.OK);
      const service = new AuthService();
      return service.login(requestBody);
   }

   @Delete()
   @Security("jwt")
   @OperationId("logoutUser")
   public async logout(@Request() request: ExpressRequest): Promise<void> {
      this.setStatus(StatusCodes.NO_CONTENT);
      const jti = request.user!.jti;
      await new AuthService().logout(jti);
   }
}


