import { Schema, Types, Document, model } from "mongoose";

const TweetSchema = new Schema(
   {
      userId: {
         type: Types.ObjectId,
         ref: "user",
         required: [true, "Please provide a user id"],
      },
      text: {
         type: String,
         maxlength: [500, "Your tweet cannot exceed 500 characters"],
         trim: true,
         required: false,
      },
      replyId: {
         type: Types.ObjectId,
         ref: "replyTo",
         required: false,
      },
      quoteId: {
         type: Types.ObjectId,
         ref: "quote",
         required: false,
      },
      attachmentId: {
         type: Types.ObjectId,
         ref: "attachment",
         required: false,
      },
   },
   { timestamps: true },
);

TweetSchema.methods.toJson = function (): any {
   return {
      id: this._id,
      userId: this.userId,
      text: this.text,
      replyId: this.replyId,
      quoteId: this.quoteId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      attachmentId: this.attachmentId,
   };
}

interface TweetDocument extends Document {
   userId: Types.ObjectId;
   text?: string;
   replyId: Types.ObjectId,
   quoteId: Types.ObjectId,
   attachmentId?: Types.ObjectId;
   toJson: () => any;
}

export default model<TweetDocument>("Tweet", TweetSchema);
