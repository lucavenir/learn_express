import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

interface Error {
   message: string;
   name: string;
   statusCode?: number;
   code?: number;
}

export function handleErrors(err: Error, _req: Request, res: Response, _next: NextFunction) {
   let error = {
      code: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      message: err.message,
   };

   // user exists
   if (err.name === "MongoServerError" && err.code === 11000) {
      error.message = "User already exists!";
      error.code = StatusCodes.BAD_REQUEST;
   }

   return res
      .status(error.code)
      .json({ ...error });
}
