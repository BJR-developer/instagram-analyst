import { Account } from "@/lib/schema";
import { NextResponse } from "next/server";

export const GET = async () => {
  const account = await Account.create({
    username: "urnmaain",
    currentFollowers: 234234,
    userEmail: "loggedUser?.email",
    followerHistory: [],
  });

  const data = await account.save();
  return NextResponse.json(data);
};
