import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../db/models/user";
import Blacklist from "../db/models/blacklist";
import { LoginParams, RefreshParams, UserAndCredentials, UserCreationParams } from "./models/auth-models";
import { BadRequestError, UnauthenticatedError } from "../errors";
import AuthenticatedUser from "../middleware/models/authenticated-user";
import { UnauthorizedError } from "../errors/unauthorized-error";

export default class AuthService {
   public async register(params: UserCreationParams): Promise<UserAndCredentials> {
      const user = await User.create(params);

      const uuid = uuidv4();
      const token = user.createJwt(uuid);
      const refresh = user.createRefresh(uuid);

      return {
         user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
         },
         token: token,
         refresh: refresh,
      }
   }

   public async login(params: LoginParams): Promise<UserAndCredentials> {
      const user = await User.findOne({ email: params.email });
      if (!user) throw new UnauthenticatedError();

      const isPasswordOk = await user.comparePassword(params.password);
      if (!isPasswordOk) throw new UnauthenticatedError();

      const uuid = uuidv4();
      const token = user.createJwt(uuid);
      const refresh = user.createRefresh(uuid);

      return {
         user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
         },
         token: token,
         refresh: refresh,
      }
   }

   public async logout(jti: String): Promise<void> {
      await Blacklist.create({ object: jti, kind: 'jti' });
   }

   public async refresh(params: RefreshParams, user: AuthenticatedUser): Promise<UserAndCredentials> {
      const verified = jwt.verify(params.refreshToken, process.env.REFRESH_SECRET);
      const refresh = verified as {
         userId: string;
         email: string;
         iss: string;
         jti: string;
      };

      const shouldRefresh = refresh.email === user.email &&
         refresh.iss === process.env.JWT_ISSUER &&
         refresh.userId == user.id &&
         refresh.email === user.email &&
         refresh.iss === user.iss &&
         refresh.jti === user.jti;
      if (!shouldRefresh) throw new UnauthenticatedError();

      const refreshObject = { object: refresh.jti, };
      const isBlacklisted = await Blacklist.findOne({
         ...refreshObject,
         kind: 'jti',
      });
      if (isBlacklisted) throw new UnauthorizedError();
      await Blacklist.create(refreshObject);

      const matchingUser = await User.findById(refresh.userId);
      if (!matchingUser) throw new BadRequestError();

      const uuid = uuidv4();
      const newToken = matchingUser.createJwt(uuid);
      const newRefresh = matchingUser.createRefresh(uuid);

      return {
         user: {
            id: matchingUser.id,
            name: matchingUser.name,
            email: matchingUser.email,
            username: matchingUser.username,
         },
         token: newToken,
         refresh: newRefresh,
      };
   }
}
