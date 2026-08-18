"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

import { slugify, initialsFromName } from "@/lib/utils";
import styles from "./ProfileCard.module.css";

function Toast({ msg, type = "ok", onDone }: { msg: string; type?: "ok" | "err"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast"><span className={"toast-icon" + (type === "err" ? " danger" : "")}>{type === "ok" ? "✓" : "✗"}</span>{msg}</div>;
}

interface ProfileData { name: string; bio: string; slug: string; avatar: string | null; }

export default function ProfileCard() {
  const [data, setData]       = useState<ProfileData>({ name: "", bio: "", slug: "", avatar: null });
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);

  // edit form state (local copy while modal is open)
  const [name, setName]   = useState("");
  const [bio, setBio]     = useState("");
  const [slug, setSlug]   = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const [uploading, setUploading]          = useState(false);
  const [isDrag, setIsDrag]                = useState(false);
  const [isPending, startTransition]       = useTransition();
  const [toast, setToast]                  = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef     = useRef<HTMLDivElement>(null);

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/profile");
    const d   = await res.json();
    const p   = { name: d.name ?? "", bio: d.bio ?? "", slug: d.slug ?? "", avatar: d.avatar ?? null };
    setData(p);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Sync form state when opening modal
  const openModal = () => {
    setName(data.name); setBio(data.bio);
    setSlug(data.slug); setAvatar(data.avatar);
    setOpen(true);
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const saveProfile = () => {
    startTransition(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, slug }),
      });
      const d = await res.json();
      if (!res.ok) { setToast({ msg: d.error || "Failed to save", type: "err" }); return; }
      setData(prev => ({ ...prev, name, bio, slug, avatar }));
      setToast({ msg: "Profile saved!", type: "ok" });
      setOpen(false);
    });
  };

  const uploadAvatar = async (file: File) => {
    if (uploading) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
    const d   = await res.json();
    if (res.ok) {
      setAvatar(d.url);
      setData(prev => ({ ...prev, avatar: d.url }));
      setToast({ msg: "Photo updated!", type: "ok" });
    } else {
      setToast({ msg: d.error || "Upload failed", type: "err" });
    }
    setUploading(false);
  };

  const deleteAvatar = async () => {
    setUploading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: null }),
    });
    if (res.ok) {
      setAvatar(null);
      setData(prev => ({ ...prev, avatar: null }));
      setToast({ msg: "Photo removed", type: "ok" });
    } else {
      setToast({ msg: "Failed to remove photo", type: "err" });
    }
    setUploading(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) uploadAvatar(file);
    e.target.value = "";
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false);
    const file = e.dataTransfer.files?.[0]; if (file) uploadAvatar(file);
  };

  const initials = data.name ? initialsFromName(data.name) : "?";

  /* ── COMPACT ROW (always visible) ─────────────────── */
  return (
    <>
      <section className={styles.card}>
        {loading ? (
          <div className={styles.compactRow}>
            <span className={"skeleton " + styles.avatarSkele} />
            <div className={styles.compactInfo}>
              <span className="skeleton" style={{ height: 13, width: 90, borderRadius: 6, display: "block" }} />
              <span className="skeleton" style={{ height: 11, width: 160, borderRadius: 6, display: "block", marginTop: 5 }} />
            </div>
          </div>
        ) : (
          <button className={styles.compactRow} onClick={openModal} aria-label="Edit profile">
            {/* AVATAR */}
            <span className={styles.avatar}>
              {data.avatar
                ? <img src={data.avatar} alt={data.name} className={styles.avatarImg} />
                : <span className={styles.avatarInitials}>{initials}</span>}
            </span>

            {/* INFO */}
            <span className={styles.compactInfo}>
              <span className={styles.compactName}>{data.name || "Set your name"}</span>
              <span className={styles.compactBio}>{data.bio || "Add a bio…"}</span>
            </span>

            {/* EDIT HINT */}
            <span className={styles.editHint} aria-hidden>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M9.5 1.5L11.5 3.5 4.5 10.5H2.5V8.5L9.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit
            </span>
          </button>
        )}
      </section>

      {/* Modal rendered at body level via portal — covers full viewport */}
      {open && createPortal(
        <div className={styles.backdrop} onClick={() => setOpen(false)} aria-modal role="dialog" aria-label="Edit profile">
          <div
            ref={modalRef}
            className={styles.modal}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className={styles.modalHead}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 2 }}>Profile</p>
                <h2 className={styles.modalTitle}>Edit profile</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* AVATAR UPLOAD */}
              <div className={styles.avatarSection}>
                <button
                  className={styles.avatarBtn + (isDrag ? " " + styles.dragging : "")}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
                  onDragLeave={() => setIsDrag(false)}
                  onDrop={onDrop}
                  disabled={uploading}
                  aria-label="Change photo"
                  title="Click or drag to upload photo">
                  {avatar
                    ? <img src={avatar} alt="Profile" className={styles.avatarImg} />
                    : <span className={styles.avatarInitials} style={{ fontSize: "2rem" }}>{initials}</span>}
                  <span className={styles.avatarOverlay} aria-hidden>
                    {uploading
                      ? <span className="spinner" style={{ width: 20, height: 20 }} />
                      : <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 4v9M7 7l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 17h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>}
                  </span>
                </button>
                <div className={styles.avatarMeta}>
                  <span className={styles.avatarName}>{name || "Your name"}</span>
                  <span className={styles.avatarHint}>Click or drag to change photo<br/>JPG, PNG, WebP · max 5 MB</span>
                  {avatar && (
                    <button
                      className={styles.deletePhotoBtn}
                      onClick={deleteAvatar}
                      disabled={uploading}
                      type="button">
                      {uploading
                        ? <span className="spinner" style={{ width: 10, height: 10 }} />
                        : <>
                            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                            Hapus foto
                          </>}
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={onFileChange} style={{ display: "none" }} aria-hidden />
              </div>

              <hr className="divider" />

              {/* FIELDS */}
              <div className={styles.fields}>
                <div className="field">
                  <label className="field-label" htmlFor="pc-name">Display name</label>
                  <input id="pc-name" className="input" value={name}
                    onChange={e => setName(e.target.value)} maxLength={36} placeholder="Your name" autoFocus />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="pc-bio">
                    Bio <span style={{ color: "var(--muted)", fontWeight: 400 }}>({bio.length}/160)</span>
                  </label>
                  <textarea id="pc-bio" className="input textarea" value={bio}
                    onChange={e => setBio(e.target.value)} maxLength={160} rows={3}
                    placeholder="Tell the world about yourself…" style={{ resize: "vertical" }} />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="pc-slug">Username</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">violink.space/</span>
                    <input id="pc-slug" className="input" value={slug}
                      onChange={e => setSlug(slugify(e.target.value))} maxLength={24} spellCheck={false} />
                  </div>
                  <span className="field-hint">Changing your username will break existing shared links.</span>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className={styles.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProfile} disabled={isPending || !name.trim()}>
                {isPending ? <span className="spinner" /> : null}
                Save profile
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      <div className="toast-portal">
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </>
  );
}
