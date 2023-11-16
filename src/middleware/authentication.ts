import { Request } from "express";

import Blacklist from "../db/models/blacklist";
import AuthenticatedUser from "./models/authenticated-user";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { UnauthenticatedError } from "../errors";

export async function expressAuthentication(
   req: Request,
   securityName: string,
   _scopes?: string[]
): Promise<AuthenticatedUser> {
   const auth = req.headers.authorization;
   if (!auth) throw new UnauthenticatedError();

   const isBearer = auth.startsWith("Bearer ");
   if (!isBearer) throw new UnauthenticatedError();

   const token = auth.split(" ")[1];

   try {
      switch (securityName) {
         case 'jwt':
            return await jwtAuth(token);
         case 'refresh_jwt':
            return await jwtAuth(token, true);
         default:
            throw new UnauthenticatedError();
      }
   } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      if (error instanceof UnauthenticatedError) throw error;
      throw new UnauthenticatedError();
   }
}

async function jwtAuth(
   token: string,
   expiration: boolean = false,
): Promise<AuthenticatedUser> {
   const verified = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: expiration });
   const decoded = verified as {
      userId: string;
      email: string;
      iss: string;
      jti: string;
   };
   const jti = decoded.jti;

   const blacklisted = await Blacklist.findOne({
      object: jti,
      kind: "jti",
   });
   if (blacklisted) throw new UnauthorizedError();

   const user = {
      id: decoded.userId,
      email: decoded.email,
      iss: decoded.iss,
      jti: decoded.jti,
   }

   return user;
}
