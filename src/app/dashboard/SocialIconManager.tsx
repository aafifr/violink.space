"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { PlatformIcon } from "@/lib/PlatformIcon";
import { PLATFORMS } from "@/lib/platforms";
import styles from "./SocialIconManager.module.css";

const SOCIAL_PLATFORMS = PLATFORMS.filter(p =>
  ["instagram","tiktok","youtube","x","whatsapp","spotify","linkedin","facebook","threads","github"].includes(p.id)
);

interface SocialIcon {
  id: string; platform: string; url: string; active: boolean; position: number;
}

export default function SocialIconManager() {
  const [icons, setIcons] = useState<SocialIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null); // tracks unsaved new row
  
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchIcons = useCallback(async () => {
    const res = await fetch("/api/social-icons");
    const d = await res.json();
    setIcons(d.icons ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchIcons(); }, [fetchIcons]);

  // Focus input when edit mode opens
  useEffect(() => {
    if (editingId) setTimeout(() => inputRef.current?.focus(), 60);
  }, [editingId]);

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

  const addIcon = (platform: string) => {
    // Add a local-only pending row immediately (no API call yet)
    const tempId = `pending_${platform}_${Date.now()}`;
    const p = SOCIAL_PLATFORMS.find(p => p.id === platform);
    const defaultUrl = p?.prefix?.replace("https://", "") ?? "";
    const newIcon: SocialIcon = {
      id: tempId, platform, url: defaultUrl, active: true, position: icons.length,
    };
    setIcons(prev => [...prev, newIcon]);
    setPendingId(tempId);
    setShowPicker(false);
    setEditingId(tempId);
    setEditUrl(defaultUrl);
  };

  const toggleActive = async (icon: SocialIcon) => {
    setIcons(prev => prev.map(i => i.id === icon.id ? { ...i, active: !i.active } : i));
    await fetch(`/api/social-icons/${icon.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !icon.active }),
    });
  };

  const saveUrl = async (id: string) => {
    if (!editUrl.trim()) return;
    setSaving(true);
    const isPending = id === pendingId;
    if (isPending) {
      // First-time save: POST to create
      const icon = icons.find(i => i.id === id)!;
      const res = await fetch("/api/social-icons", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: icon.platform, url: editUrl.trim() }),
      });
      const d = await res.json();
      if (res.ok) {
        // Replace temp row with real one from server
        setIcons(prev => prev.map(i => i.id === id ? d.icon : i));
        setPendingId(null);
      }
    } else {
      // Update existing
      await fetch(`/api/social-icons/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: editUrl.trim() }),
      });
      setIcons(prev => prev.map(i => i.id === id ? { ...i, url: editUrl.trim() } : i));
    }
    setEditingId(null);
    setSaving(false);
  };

  const deleteIcon = async (id: string) => {
    setIcons(prev => prev.filter(i => i.id !== id));
    if (editingId === id) setEditingId(null);
    if (id === pendingId) { setPendingId(null); return; } // local-only row, no API call
    await fetch(`/api/social-icons/${id}`, { method: "DELETE" });
  };

  const usedPlatforms = new Set(icons.map(i => i.platform));
  const available = SOCIAL_PLATFORMS.filter(p => !usedPlatforms.has(p.id));
  const canAdd = icons.length < 5;
  const activeCount = icons.filter(i => i.active).length;
  const hasUnsaved = editingId !== null; // any open edit (including pending) blocks Done

  return (
    <>
      {/* ── COMPACT ROW ─────────────────────────────────────── */}
      <section className={styles.card}>
        {loading ? (
          <div className={styles.compactRow}>
            <div className={styles.bubbleStack}>
              <span className={"skeleton " + styles.bubble} />
              <span className={"skeleton " + styles.bubble} />
            </div>
            <div className={styles.compactInfo}>
              <span className="skeleton" style={{ height: 13, width: 90, borderRadius: 6, display: "block" }} />
              <span className="skeleton" style={{ height: 11, width: 140, borderRadius: 6, display: "block", marginTop: 5 }} />
            </div>
          </div>
        ) : (
          <button className={styles.compactRow} onClick={() => setOpen(true)} aria-label="Manage social icons">
            
            {/* BUBBLE STACK */}
            <div className={styles.bubbleStack}>
              {icons.length === 0 ? (
                <span className={styles.bubble + " " + styles.emptyBubble}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </span>
              ) : (
                icons.slice(0, 3).map(icon => {
                  const p = SOCIAL_PLATFORMS.find(p => p.id === icon.platform);
                  return (
                    <span key={icon.id} className={styles.bubble} style={{ background: p?.hasBrandIcon ? "transparent" : (p?.bg ?? "#eee"), opacity: icon.active ? 1 : 0.4 }}>
                      <PlatformIcon id={icon.platform} size={p?.hasBrandIcon ? 34 : 16} color={p?.color ?? "#999"} />
                    </span>
                  );
                })
              )}
              {icons.length > 3 && (
                <span className={styles.bubble} style={{ background: "var(--line)", color: "var(--muted)", fontSize: ".65rem", fontWeight: 700 }}>
                  +{icons.length - 3}
                </span>
              )}
            </div>

            {/* INFO */}
            <span className={styles.compactInfo}>
              <span className={styles.compactName}>Social icons</span>
              <span className={styles.compactBio}>
                {icons.length === 0 ? "Add links to your social profiles" : `${activeCount} visible on your profile`}
              </span>
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

      {/* ── PORTAL MODAL ────────────────────────────────────── */}
      {open && createPortal(
        <div className={styles.backdrop} onClick={() => setOpen(false)} aria-modal role="dialog" aria-label="Manage social icons">
          <div
            ref={modalRef}
            className={styles.modal}
            onClick={e => e.stopPropagation()}>
            
            {/* Modal header */}
            <div className={styles.modalHead}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 2 }}>Profile links</p>
                <div className={styles.titleRow}>
                  <h2 className={styles.modalTitle}>Social icons</h2>
                  <span className={styles.countBadge}>{icons.length} / 5</span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className={styles.modalBody}>
              
              {/* HEADER INSIDE MODAL */}
              <div className={styles.header}>
                <p className={styles.subtitle} style={{ margin: 0 }}>Icon row below bio — toggle to show/hide</p>
                {canAdd && (
                  <button
                    className={"btn btn-ghost btn-sm " + styles.addBtn + (showPicker ? " " + styles.addBtnActive : "")}
                    onClick={() => setShowPicker(v => !v)}
                    disabled={saving}
                    aria-expanded={showPicker}>
                    {showPicker ? (
                      <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> Close</>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> Add icon</>
                    )}
                  </button>
                )}
              </div>

              {/* PLATFORM PICKER */}
              {showPicker && (
                <div className={styles.picker} role="listbox">
                  {available.length === 0 ? (
                    <p className={styles.noMore}>All platforms already added.</p>
                  ) : (
                    <div className={styles.pickerGrid}>
                      {available.map(p => (
                        <button
                          key={p.id} className={styles.pickerBtn}
                          onClick={() => addIcon(p.id)} title={p.label} disabled={saving} role="option">
                          <span className={styles.pickerIcon} style={{ background: p.hasBrandIcon ? "transparent" : p.bg }}>
                            <PlatformIcon id={p.id} size={p.hasBrandIcon ? 34 : 16} color={p.color} />
                          </span>
                          <span className={styles.pickerName}>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ICON LIST */}
              {icons.length === 0 ? (
                <button className={styles.emptyState} onClick={() => setShowPicker(true)}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
                    <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Add your first social icon — click to choose a platform</span>
                </button>
              ) : (
                <ul className={styles.list}>
                  {icons.map(icon => {
                    const p = SOCIAL_PLATFORMS.find(p => p.id === icon.platform);
                    const isEditing = editingId === icon.id;
                    return (
                      <li key={icon.id} className={styles.iconRow + (!icon.active ? " " + styles.inactive : "") + (isEditing ? " " + styles.editing : "")}>
                        {/* ICON BUBBLE */}
                        <span className={styles.iconBubble} style={{ background: p?.hasBrandIcon ? "transparent" : (p?.bg ?? "#eee") }}>
                          <PlatformIcon id={icon.platform} size={p?.hasBrandIcon ? 32 : 16} color={p?.color ?? "#999"} />
                        </span>

                        {/* INFO + EDIT */}
                        <div className={styles.iconInfo}>
                          {isEditing ? (
                            <div className={styles.editBlock}>
                              <div className="input-prefix-wrap">
                                <span className="input-prefix">https://</span>
                                <input
                                  ref={inputRef} className="input" value={editUrl}
                                  onChange={e => setEditUrl(e.target.value)}
                                  onKeyDown={e => { if (e.key === "Enter") saveUrl(icon.id); if (e.key === "Escape") setEditingId(null); }}
                                  placeholder={p?.prefix?.replace("https://", "") ?? "yourprofile.com"}
                                />
                              </div>
                              <div className={styles.editActions}>
                                <button className="btn btn-primary btn-sm" onClick={() => saveUrl(icon.id)} disabled={saving || !editUrl.trim()}>Save</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => {
                                  if (icon.id === pendingId) {
                                    // Cancel on a new unsaved row → delete it
                                    deleteIcon(icon.id);
                                  } else {
                                    setEditingId(null);
                                  }
                                }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className={styles.platformName}>{p?.label ?? icon.platform}</span>
                              <button className={styles.urlChip} onClick={() => { setEditingId(icon.id); setEditUrl(icon.url); }}>
                                <span className={styles.urlText}>{icon.url || "Set URL"}</span>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M7.5 1.5L8.5 2.5 3.5 7.5H2.5V6.5L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </>
                          )}
                        </div>

                        {/* TOGGLE + DELETE */}
                        {!isEditing && (
                          <div className={styles.rowActions}>
                            <button
                              className={styles.toggleBtn + (icon.active ? " " + styles.toggleOn : "")}
                              onClick={() => toggleActive(icon)} title={icon.active ? "Visible — click to hide" : "Hidden — click to show"}>
                              <span className={styles.toggleKnob} />
                            </button>
                            <button className={styles.deleteBtn} onClick={() => deleteIcon(icon.id)} title="Remove">
                              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Modal footer (optional, mostly for consistency, actions are inline) */}
            <div className={styles.modalFoot}>
              <button
                className="btn btn-primary"
                onClick={() => setOpen(false)}
                disabled={hasUnsaved}
                title={hasUnsaved ? "Save or cancel the current edit first" : undefined}
              >Done</button>
            </div>
            
          </div>
        </div>
      , document.body)}
    </>
  );
}
