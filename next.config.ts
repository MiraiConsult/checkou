import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://obomryzkclfryqgrdlbk.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ib21yeXprY2xmcnlxZ3JkbGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDk5NTcsImV4cCI6MjA5MDU4NTk1N30.BjuI8YuEAi0Qah0zOOjFuOxN-pnSEXMij6kvktK0TC8",
  },
};

export default nextConfig;
