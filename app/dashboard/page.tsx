"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AccountStats {
  username: string;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  avgLikes: number;
  avgComments: number;
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountStats[]>([]);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!username) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/instagram?username=${encodeURIComponent(username)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile data");
      }

      setAccounts((prev) => {
        // Check if account already exists
        if (prev.some((acc) => acc.username === data.username)) {
          return prev.map((acc) =>
            acc.username === data.username ? data : acc
          );
        }
        // Add new account if we have less than 6
        if (prev.length < 6) {
          return [...prev, data];
        }
        return prev;
      });
      setUsername("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Instagram Analytics Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track your Instagram accounts growth and engagement
          </p>
        </header>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Add Instagram Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Instagram username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="flex-1 max-w-md"
                  disabled={accounts.length >= 6}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !username || accounts.length >= 6}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {loading ? "Adding..." : "Add Account"}
                </Button>
              </div>
              {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
              {accounts.length >= 6 && (
                <p className="text-amber-500 mt-2 text-sm">
                  Maximum 6 accounts allowed
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="24h">24 Hours</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <Card
                  key={account.username}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>@{account.username}</span>
                      <span className="text-sm font-normal text-gray-500">
                        {new Date().toLocaleDateString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Followers
                        </p>
                        <p className="text-2xl font-bold">
                          {account.followers.toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            24h Change
                          </p>
                          <p className="text-lg font-semibold text-green-500">
                            +123
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            30d Growth
                          </p>
                          <p className="text-lg font-semibold text-green-500">
                            +1,234
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-gray-500">
                          Engagement Rate
                        </p>
                        <p className="text-lg font-semibold">
                          {account.engagement.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="24h">
            <Card>
              <CardHeader>
                <CardTitle>24 Hour Growth</CardTitle>
              </CardHeader>
              <CardContent>
                {/* We'll add a chart here later */}
                <p className="text-gray-500">
                  24-hour follower growth visualization coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="30d">
            <Card>
              <CardHeader>
                <CardTitle>30 Day Growth</CardTitle>
              </CardHeader>
              <CardContent>
                {/* We'll add a chart here later */}
                <p className="text-gray-500">
                  30-day follower growth visualization coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
