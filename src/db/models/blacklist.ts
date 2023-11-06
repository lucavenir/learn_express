import { Document, model, Schema } from "mongoose";

export interface BlacklistDocument extends Document {
   object: string;
   kind: BlacklistKind;
}

enum BlacklistKind {
   jti = "jti",
   refresh = "refresh",
   token = "token",
}

const BlacklistSchema = new Schema(
   {
      object: {
         type: String,
         required: [true, "Please provide an object"],
         unique: true,
      },
      kind: {
         type: String,
         enum: ["jti", "refresh", "token"],
         default: "jti",
         required: [true, "Please provide a kind"],
      },
   },
   { timestamps: true },
);

export default model<BlacklistDocument>("Blacklist", BlacklistSchema);
