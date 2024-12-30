import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Account, User } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { InstagramData } from "@/lib/api/type";
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

  // const finalData = Promise.all(
  //   accounts.map(async (account) => {
  //     const data = await getAccountData(account._id.toString());
  //     return data;
  //   })
  // );

  return NextResponse.json([]);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session?.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if account already exists
    if (
      user.instagramAccounts.some(
        (account: any) => account.username === username
      )
    ) {
      return NextResponse.json(
        { error: "Account already exists" },
        { status: 400 }
      );
    }

    const apiUrl = `${INSTAGRAM_API_URL}?username=${username}`;

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
    const instagramUser = data.data?.user;

    // Add new Instagram account
    user.instagramAccounts.push({
      username,
      lastUpdated: new Date(),
      currentFollowers: instagramUser.edge_followed_by.count,
      followerHistory: [
        {
          count: instagramUser.edge_followed_by.count,
          timestamp: new Date(),
        },
      ],
    });

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding Instagram account:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
