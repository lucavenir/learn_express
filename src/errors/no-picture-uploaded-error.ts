import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api-error";

export class NoPictureUploadedError extends CustomApiError {
   constructor(message: string = "No picture uploaded") {
      super(message, StatusCodes.BAD_REQUEST);
      Object.setPrototypeOf(this, new.target.prototype);
   }
}
