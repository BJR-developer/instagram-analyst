import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Account, FollowerHistory } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { InstagramData } from "@/lib/api/type";
import { getAccountData, getFollowerChange } from "@/lib/api/get.actions";
import {
  calculateAvgComments,
  calculateAvgLikes,
  calculateEngagement,
} from "@/lib/api/helpers.actions";

const INSTAGRAM_API_URL =
  "https://www.instagram.com/api/v1/users/web_profile_info/";

export async function GET() {
  await connectDB();

  const currentUser = await getServerSession();

  if (!currentUser) {
    return NextResponse.json({ error: "User not logged in" }, { status: 401 });
  }

  const loggedUser = currentUser?.user;

  if (!loggedUser) {
    return NextResponse.json({ error: "User not logged in" }, { status: 401 });
  }
  const accounts = await Account.find({
    userEmail: loggedUser?.email,
  });

  if (!accounts) {
    return NextResponse.json({ error: "No accounts found" }, { status: 404 });
  }

  const finalData = Promise.all(
    accounts.map(async (account) => {
      const data = await getAccountData(account._id.toString());
      return data;
    })
  );

  return NextResponse.json(finalData);
}

export async function POST(request: Request) {
  const { username }: any = request.body;
  await connectDB();

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    // Try to fetch fresh data from Instagram

    const fetchedCurrentUser = await getServerSession();

    const loggedUser = fetchedCurrentUser?.user;
    if (!loggedUser) {
      throw new Error("User not logged in");
    }

    console.log(`Fetching Instagram data for username: ${username}`);
    const apiUrl = `${INSTAGRAM_API_URL}?username=${username}`;
    console.log(`API URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-IG-App-ID": "936619743392459",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.instagram.com/",
        Origin: "https://www.instagram.com",
        Cookie: "ig_did=1; ig_nrcb=1",
        "X-Requested-With": "XMLHttpRequest",
        "X-ASBD-ID": "129477",
        "X-CSRFToken": "1",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Instagram API Error:", {
        status: response.status,
        statusText: response.statusText,
        responseText: errorText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (errorText.includes("<!DOCTYPE html>")) {
        throw new Error(
          "Instagram returned a challenge page. The API might be rate limiting or blocking automated requests."
        );
      }

      throw new Error(
        `Failed to fetch Instagram data: ${response.status} ${response.statusText}`
      );
    }

    let data: InstagramData;
    try {
      const text = await response.text();
      console.log("Raw response:", text.substring(0, 200)); // Log first 200 chars of response
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      throw new Error("Invalid response format from Instagram API");
    }

    console.log({ data, user: data.data?.user });
    const user = data.data?.user;

    if (!user) {
      throw new Error("User not found or invalid response format");
    }

    // Find or create account in database
    let account = await Account.findOne({
      username: user.username,
      userEmail: loggedUser?.email,
    });
    console.log({ account });
    if (!account) {
      account = await Account.create({
        username: user.username,
        currentFollowers: user.edge_followed_by.count,
        userEmail: loggedUser?.email,
      });
    }

    // Update follower history if count changed
    if (account.currentFollowers !== user.edge_followed_by.count) {
      await FollowerHistory.create({
        accountId: account._id,
        count: user.edge_followed_by.count,
      });

      // Update current followers
      account.currentFollowers = user.edge_followed_by.count;
      account.lastUpdated = new Date();
      await account.save();
    }

    // Get follower history for charts
    const followerData = await FollowerHistory.find({
      accountId: account._id,
    }).sort({ timestamp: 1 });

    // Calculate changes
    const change24h = await getFollowerChange(account._id, 24);
    const change7d = await getFollowerChange(account._id, 24 * 7);
    const change30d = await getFollowerChange(account._id, 24 * 30);

    const engagement = calculateEngagement(user);
    const avgLikes = calculateAvgLikes(user);
    const avgComments = calculateAvgComments(user);

    return NextResponse.json({
      username: user.username,
      fullName: user.full_name,
      followers: user.edge_followed_by.count,
      following: user.edge_follow.count,
      posts: user.edge_owner_to_timeline_media.edges.length,
      engagement,
      avgLikes,
      avgComments,
      change24h,
      change7d,
      change30d,
      followerHistory: followerData,
    });
  } catch (error) {
    console.error("Error in Instagram API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram data" },
      { status: 500 }
    );
  }
}
