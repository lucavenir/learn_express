import { BadRequestError } from "../errors";
import UserDb from "../db/models/user";
import { SetUsernameParams, SetUsernameResponse } from "./models/user-models";

export default class UserService {
   public async setUsername(userId: string, params: SetUsernameParams): Promise<SetUsernameResponse> {
      const user = await UserDb.findByIdAndUpdate(
         userId,
         { username: params.username },
         { new: true, runValidators: true, select: "-password" }
      );

      if (!user) throw new BadRequestError();

      return { user: user.toJson() };
   }
}