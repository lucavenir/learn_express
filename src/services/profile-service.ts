import { UserProfileNotFoundError } from "../errors";
import ProfileDb from "../db/models/profile";
import { Profile } from "./models/profile-models";

export default class ProfileService {
   public async get(userId: string): Promise<Profile> {
      const profile = await ProfileDb.findOne({ userId });
      if (!profile) throw new UserProfileNotFoundError();

      const json = profile.toJSON();
      return json as Profile;
   }

   public async set(userId: string, info: Profile): Promise<Profile> {
      const profile = await ProfileDb.findOneAndUpdate(
         { userId },
         {
            userId,
            bio: info.bio,
            location: info.location,
            website: info.website,
         },
         { upsert: true, new: true, runValidators: true }
      );

      const json = profile.toJSON();
      return json as Profile;
   }
}
