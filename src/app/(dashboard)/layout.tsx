import { SideNavBar } from "@/components/layout/SideNavBar";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";

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
      <main className="md:ml-64 pt-4 md:pt-20 pb-24 md:pb-8 px-4 md:px-8">
        {children}
      </main>

      <BottomNavBar />
    </div>
  );
}
