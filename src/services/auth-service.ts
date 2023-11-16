import { v4 as uuidv4 } from "uuid";
import User from "../db/models/user";
import { LoginParams, UserAndCredentials, UserCreationParams } from "./models/auth-models";
import { UnauthenticatedError } from "../errors";

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
}