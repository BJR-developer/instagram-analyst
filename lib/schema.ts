import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  currentFollowers: { type: Number, required: true },
  userEmail: { type: String, required: true },
});

const followerHistorySchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  count: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    instagramAccounts: [
      {
        username: String,
        lastUpdated: Date,
        followerHistory: [
          {
            count: Number,
            timestamp: Date,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

export const Account =
  mongoose.models.Account || mongoose.model("Account", accountSchema);
export const FollowerHistory =
  mongoose.models.FollowerHistory ||
  mongoose.model("FollowerHistory", followerHistorySchema);
