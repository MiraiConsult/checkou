import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://vqvcfgzhpisvfzfaetky.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdmNmZ3pocGlzdmZ6ZmFldGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzkwNjYsImV4cCI6MjA5NTU1NTA2Nn0.jVOHwVwPt8FH2zYJskAjTrOSh59abCvXokRsPAtwC3M",
  },
};

export default nextConfig;
