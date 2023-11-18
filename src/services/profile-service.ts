import { InvalidMimeTypeError, PictureNotFoundError, UserProfileNotFoundError } from "../errors";
import ProfileDb from "../db/models/profile";
import { Profile, ProfilePictureInfo } from "./models/profile-models";
import { UploadedFile } from "express-fileupload";
import { computeUserPictureName, getProfilePicturePath, getProfileUploadsDir } from "../controllers/utils";
import { mkdir, stat, unlink } from "node:fs/promises";

export default class ProfileService {
   public async get(userId: string): Promise<Profile> {
      const profile = await ProfileDb.findOne({ userId });
      if (!profile) throw new UserProfileNotFoundError();

      const json = profile.toJSON();
      return json as Profile;
   }

   public async setInfo(userId: string, info: Profile): Promise<Profile> {
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

   public setProfilePicture(userId: string, req: { files: { photo: UploadedFile } }): Promise<void> {
      const picture = req.files.photo;
      if (picture.mimetype !== "image/jpeg") throw new InvalidMimeTypeError();

      const uploadDir = getProfileUploadsDir();
      const uploadPath = getProfilePicturePath(userId);

      return new Promise<void>(async (resolve, reject) => {
         try {
            await mkdir(uploadDir, { recursive: true });
            await picture.mv(uploadPath);
            resolve();
         } catch {
            reject();
         }
      });
   }

   public async getProfilePicture(userId: string): Promise<ProfilePictureInfo> {
      try {
         const photoPath = getProfilePicturePath(userId);
         const status = await stat(photoPath);

         const isFile = status.isFile();
         if (!isFile) throw new Error();

         const pictureName = computeUserPictureName(userId);
         const options = {
            root: getProfileUploadsDir(),
            dotfiles: "deny",
            headers: {
               "x-timestamp": Date.now(),
               "x-sent": true,
            },
         };

         return {
            pictureName,
            options,
         };
      } catch {
         throw new PictureNotFoundError();
      }
   }

   public async deleteProfilePicture(userId: string): Promise<void> {
      try {
         const photoPath = getProfilePicturePath(userId);
         await unlink(photoPath);
      } catch {
         throw new PictureNotFoundError();
      }
   }
}
