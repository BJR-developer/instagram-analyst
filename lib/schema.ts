import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  currentFollowers: { type: Number, required: true },
});

const followerHistorySchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  count: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const Account =
  mongoose.models.Account || mongoose.model("Account", accountSchema);
export const FollowerHistory =
  mongoose.models.FollowerHistory ||
  mongoose.model("FollowerHistory", followerHistorySchema);
