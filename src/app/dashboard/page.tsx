"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { formatCompact } from "@/lib/utils";
import { PLATFORMS, BADGES, getPlatform, getBadge } from "@/lib/platforms";
import { PlatformIcon, LinkDefaultIcon } from "@/lib/PlatformIcon";
import styles from "./editor.module.css";
import SocialIconManager from "./SocialIconManager";
import ProfileCard from "./ProfileCard";

interface Link {
  id: string; title: string; url: string;
  active: boolean; featured: boolean; position: number;
  clicks: number; badge: string | null; icon: string | null;
  type: string;
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast"><span className="toast-icon">✓</span>{msg}</div>;
}

function LinkIconBubble({ icon, url, size = 36 }: { icon: string | null; url?: string; size?: number }) {
  // icon can be: a platform id (e.g. "github"), a full URL (e.g. favicon from Google), or null
  const isUrl = icon?.startsWith("http");
  const platform = !isUrl ? getPlatform(icon) : null;
  const isBrand = platform?.hasBrandIcon;
  const style = {
    width: size, height: size, borderRadius: "50%",
    display: "grid", placeItems: "center", flexShrink: 0,
    background: isUrl ? "#f5f5f5" : (isBrand ? "transparent" : (platform?.bg ?? "rgba(102,112,103,0.1)")),
    color: platform?.color ?? "var(--muted)",
    overflow: "hidden"
  };
  return (
    <div style={style} aria-hidden>
      {isUrl
        ? <img src={icon!} alt="" width={size} height={size} style={{ objectFit: "contain", width: size, height: size }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        : platform
          ? <PlatformIcon id={icon!} size={isBrand ? size : size * 0.52} color={platform.color} />
          : <LinkDefaultIcon size={size * 0.52} color="var(--muted)" />
      }
    </div>
  );
}

function BadgeChip({ id }: { id: string }) {
  const badge = getBadge(id);
  if (!badge) return null;
  return (
    <span className={styles.badge} style={{ color: badge.color, background: badge.bg, borderColor: badge.color + "33" }}>
      {badge.emoji} {badge.label}
    </span>
  );
}

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editBadge, setEditBadge] = useState<string>("");
  const [editIcon, setEditIcon] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<"icon" | "badge" | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pendingLinkId, setPendingLinkId] = useState<string | null>(null); // local-only, not yet in DB
  const [drawerSearch, setDrawerSearch] = useState(""); // search query inside Add drawer
  useEffect(() => { setMounted(true); }, []);
  const addDrawerInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => setToast(msg);

  // Signal DesktopPreview to reload after any data change
  const notifyPreview = () => {
    try { new BroadcastChannel("preview-reload").postMessage("reload"); } catch {}
  };

  const [slug, setSlug] = useState("");

  const fetch_ = useCallback(async () => {
    const [resLinks, resProfile] = await Promise.all([
      fetch("/api/links"),
      fetch("/api/profile")
    ]);
    const dLinks = await resLinks.json();
    const dProfile = await resProfile.json();
    setLinks(dLinks.links ?? []);
    setSlug(dProfile.slug ?? "");
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openEdit = (link: Link) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditBadge(link.badge ?? "");
    setEditIcon(link.icon ?? "");
    setActivePicker(null);
  };

  const addLink = (overrides?: Partial<{ title: string; url: string; icon: string }>) => {
    // Create a local-only pending row (no API call yet)
    const tempId = `pending_link_${Date.now()}`;
    const title = overrides?.title ?? "";
    const url = overrides?.url ?? "";
    const icon = overrides?.icon ?? null;
    const newLink: Link = {
      id: tempId, title, url, active: true, featured: false,
      position: links.length, clicks: 0, badge: null, icon, type: "LINK",
    };
    setLinks(prev => [...prev, newLink]);
    setPendingLinkId(tempId);
    setEditingId(tempId);
    setEditTitle(title);
    setEditUrl(url.replace(/^https?:\/\//, ""));
    setEditBadge("");
    setEditIcon(icon ?? "");
    setActivePicker(null);
    setShowAddDrawer(false);
  };

  const addHeader = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/links", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Section", url: "", type: "HEADER" }),
        });
        const d = await res.json();
        if (!res.ok || d.error) { showToast(d.error ?? "Failed to add header"); return; }
        setLinks(prev => [...prev, d.link]);
        openEdit(d.link);
        showToast("Header section added");
      } catch (e) {
        showToast("Network error — try again");
      }
    });
  };


  const saveEdit = (id: string) => {
    startTransition(async () => {
      const isPending = id === pendingLinkId;
      const cleanUrl = editUrl.trim().replace(/^https?:\/\//, "");
      if (isPending) {
        // First time: POST to create in DB
        const res = await fetch("/api/links", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editTitle, url: cleanUrl, icon: editIcon || null, badge: editBadge || null, type: "LINK" }),
        });
        const d = await res.json();
        if (res.ok) {
          setLinks(prev => prev.map(l => l.id === id ? d.link : l));
          setPendingLinkId(null);
        }
      } else {
        await fetch(`/api/links/${id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editTitle, url: cleanUrl, badge: editBadge || null, icon: editIcon || null }),
        });
        setLinks(prev => prev.map(l => l.id === id
          ? { ...l, title: editTitle, url: cleanUrl, badge: editBadge || null, icon: editIcon || null }
          : l));
      }
      setEditingId(null);
      showToast("Saved");
      notifyPreview();
    });
  };

  const toggleActive = (id: string) => {
    const link = links.find(l => l.id === id)!;
    startTransition(async () => {
      await fetch(`/api/links/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !link.active }) });
      setLinks(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
      showToast(link.active ? "Hidden from profile" : "Visible on profile");
      notifyPreview();
    });
  };

  const setFeatured = (id: string) => {
    startTransition(async () => {
      await fetch(`/api/links/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured: true }) });
      setLinks(prev => prev.map(l => ({ ...l, featured: l.id === id })));
      showToast("Set as featured link");
      notifyPreview();
    });
  };

  const duplicateLink = (id: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/links/${id}/duplicate`, { method: "POST" });
      const d = await res.json();
      setLinks(prev => [...prev, d.link]);
      showToast("Link duplicated — it's hidden by default");
      notifyPreview();
    });
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(`https://${url}`).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  const deleteLink = (id: string) => {
    if (id === pendingLinkId) {
      // Local-only row — just remove from state, no API call
      setLinks(prev => prev.filter(l => l.id !== id));
      setPendingLinkId(null);
      setEditingId(null);
      return;
    }
    startTransition(async () => {
      await fetch(`/api/links/${id}`, { method: "DELETE" });
      setLinks(prev => prev.filter(l => l.id !== id));
      if (editingId === id) setEditingId(null);
      showToast("Link removed");
      notifyPreview();
    });
  };

  const handleDrop = (overId: string) => {
    if (!dragId || dragId === overId) { setDragOverId(null); return; }
    const arr = [...links];
    const from = arr.findIndex(l => l.id === dragId);
    const to = arr.findIndex(l => l.id === overId);
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    const updated = arr.map((l, i) => ({ ...l, position: i }));
    setLinks(updated);
    setDragOverId(null);
    fetch("/api/links/reorder", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: updated.map(l => ({ id: l.id, position: l.position })) }),
    }).then(() => { showToast("Order saved"); notifyPreview(); });
  };

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
  const activeCount = links.filter(l => l.active).length;

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
        <div className={styles.pageHead}><div><p className="eyebrow">Creator studio</p><h1 className={styles.title}>Manage links</h1></div></div>
        {[1, 2, 3].map(i => <div key={i} className={"skeleton " + styles.skeletonRow} />)}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.editorPane}>
      {/* HEADER */}
      <header className={styles.pageHead}>
        <div>
          <p className="eyebrow">Creator studio</p>
          <h1 className={styles.title}>Links</h1>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-primary" onClick={() => { setShowAddDrawer(true); setTimeout(() => addDrawerInputRef.current?.focus(), 100); }} disabled={isPending}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Add link
          </button>
        </div>
      </header>


      {/* PROFILE CARD */}
      <ProfileCard />

      {/* SOCIAL ICONS SECTION */}
      <SocialIconManager />

      {/* LIST HEADER (Grouping) */}
      <div className={styles.listHeader}>
        <button className={styles.pillBtn} onClick={addHeader}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M1.5 5.5h11" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
          Add Header
        </button>
        <button className={styles.pillBtnRight}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 3h9a1.5 1.5 0 011.5 1.5v5A1.5 1.5 0 0111.5 11h-9A1.5 1.5 0 011 9.5v-5A1.5 1.5 0 012.5 3z" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M4 6h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          View archive
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M5 1L10 7L5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* LINK LIST */}
      <div className={styles.linkList} role="list" aria-label="Your links">
        {links.map(link => (
          <article key={link.id}
            className={`glass ${styles.linkCard} ${editingId === link.id ? styles.isEditing : ""} ${link.active ? "" : styles.hidden} ${dragId === link.id ? styles.dragging : ""} ${dragOverId === link.id ? styles.dragOver : ""} ${link.type === 'HEADER' ? styles.headerCard : ""}`}
            draggable={editingId === null}
            onDragStart={() => setDragId(link.id)}
            onDragEnd={() => { setDragId(null); setDragOverId(null); }}
            onDragOver={e => { e.preventDefault(); setDragOverId(link.id); }}
            onDrop={() => handleDrop(link.id)}
            role="listitem">

            {/* DRAG HANDLE */}
            <div className={styles.dragHandle} aria-hidden title="Drag to reorder">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="3.5" cy="3" r="1" fill="currentColor"/><circle cx="3.5" cy="9" r="1" fill="currentColor"/><circle cx="8.5" cy="3" r="1" fill="currentColor"/><circle cx="8.5" cy="9" r="1" fill="currentColor"/><circle cx="3.5" cy="6" r="1" fill="currentColor"/><circle cx="8.5" cy="6" r="1" fill="currentColor"/></svg>
            </div>

            {/* LINK ICON */}
            {link.type !== 'HEADER' && <LinkIconBubble icon={link.icon} url={link.url} size={38} />}

            {/* CONTENT / EDIT FORM */}
            {editingId === link.id ? (
              <div className={styles.editForm}>
                <div className={styles.editRow}>
                  <input className={"input " + styles.editInput} value={editTitle}
                    onChange={e => setEditTitle(e.target.value)} placeholder={link.type === 'HEADER' ? "Section title" : "Link title"} autoFocus maxLength={60} />
                </div>
                {link.type !== 'HEADER' && (
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">https://</span>
                    <input className="input" value={editUrl} onChange={e => {
                      const val = e.target.value.trim();
                      setEditUrl(val);
                      const lower = val.toLowerCase();
                      const match = PLATFORMS.find(p => lower.includes(p.id + ".com") || lower.includes(p.id + ".me") || lower.includes(p.id + ".tv") || lower.includes(p.id + ".be") || lower.includes(p.id + ".co") || (p.prefix && lower.includes(p.prefix.replace("https://", ""))));
                      if (match) {
                        setEditIcon(match.id);
                        if (editTitle === "New link" || editTitle === "") setEditTitle(match.label);
                      } else if (val.includes(".") && val.length > 3) {
                        // Auto-fetch favicon for any non-platform URL using Google Favicon API
                        try {
                          const domain = val.replace(/^https?:\/\//, "").split("/")[0];
                          if (domain && domain.includes(".")) {
                            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                            setEditIcon(faviconUrl);
                          }
                        } catch {}
                      }
                    }} placeholder="yoursite.com/page" />
                  </div>
                )}

                {link.type !== 'HEADER' && (
                  <div className={styles.pickerToggles}>
                    <button className={`btn btn-ghost btn-sm ${activePicker === 'icon' ? styles.toggleActive : ''}`} onClick={() => setActivePicker(p => p === 'icon' ? null : 'icon')}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><circle cx="5" cy="5" r="1" fill="currentColor"/><path d="M2 10l3-3 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Icon {editIcon && <span className={styles.toggleDot}/>}
                    </button>
                    <button className={`btn btn-ghost btn-sm ${activePicker === 'badge' ? styles.toggleActive : ''}`} onClick={() => setActivePicker(p => p === 'badge' ? null : 'badge')}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L9 4h3v3l2 3-2 3v3H9l-2 3-2-3H2v-3L0 10l2-3V4h3L7 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                      Badge {editBadge && <span className={styles.toggleDot}/>}
                    </button>
                  </div>
                )}

                {/* ICON PICKER */}
                {activePicker === "icon" && (
                  <div className={styles.pickerSection}>
                    <p className={styles.pickerLabel}>Icon</p>
                    <div className={styles.iconGrid}>
                      <button className={styles.iconOpt + (!editIcon ? " " + styles.iconOptActive : "")}
                        onClick={() => setEditIcon("")} title="No icon">
                        <LinkDefaultIcon size={16} color="var(--muted)" />
                      </button>
                      {PLATFORMS.map(p => (
                        <button key={p.id}
                          className={styles.iconOpt + (editIcon === p.id ? " " + styles.iconOptActive : "")}
                          style={{ background: editIcon === p.id ? p.bg : undefined, borderColor: editIcon === p.id ? p.color + "44" : undefined, padding: p.hasBrandIcon ? 0 : undefined }}
                          onClick={() => setEditIcon(p.id)} title={p.label}>
                          <PlatformIcon id={p.id} size={p.hasBrandIcon ? 34 : 16} color={editIcon === p.id ? p.color : "var(--muted)"} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* BADGE PICKER */}
                {activePicker === "badge" && (
                  <div className={styles.pickerSection}>
                    <p className={styles.pickerLabel}>Badge <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></p>
                    <div className={styles.badgeGrid}>
                      <button className={styles.badgeOpt + (!editBadge ? " " + styles.badgeOptActive : "")}
                        onClick={() => setEditBadge("")}>None</button>
                      {BADGES.map(b => (
                        <button key={b.id}
                          className={styles.badgeOpt + (editBadge === b.id ? " " + styles.badgeOptActive : "")}
                          style={editBadge === b.id ? { background: b.bg, color: b.color, borderColor: b.color + "44" } : {}}
                          onClick={() => setEditBadge(b.id)}>
                          {b.emoji} {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.editActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    if (link.id === pendingLinkId) {
                      deleteLink(link.id); // cancel on new unsaved row → remove it
                    } else {
                      setEditingId(null);
                    }
                  }}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={() => saveEdit(link.id)}
                    disabled={!editTitle || (link.type !== 'HEADER' && !editUrl) || isPending}>
                    {isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.linkMain} onClick={() => openEdit(link)}>
                {link.type === 'HEADER' ? (
                  <div className={styles.linkInfo}>
                    <span className={styles.headerTitle}>{link.title}</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.linkInfo}>
                      <div className={styles.linkTitleRow}>
                        <span className={styles.linkTitle}>{link.title}</span>
                        {link.badge && <BadgeChip id={link.badge} />}
                        {link.featured && <span className={styles.featuredPill}>Primary</span>}
                        {!link.active && <span className={styles.hiddenPill}>Hidden</span>}
                      </div>
                      <span className={styles.linkUrl}>{link.url}</span>
                    </div>
                    <div className={styles.clickStat}>
                      <span className={styles.clickNum}>{formatCompact(link.clicks)}</span>
                      <span className={styles.clickLabel}>clicks</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ACTION BAR */}
            {editingId !== link.id && (
              <div className={styles.actions}>
                {/* Toggle visible — only for LINK type */}
                {link.type !== 'HEADER' && (
                  <>
                    <button
                      className={`${styles.toggleBtn} ${link.active ? styles.toggleOn : ""}`}
                      onClick={(e) => { e.stopPropagation(); toggleActive(link.id); }}
                      aria-label={link.active ? "Hide link" : "Show link"}
                      title={link.active ? "Visible — click to hide" : "Hidden — click to show"}>
                      <span className={styles.toggleKnob} />
                    </button>
                    <div className={styles.actionsDivider}></div>
                  </>
                )}

                {/* Unified Dropdown Trigger */}
                <div className={styles.actionMenuWrap}>
                  <button
                    className={`${styles.actionMenuTrigger} ${actionMenuId === link.id ? styles.actionMenuTriggerActive : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (actionMenuId === link.id) {
                        setActionMenuId(null); setMenuPos(null);
                      } else {
                        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                        setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
                        setActionMenuId(link.id);
                      }
                    }}
                    aria-label="Link options">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}

        {links.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon} aria-hidden>
              <LinkDefaultIcon size={32} color="var(--muted)" />
            </div>
            <h3>No links yet</h3>
            <p>Start with a social shortcut or add a custom link.</p>
            <div className={styles.emptyActions}>
              <button className="btn btn-primary" onClick={() => { setShowAddDrawer(true); setTimeout(() => addDrawerInputRef.current?.focus(), 100); }}>Add link</button>
            </div>
          </div>
        )}
      </div>

      </div>
      {/* ACTION MENU PORTAL */}
      {mounted && actionMenuId && menuPos && createPortal(
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9000 }}
            onClick={() => { setActionMenuId(null); setMenuPos(null); }}
          />
          <div
            className={styles.actionDropdown}
            style={{ position: "fixed", top: menuPos.top, right: menuPos.right, zIndex: 9001 }}
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const link = links.find(l => l.id === actionMenuId);
              if (!link) return null;
              return (
                <>
                  {link.type !== 'HEADER' && !link.featured && (
                    <button className={styles.actionMenuBtn} onClick={() => { setFeatured(link.id); setActionMenuId(null); setMenuPos(null); }}>
                      <svg width="18" height="18" viewBox="0 0 15 15" fill="none"><path d="M7.5 1l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2 5.2l4-.6L7.5 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                      Set as primary
                    </button>
                  )}
                  {link.type !== 'HEADER' && (
                    <button className={styles.actionMenuBtn} onClick={() => { copyUrl(link.url, link.id); setActionMenuId(null); setMenuPos(null); }}>
                      <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><rect x="5" y="5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9 5V3.5a1.5 1.5 0 00-1.5-1.5h-4A1.5 1.5 0 002 3.5v4A1.5 1.5 0 003.5 9H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      Copy URL
                    </button>
                  )}
                  <button className={styles.actionMenuBtn} onClick={() => { duplicateLink(link.id); setActionMenuId(null); setMenuPos(null); }}>
                    <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M5 5V3.5A1.5 1.5 0 016.5 2h5A1.5 1.5 0 0113 3.5v5A1.5 1.5 0 0111.5 10H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><rect x="1" y="5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>
                    Duplicate link
                  </button>
                  <button className={`${styles.actionMenuBtn} ${styles.actionMenuBtnDanger}`} onClick={() => { deleteLink(link.id); setActionMenuId(null); setMenuPos(null); }}>
                    <svg width="16" height="16" viewBox="0 0 13 13" fill="none"><path d="M1.5 1.5l10 10M11.5 1.5l-10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    Delete link
                  </button>
                </>
              );
            })()}
          </div>
        </>,
        document.body
      )}


      {/* ADD LINK DRAWER */}
      {showAddDrawer && typeof document !== "undefined" && createPortal(
        <div className={styles.addDrawerBackdrop} onClick={() => { setShowAddDrawer(false); setDrawerSearch(""); }}>
          <div className={styles.addDrawerContent} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3>Add a new link</h3>
              <button className="btn btn-ghost btn-square" onClick={() => { setShowAddDrawer(false); setDrawerSearch(""); }} aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>
            
            <div className={styles.drawerSearchWrap}>
              <svg className={styles.drawerSearchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.6"/><path d="M10 10l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              <input
                ref={addDrawerInputRef}
                className={styles.drawerSearchInput}
                placeholder="Search platforms…"
                value={drawerSearch}
                onChange={e => setDrawerSearch(e.target.value)}
              />
            </div>

            <div className={styles.suggestedList}>
              {!drawerSearch && (
                <button className={styles.suggestedItem} onClick={() => addLink()}>
                  <div className={styles.suggestedIcon}><LinkDefaultIcon size={24} color="var(--muted)"/></div>
                  <div className={styles.suggestedInfo}>
                    <p className={styles.suggestedTitle}>Custom link</p>
                    <p className={styles.suggestedDesc}>Add a website, article, or portfolio</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{color:"var(--muted)"}}><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}

              {(() => {
                const filtered = PLATFORMS.filter(p =>
                  !drawerSearch ||
                  p.label.toLowerCase().includes(drawerSearch.toLowerCase()) ||
                  p.id.toLowerCase().includes(drawerSearch.toLowerCase())
                );
                return (
                  <>
                    {!drawerSearch && <p className="eyebrow" style={{marginTop:16, marginBottom:8, paddingLeft:4}}>Suggested platforms</p>}
                    {filtered.length === 0 && (
                      <p style={{ color: "var(--muted)", fontSize: ".88rem", padding: "16px 4px" }}>No platforms found for "{drawerSearch}"</p>
                    )}
                    {filtered.map(p => (
                      <button key={p.id} className={styles.suggestedItem} onClick={() => addLink({ title: p.label, url: p.prefix, icon: p.id })}>
                        <div className={styles.suggestedIcon} style={{ background: p.hasBrandIcon ? "transparent" : p.bg, color: p.color }}>
                          <PlatformIcon id={p.id} size={p.hasBrandIcon ? 40 : 20} color={p.color} />
                        </div>
                        <div className={styles.suggestedInfo}>
                          <p className={styles.suggestedTitle}>{p.label}</p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{color:"var(--muted)"}}><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="toast-portal">{toast && <Toast msg={toast} onDone={() => setToast(null)} />}</div>
    </div>
  );
}
