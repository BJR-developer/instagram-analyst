"use client";

import Navbar from "@/components/Navbar";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const RootTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Navbar />
        <main className="min-h-screen bg-gray-50">{children}</main>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default RootTemplate;
