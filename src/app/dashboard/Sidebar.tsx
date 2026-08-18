"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { initialsFromName } from "@/lib/utils";
import MobilePreview from "./MobilePreview";
import styles from "./dashboard.module.css";

const NAV = [
  { href: "/dashboard",           label: "Links" },
  { href: "/dashboard/design",    label: "Design" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings",  label: "Settings" },
];

interface SidebarProps { name: string; slug: string; theme: string; avatar?: string | null; }

export default function Sidebar({ name, slug, avatar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setLoggingOut(async () => {
      await fetch("/api/auth/logout", { method: "DELETE" });
      router.push("/?auth=login");
    });
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const navContent = (
    <>
      <div className={styles.sidebarBrand}>
        <div className={styles.sidebarLogo} aria-hidden>
          <img src="/images/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
        </div>
        <div>
          <div className={styles.sidebarBrandName}>VioLink</div>
          <div className={styles.sidebarBrandSub}>Studio</div>
        </div>
      </div>

      <nav className={styles.sidebarNav} aria-label="Dashboard navigation">
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={styles.navItem + (isActive(item.href) ? " " + styles.navItemActive : "")}
            onClick={() => setMobileOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href={`/${slug}`} target="_blank" className={styles.viewProfile}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          View public page
        </Link>
        <div className={styles.userRow}>
          <div className={styles.userAvatar} aria-hidden>
            {avatar
              ? <img src={avatar} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", borderRadius:"50%" }} />
              : initialsFromName(name)}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{name}</div>
            <div className={styles.userSlug}>violink.space/{slug}</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out" disabled={loggingOut} aria-label="Sign out">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5 7.5h8M10 5l3 2.5L10 10M7 5V2H2v11h5v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar} aria-label="Sidebar">{navContent}</aside>
      {/* Mobile hamburger */}
      <div className={styles.mobileBar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogo} aria-hidden>
            <img src="/images/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
          </div>
          <span className={styles.sidebarBrandName}>Studio</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MobilePreview slug={slug} />
          <button className={styles.hamburger} onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className={styles.mobileDrawer} onClick={() => setMobileOpen(false)}>
          <div className={styles.drawerInner} onClick={e => e.stopPropagation()}>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
