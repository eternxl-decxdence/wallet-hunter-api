import mongoose, { Schema, Document } from "mongoose";

export interface IServer extends Document {
  owner: mongoose.Schema.Types.ObjectId;
  serverName: string;
  stats: _IServerStats;
  found: number;
  lastActive: Date;
}

interface _IServerStats {
  addressesPerHour: number;
  requestsPerHour: number;
  totalAddresses: number;
  totalRequests: number;
}

const ServerStatsSchema = new Schema<_IServerStats>({
  addressesPerHour: { type: Number, required: true },
  requestsPerHour: { type: Number, required: true },
  totalAddresses: { type: Number, required: true },
  totalRequests: { type: Number, required: true }
});

const ServerSchema = new Schema<IServer>({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  serverName: { type: String, required: true },
  stats: { type: ServerStatsSchema },
  found: { type: Number },
  lastActive: { type: Date }
});

export const Server = mongoose.model<IServer>("Server", ServerSchema);
