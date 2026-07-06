import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import { SideNav } from "@/components/ui/SideNav";
import { SplashScreenLoader } from "@/components/ui/SplashScreen/SplashScreenLoader";
import { PushPermissionBanner } from "@/components/ui/PushPermissionBanner";
import { NotificationTonePlayer } from "@/components/ui/NotificationTonePlayer";
import { BottomSheetBackground } from "@/components/ui/BottomSheet";
import { HabitFormSheet } from "@/components/features/habits/HabitFormSheet";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = {
    name: session.user.name ?? "User",
    image: session.user.image ?? null,
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg-page)" }}
    >
      <SplashScreenLoader />

      {/* Fixed chrome — lives OUTSIDE the transformed wrapper so position:fixed works */}
      <SideNav user={user} />
      <PageHeader user={user} />
      <BottomNav />
      <PushPermissionBanner />
      <NotificationTonePlayer />

      {/* Only the scrollable content area gets the iOS zoom-out transform */}
      <BottomSheetBackground>
        <div className="md:ml-[240px]">
          <main
            className="mx-auto px-4 md:px-8 pt-[calc(20px+var(--mobile-header-height))] md:pt-8 pb-24 md:pb-8"
            style={{ maxWidth: 900 }}
          >
            {children}
          </main>
        </div>
      </BottomSheetBackground>

      {/* Global habit form sheet — portals to document.body */}
      <HabitFormSheet />
    </div>
  );
}
