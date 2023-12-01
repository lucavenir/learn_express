import { unlink } from "node:fs/promises";
import { BadRequestError } from "../errors";
import UserDb from "../db/models/user";
import LikeDb from "../db/models/like";
import AttachmentDb from "../db/models/attachment";
import FollowDb from "../db/models/follow";
import TweetDb from "../db/models/tweet";
import ProfileDb from "../db/models/profile";
import { DeleteUserStatsResponse, SetUsernameParams, SetUsernameResponse } from "./models/user-models";
import { getAttachmentPath, getProfilePicturePath } from "../controllers/utils";

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

   public async deleteUser(userId: string): Promise<DeleteUserStatsResponse> {
      const { deletedCount: likesCount } = await LikeDb.deleteMany({ userId });

      const profilePicturePath = getProfilePicturePath(userId);
      try {
         await unlink(profilePicturePath);
      } catch (_) {
         // no picture was found but that's ok
      }

      const attachments = await AttachmentDb.find({ userId });
      for (const a of attachments) {
         const path = getAttachmentPath(a._id);
         try {
            await unlink(path);
         } catch (_) {
            // silenty fail (? thats bad tho)
         }
      }

      const { deletedCount: attachmentsCount } = await AttachmentDb.deleteMany({ userId });
      const { deletedCount: tweetsCount } = await TweetDb.deleteMany({ userId });
      const { deletedCount: profilesCount } = await ProfileDb.deleteOne({ userId });
      const { deletedCount: followsCount } = await FollowDb.deleteMany({ userId });
      const { deletedCount: usersCount } = await UserDb.deleteOne({ userId });

      return {
         attachments: attachmentsCount,
         follows: followsCount,
         tweets: tweetsCount,
         profiles: profilesCount,
         likes: likesCount,
         users: usersCount,
      }
   }
}
