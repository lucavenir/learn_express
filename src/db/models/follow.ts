import { Document, Schema, Types, model } from "mongoose";
import UserDb from "./user";

const FollowSchema = new Schema(
   {
      followerId: {
         type: Types.ObjectId,
         ref: "User",
         required: true,
      },
      followingId: {
         type: Types.ObjectId,
         ref: "User",
         required: true
      },
   },
   { timestamps: true }
);

FollowSchema.virtual("follower", {
   ref: "User",
   localField: "followerId",
   foreignField: "_id",
   justOne: true
});

FollowSchema.virtual("following", {
   ref: "User",
   localField: "followingId",
   foreignField: "_id",
   justOne: true
});

FollowSchema.methods.populateFollowerField = async function () {
   await this.populate("follower");
};

FollowSchema.methods.populateFollowingField = async function () {
   await this.populate("following");
};

FollowSchema.methods.toJson = function () {
   return {
      id: this._id,
      followerId: this.followerId,
      follower: this.follower,
      followingId: this.followingId,
      following: this.following,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
   };
};

interface FollowDocument extends Document {
   followerId: Types.ObjectId;
   followingId: Types.ObjectId;
   follower?: typeof UserDb;
   following?: typeof UserDb;
   populateFollowerField: () => Promise<void>;
   populateFollowingField: () => Promise<void>;
   toJSON: () => any;
}

export default model<FollowDocument>("Follow", FollowSchema);
