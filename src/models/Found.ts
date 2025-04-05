import mongoose, { Schema, Document } from "mongoose";

export interface IFound extends Document {
  finder: mongoose.Schema.Types.ObjectId;
  address: string;
  seedPhrase: string;
  balance: string;
}

const FoundSchema = new Schema<IFound>({
  finder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Server",
    required: true
  },
  address: { type: String, required: true },
  seedPhrase: { type: String, required: true },
  balance: { type: String, required: true }
});

export const Found = mongoose.model<IFound>("Found", FoundSchema);
