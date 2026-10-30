import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relatório de Checklist | Checkou",
  robots: { index: false, follow: false },
};

export default function PublicReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
