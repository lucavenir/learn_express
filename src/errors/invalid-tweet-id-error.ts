import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api-error";

export class TweetNotFoundError extends CustomApiError {
   constructor(message: string = "This tweet's id can't be found") {
      super(message, StatusCodes.NOT_FOUND);
      Object.setPrototypeOf(this, new.target.prototype);
   }
}
