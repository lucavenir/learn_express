import { Schema, Types, Document, model } from "mongoose";

const LikeSchema = new Schema(
   {
      userId: {
         type: Types.ObjectId,
         ref: "User",
         required: [true, "Please provider a user id"],
      },
      tweetId: {
         type: Types.ObjectId,
         ref: "Tweet",
         required: [true, "Please provider a post id"],
      },
   },
   { timestamps: true }
);

LikeSchema.methods.toJson = function () {
   return {
      id: this._id,
      userId: this.userId,
      tweetId: this.tweetId,
   }
};

interface LikeDocument extends Document {
   userId: Types.ObjectId;
   tweetId: Types.ObjectId;
   toJson: () => any;
}

export default model<LikeDocument>("Like", LikeSchema);
