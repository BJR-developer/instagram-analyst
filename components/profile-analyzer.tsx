'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileStats {
  username: string;
  fullName: string;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  avgLikes: number;
  avgComments: number;
}

interface ProfileAnalyzerProps {
  data: ProfileStats;
}

export default function ProfileAnalyzer({ data }: ProfileAnalyzerProps) {
  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.followers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Following</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.following.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.posts.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.engagement.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Average Likes</p>
            <p className="text-2xl font-bold">{data.avgLikes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Average Comments</p>
            <p className="text-2xl font-bold">{data.avgComments.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
