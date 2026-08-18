"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./landing.module.css";
import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { FeatureGrid } from "./FeatureGrid";
import { HowItWorks } from "./HowItWorks";
import { FaqSection } from "./FaqSection";
import { LandingFooter } from "./LandingFooter";
import { AuthModal } from "./AuthModal";

function LandingContent() {
  const searchParams = useSearchParams();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [claimedSlug, setClaimedSlug] = useState("");

  useEffect(() => {
    const authParam = searchParams.get("auth") || searchParams.get("tab");
    const slugParam = searchParams.get("slug") || "";

    if (authParam === "login" || authParam === "register") {
      setAuthTab(authParam);
      if (slugParam) setClaimedSlug(slugParam);
      setIsAuthOpen(true);
    }
  }, [searchParams]);

  const handleOpenAuth = (tab: "login" | "register", slug = "") => {
    setAuthTab(tab);
    setClaimedSlug(slug);
    setIsAuthOpen(true);
  };

  return (
    <div className={styles.landingPage}>
      {/* FLOATING STICKY HEADER (z-index 9999 over all sections) */}
      <LandingHeader onOpenAuth={handleOpenAuth} />

      {/* 100vh PURPLE HERO WRAPPER */}
      <div className={styles.heroWrapper}>
        <HeroSection onOpenAuth={handleOpenAuth} />
      </div>

      <main>
        <FeatureGrid />
        <HowItWorks />
        <FaqSection />
      </main>

      <LandingFooter onOpenAuth={handleOpenAuth} />

      {/* HOMEPAGE GLASSMORPHISM AUTH MODAL POPUP */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
        claimedSlug={claimedSlug}
      />
    </div>
  );
}

export function LandingClientLayout() {
  return (
    <Suspense fallback={null}>
      <LandingContent />
    </Suspense>
  );
}
