import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Sidebar from "./Sidebar";
import DesktopPreview from "./DesktopPreview";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
    select: { name: true, slug: true, theme: true, onboarded: true, avatar: true },
  });

  if (!profile) redirect("/login");
  if (!profile.onboarded) redirect("/onboarding");

  return (
    <div className={styles.shell}>
      <Sidebar name={profile.name} slug={profile.slug} theme={profile.theme} avatar={profile.avatar} />
      <main className={styles.main}>{children}</main>
      <DesktopPreview slug={profile.slug} />
    </div>
  );
}
