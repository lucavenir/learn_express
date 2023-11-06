import { StatusCodes } from "http-status-codes";
import { Body, Controller, OperationId, Post, Route, Tags, Security } from "tsoa";
import { UserAndCredentials, UserCreationParams } from "../services/models/auth-models";
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
}
