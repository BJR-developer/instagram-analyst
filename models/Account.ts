import mongoose from 'mongoose';

const followerHistorySchema = new mongoose.Schema({
  count: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  currentFollowers: { type: Number, required: true },
  followerHistory: [followerHistorySchema]
});

// Helper methods to calculate changes
accountSchema.methods.getFollowerChange = function(hours: number) {
  const targetTime = new Date();
  targetTime.setHours(targetTime.getHours() - hours);

  const history = this.followerHistory;
  if (history.length === 0) return 0;

  const oldestRecord = history
    .filter((record: any) => record.timestamp >= targetTime)
    .sort((a: any, b: any) => a.timestamp - b.timestamp)[0];

  if (!oldestRecord) return 0;
  return this.currentFollowers - oldestRecord.count;
};

accountSchema.methods.get24HourChange = function() {
  return this.getFollowerChange(24);
};

accountSchema.methods.get30DayChange = function() {
  return this.getFollowerChange(24 * 30);
};

// Delete old history entries (keep only last 31 days)
accountSchema.methods.cleanHistory = function() {
  const thirtyOneDaysAgo = new Date();
  thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

  this.followerHistory = this.followerHistory.filter(
    (record: any) => record.timestamp >= thirtyOneDaysAgo
  );
};

export default mongoose.models.Account || mongoose.model('Account', accountSchema);
