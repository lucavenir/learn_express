import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api-error";

export class InvalidTweetIdError extends CustomApiError {
   constructor(message: string = "Original tweet id is invalid") {
      super(message, StatusCodes.NOT_FOUND);
      Object.setPrototypeOf(this, new.target.prototype);
   }
}
