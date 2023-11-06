import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api-error";

export class UnauthenticatedError extends CustomApiError {
   constructor(message: string = "Invalid credentials") {
      super(message, StatusCodes.UNAUTHORIZED);
      Object.setPrototypeOf(this, new.target.prototype);
   }
}