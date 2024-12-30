import { InstagramPost, InstagramUser } from "./type";

export function calculateEngagement(user: InstagramUser) {
  const posts = user.edge_owner_to_timeline_media.edges;
  if (!posts.length) return 0;

  const totalEngagement = posts.reduce((sum: number, post: InstagramPost) => {
    return (
      sum +
      post.node.edge_liked_by.count +
      post.node.edge_media_to_comment.count
    );
  }, 0);

  return (totalEngagement / posts.length / user.edge_followed_by.count) * 100;
}

export function calculateAvgLikes(user: InstagramUser) {
  const posts = user.edge_owner_to_timeline_media.edges;
  if (!posts.length) return 0;

  const totalLikes = posts.reduce((sum: number, post: InstagramPost) => {
    return sum + post.node.edge_liked_by.count;
  }, 0);

  return Math.round(totalLikes / posts.length);
}

export function calculateAvgComments(user: InstagramUser) {
  const posts = user.edge_owner_to_timeline_media.edges;
  if (!posts.length) return 0;

  const totalComments = posts.reduce((sum: number, post: InstagramPost) => {
    return sum + post.node.edge_media_to_comment.count;
  }, 0);

  return Math.round(totalComments / posts.length);
}
