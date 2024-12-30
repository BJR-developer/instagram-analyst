import { Account, FollowerHistory } from "../schema";

export async function getFollowerChange(accountId: string, hours: number) {
  const targetTime = new Date();
  targetTime.setHours(targetTime.getHours() - hours);

  const history = await FollowerHistory.find({
    accountId,
    timestamp: { $gte: targetTime },
  }).sort({ timestamp: 1 });

  if (history.length === 0) return 0;

  const currentFollowerData = await Account.findById(accountId);

  if (!currentFollowerData) return 0;

  return currentFollowerData.currentFollowers - history[0].count;
}

export const getAccountData = async (accountId: string) => {
  // Get follower history for charts
  const followerData = await FollowerHistory.find({
    accountId,
  }).sort({ timestamp: 1 });

  return {
    username: user.username,
    fullName: user.full_name,
    followers: user.edge_followed_by.count,
    following: user.edge_follow.count,
    posts: user.edge_owner_to_timeline_media.edges.length,
    followerHistory: followerData,
  };
};
