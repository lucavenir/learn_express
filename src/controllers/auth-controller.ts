import { StatusCodes } from "http-status-codes";
import { Request, Body, Controller, OperationId, Post, Route, Tags, Security } from "tsoa";
import { LoginParams, RefreshParams, UserAndCredentials, UserCreationParams } from "../services/models/auth-models";
import { Request as ExpressRequest } from "express";
import AuthService from "../services/auth-service";
import AuthenticatedUser from "../middleware/models/authenticated-user";

@Route("/api/v1/auth")
@Tags("auth")
export class AuthController extends Controller {
   @Post("register")
   @OperationId("registerUser")
   public async register(@Body() requestBody: UserCreationParams): Promise<UserAndCredentials> {
      this.setStatus(StatusCodes.CREATED);
      const service = new AuthService();
      return service.register(requestBody);
   }

   @Post("login")
   @OperationId("loginUser")
   public async login(@Body() requestBody: LoginParams): Promise<UserAndCredentials> {
      this.setStatus(StatusCodes.OK);
      const service = new AuthService();
      return service.login(requestBody);
   }

   @Post("refresh")
   @Security("refresh_jwt")
   @OperationId("refreshUser")
   public async refresh(@Request() request: ExpressRequest, @Body() requestBody: RefreshParams): Promise<UserAndCredentials> {
      this.setStatus(StatusCodes.OK);
      const user = request.user as AuthenticatedUser;
      const service = new AuthService();
      return service.refresh(requestBody, user);
   }

   @Post("logout")
   @Security("jwt")
   @OperationId("logoutUser")
   public async logout(@Request() request: ExpressRequest): Promise<void> {
      this.setStatus(StatusCodes.NO_CONTENT);
      const jti = request.user!.jti;
      await new AuthService().logout(jti);
   }
}
