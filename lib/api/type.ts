export interface InstagramPost {
  node: {
    edge_liked_by: {
      count: number;
    };
    edge_media_to_comment: {
      count: number;
    };
  };
}

export interface InstagramUser {
  edge_owner_to_timeline_media: {
    edges: InstagramPost[];
  };
  edge_followed_by: {
    count: number;
  };
  edge_follow: {
    count: number;
  };
  username: string;
  full_name: string;
}

export interface InstagramData {
  data: {
    user: InstagramUser;
  };
}
