import TweetDb from "../db/models/tweet";
import LikeDb from "../db/models/like";
import AttachmentDb from "../db/models/attachment";
import { mkdir, stat, unlink } from "node:fs/promises";
import { AttachmentNotFoundError, InternalServerError, InvalidMimeTypeError, LikeNotFound, NoPictureUploadedError, TweetNotFoundError } from "../errors";
import { Attachment, CreateTweetParams, Like, Tweet, TweetAttachmentInfo } from "./models/tweet-models";
import { UploadedFile } from "express-fileupload";
import { computePictureName, getAttachmentPath, getRootAttachmentsUploadsDir } from "../controllers/utils";

export default class TweetService {
   public async createTweet(userId: string, params: CreateTweetParams): Promise<Tweet> {
      const replyId = params.replyId;
      if (replyId) {
         const reply = await TweetDb.findById(replyId);
         if (!reply) throw new TweetNotFoundError();
      }
      const quoteId = params.quoteId;
      if (quoteId) {
         const quote = await TweetDb.findById(quoteId);
         if (!quote) throw new TweetNotFoundError();
      }

      const tweet = await TweetDb.create({
         userId,
         text: params.text,
         replyId: params.replyId,
         quoteId: params.quoteId,
      });
      const json = tweet.toJson() as Tweet;
      return json;
   }

   public async like(userId: string, tweetId: string): Promise<Like> {
      const tweet = await TweetDb.findById(tweetId);
      if (!tweet) throw new TweetNotFoundError();

      const query = { userId, tweetId };
      const like = await LikeDb.findOneAndUpdate(
         query,
         { ...query },
         { upsert: true, new: true }
      );

      const json = like.toJson() as Like;
      return json;
   }

   public async unlike(userId: string, tweetId: string): Promise<Like> {
      const like = await LikeDb.findOneAndDelete({ userId, tweetId });
      if (!like) throw new LikeNotFound();

      return like.toJson() as Like;
   }

   public async attachToTweet(userId: string, tweetId: string, req: { files: { photo: UploadedFile } }): Promise<Attachment> {
      const tweet = await TweetDb.findOne({ _id: tweetId, userId: userId })
         .where("quoteId")
         .equals(null)
         .where("attachmentId")
         .equals(null);
      if (!tweet) throw new TweetNotFoundError();

      if (!req.files || Object.keys(req.files).length === 0) throw new NoPictureUploadedError();

      const { photo } = req.files as unknown as { photo: UploadedFile };
      if (photo.mimetype !== "image/jpeg") throw new InvalidMimeTypeError();

      const attachment = await AttachmentDb.create({ userId, tweetId, mimeType: photo.mimetype });

      const id = attachment._id;
      const uploadRoot = getRootAttachmentsUploadsDir();
      const uploadPath = getAttachmentPath(id);
      try {
         await mkdir(uploadRoot, { recursive: true });
         await photo.mv(uploadPath);
         tweet.attachmentId = id;
         await tweet.save();
         return attachment.toJson() as Attachment;
      }
      catch (err) {
         await AttachmentDb.findByIdAndDelete(id);
         throw new InternalServerError();
      }
   }

   public async getTweetAttachment(tweetId: string): Promise<TweetAttachmentInfo> {
      const tweet = await TweetDb.findOne({ _id: tweetId }).where("attachmentId").ne(null);
      if (!tweet) throw new TweetNotFoundError();

      const attachment = await AttachmentDb.findOne({ _id: tweet.attachmentId });
      if (!attachment) throw new AttachmentNotFoundError();

      try {
         const id = attachment.id;

         const picturePath = getAttachmentPath(id);
         const status = await stat(picturePath);
         if (!status.isFile()) throw new Error(); // ...?

         const pictureName = computePictureName("attachmentId");
         const options = {
            root: getRootAttachmentsUploadsDir(),
            dotfiles: "deny",
            "headers": {
               "x-timestamp": Date.now(),
               "x-sent": true,
            }
         };

         return { pictureName, options }
      } catch {
         throw new AttachmentNotFoundError();
      }
   }

   public async deleteTweet(userId: string, tweetId: string): Promise<Tweet> {
      const tweet = await TweetDb.findOne({ _id: tweetId, userId: userId });
      if (!tweet) throw new TweetNotFoundError();

      await TweetDb.deleteMany({
         quoteId: tweetId,
         text: null,
      });

      const attachment = tweet.attachmentId;
      if (attachment) {
         const path = getAttachmentPath(attachment.toString());
         try {
            await unlink(path);
         } catch (err) {
            // silently fail (ugh...)
         }
      }

      await TweetDb.findByIdAndDelete(tweetId);

      return tweet.toJson() as Tweet;
   }
}