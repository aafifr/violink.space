"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

function ConfirmDelete({ onConfirm, onCancel, isPending }: { onConfirm: () => void; onCancel: () => void; isPending: boolean }) {
  return (
    <div className={styles.confirmBox}>
      <p className={styles.confirmText}>Are you absolutely sure?</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? <span className="spinner" /> : null}
          Yes, delete everything
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const deleteAccount = () => {
    startTransition(async () => {
      await fetch("/api/account", { method: "DELETE" });
      router.push("/login");
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <p className="eyebrow">Creator studio</p>
          <h1 className={styles.title}>Account</h1>
        </div>
      </header>

      <article className={styles.section + " glass card"}>
        <div className="section-head">
          <p className="eyebrow">Danger zone</p>
          <h2 className={styles.sectionTitle}>Account settings</h2>
          <p className={styles.sectionDesc}>Manage your account and data.</p>
        </div>
        <hr className="divider" />
        <div className={styles.dangerZone}>
          <div>
            <h4 className={styles.dangerTitle}>Delete account</h4>
            <p className={styles.dangerDesc}>
              Permanently deletes your profile, all links, and analytics data. This cannot be undone.
            </p>
          </div>
          {!deleteConfirm ? (
            <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}>
              Delete account
            </button>
          ) : (
            <ConfirmDelete
              onConfirm={deleteAccount}
              onCancel={() => setDeleteConfirm(false)}
              isPending={isPending}
            />
          )}
        </div>
      </article>
    </div>
  );
}
