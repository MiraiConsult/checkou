import { SideNavBar } from "@/components/layout/SideNavBar";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { ActingBanner } from "@/components/layout/ActingBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <SideNavBar />
      <TopNavBar />

      {/* Main content */}
      <main className="md:ml-[17.5rem] print:ml-0 pt-4 md:pt-24 pb-28 md:pb-8 px-4 md:px-6 print:p-0">
        <ActingBanner />
        {children}
      </main>

      <BottomNavBar />
    </div>
  );
}
