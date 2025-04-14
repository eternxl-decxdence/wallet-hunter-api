import mongoose, { Schema, Document } from "mongoose";

export interface IServer extends Document {
  owner: mongoose.Schema.Types.ObjectId;
  serverName: string;
  setupSettings: _ISetupSettings; //null if serverName: 'local'
  stats: _IServerStats;
  lastActive: Date;
  startedAt: Date;
}

interface _IServerStats {
  addressesPerHour: number;
  requestsPerHour: number;
  totalAddresses: number;
  totalRequests: number;
}

interface _ISetupSettings {
  maxThreads: number;
  batchSize: number;
}

const ServerSetupSchema = new Schema<_ISetupSettings>({
  maxThreads: { type: Number, required: true },
  batchSize: { type: Number, required: true }
});

const ServerStatsSchema = new Schema<_IServerStats>({
  addressesPerHour: { type: Number, required: true },
  requestsPerHour: { type: Number, required: true },
  totalAddresses: { type: Number, required: true },
  totalRequests: { type: Number, required: true }
});

const ServerSchema = new Schema<IServer>({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  serverName: { type: String, required: true },
  setupSettings: { type: ServerSetupSchema },
  stats: { type: ServerStatsSchema },
  lastActive: { type: Date, default: Date.now },
  startedAt: { type: Date, default: Date.now }
});

export const Server = mongoose.model<IServer>("Server", ServerSchema);
