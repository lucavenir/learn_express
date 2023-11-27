import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api-error";

export class LikeNotFound extends CustomApiError {
   constructor(message: string = "Like not found") {
      super(message, StatusCodes.NOT_FOUND);
      Object.setPrototypeOf(this, new.target.prototype);
   }
}