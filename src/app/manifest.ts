import type { MetadataRoute } from "next";

// Lets people put Checkou on the phone's home screen: it opens full screen
// with the Checkou icon, like an app, with nothing to download from a store.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CHECKOU — Gestão Operacional",
    short_name: "Checkou",
    description: "Checklists digitais e gestão operacional.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1630",
    theme_color: "#0b1630",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
