import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api-error";

export class UnauthorizedError extends CustomApiError {
   constructor(message: string = "Unauthorized") {
      super(message, StatusCodes.FORBIDDEN);
      Object.setPrototypeOf(this, new.target.prototype);
   }
}