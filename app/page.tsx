"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ProfileAnalyzer from "@/components/profile-analyzer";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
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

      setProfileData(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col p-8">
      <header className="flex items-center justify-between pb-6">
        <h1 className="text-3xl font-bold">Instagram Profile Analyzer</h1>
      </header>

      <div className="w-full max-w-xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Enter Instagram Username</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. memes"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="flex-1"
              />
              <Button onClick={handleAnalyze} disabled={loading || !username}>
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {profileData && <ProfileAnalyzer data={profileData} />}
      </div>
    </div>
  );
}
