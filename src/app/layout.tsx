import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHECKOU — Gestão Operacional",
  description: "Plataforma SaaS de checklists digitais, gestão operacional e conformidade para empresas multi-unidade.",
  // iPhone: "Adicionar à Tela de Início" opens full screen, named Checkou
  appleWebApp: { capable: true, title: "Checkou", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0b1630",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("checkou-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL,GRAD,opsz,wght@0..1,-50..200,20..48,100..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-surface">{children}</body>
    </html>
  );
}
