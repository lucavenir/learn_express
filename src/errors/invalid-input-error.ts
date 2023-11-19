import { StatusCodes } from "http-status-codes";
import { CustomApiError } from "./custom-api-error";

export class InvalidInputError extends CustomApiError {
   constructor(input: string, expected?: any) {
      let message = `Invalid input (received ${input}`;
      if (expected) message += `, expected: ${expected}`;
      message += ')';
      super(message, StatusCodes.BAD_REQUEST);
      Object.setPrototypeOf(this, new.target.prototype);
   }
}
