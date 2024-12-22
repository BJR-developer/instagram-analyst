"use client";

import Navbar from "@/components/Navbar";
import React from "react";
import { SessionProvider } from "next-auth/react";

const RootTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <Navbar />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </SessionProvider>
  );
};

export default RootTemplate;
