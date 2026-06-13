import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import { SideNav } from "@/components/ui/SideNav";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { PushPermissionBanner } from "@/components/ui/PushPermissionBanner";

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
      <SplashScreen />

      {/* Desktop sidebar — hidden on mobile */}
      <SideNav user={user} />

      {/* Mobile header — hidden on desktop */}
      <PageHeader user={user} />

      {/* Main content */}
      <div className="md:ml-[240px]" style={{ minHeight: "100dvh" }}>
        <main
          className="mx-auto px-4 md:px-8 pt-20 pb-24 md:py-8"
          style={{ maxWidth: 900 }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <BottomNav />
      <PushPermissionBanner />
    </div>
  );
}
