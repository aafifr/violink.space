"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCompact } from "@/lib/utils";
import styles from "./analytics.module.css";

type Range = "7" | "30" | "90" | "all";

const RANGES: { id: Range; label: string }[] = [
  { id: "7",   label: "7D"       },
  { id: "30",  label: "30D"      },
  { id: "90",  label: "90D"      },
  { id: "all", label: "All time" },
];

interface Link { id: string; title: string; clicks: number; active: boolean; }
interface AnalyticsData {
  days: string[];
  byDate: Record<string, { views: number; clicks: number }>;
  dowBuckets: { dow: number; total: number }[];
  totalViews: number;
  totalClicks: number;
  ctr: number;
  links: Link[];
  totalLinks: number;
  activeLinks: number;
}

const DOW_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function SkeletonCard() {
  return <div className={"skeleton glass " + styles.kpiCard} style={{ height: 100 }} />;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("30");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const fetchData = useCallback(async (r: Range) => {
    setTransitioning(true);
    try {
      const res = await fetch(`/api/analytics?range=${r}`);
      const d = await res.json();
      setData(d);
    } finally {
      setLoading(false);
      setTransitioning(false);
    }
  }, []);

  useEffect(() => { fetchData(range); }, [range, fetchData]);

  const changeRange = (r: Range) => {
    if (r === range) return;
    setRange(r);
  };

  const rangeLabel = RANGES.find(r => r.id === range)?.label ?? "";

  /* Derived */
  const maxViews  = data ? Math.max(...data.days.map(d => data.byDate[d]?.views ?? 0), 1) : 1;
  const activeLinks = data ? data.links.filter(l => l.active) : [];
  const maxClicks   = activeLinks.length ? Math.max(...activeLinks.map(l => l.clicks), 1) : 1;
  const maxDow      = data ? Math.max(...data.dowBuckets.map(b => b.total), 1) : 1;

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div><p className="eyebrow">Performance</p><h1 className={styles.title}>Analytics</h1></div>
        {/* TIME FILTER PILLS */}
        <div className={styles.rangeBar} role="group" aria-label="Time range">
          {RANGES.map(r => (
            <button
              key={r.id}
              className={styles.rangeBtn + (range === r.id ? " " + styles.rangeBtnActive : "")}
              onClick={() => changeRange(r.id)}
              aria-pressed={range === r.id}>
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {/* KPI CARDS */}
      <div className={styles.kpiGrid}>
        {loading ? [1,2,3,4].map(i => <SkeletonCard key={i} />) : (
          <>
            {[
              { label:"Profile views",  val: formatCompact(data!.totalViews),  sub:`Over ${rangeLabel}` },
              { label:"Link clicks",    val: formatCompact(data!.totalClicks), sub:"Across all links" },
              { label:"Click-through",  val: `${data!.ctr}%`,                  sub:"Avg CTR" },
              { label:"Total links",    val: `${data!.totalLinks}`,             sub:`${data!.activeLinks} active` },
            ].map(k => (
              <article key={k.label} className={styles.kpiCard + " glass " + (transitioning ? styles.fading : "")}>
                <span className="eyebrow">{k.label}</span>
                <strong className={styles.kpiVal}>{k.val}</strong>
                <small className={styles.kpiSub}>{k.sub}</small>
              </article>
            ))}
          </>
        )}
      </div>

      {/* VIEWS CHART */}
      <article className={styles.chartCard + " glass card"}>
        <div className="section-head row">
          <div>
            <p className="eyebrow">Views over time</p>
            <h2 className={styles.chartTitle}>Daily profile visits — {rangeLabel}</h2>
          </div>
        </div>
        <div className={styles.chart30 + (transitioning ? " " + styles.fading : "")}>
          {loading
            ? Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className={styles.barWrap}>
                  <div className={"skeleton " + styles.bar30} style={{ height: `${20 + Math.random() * 60}%` }} />
                </div>
              ))
            : data!.days.map(date => {
                const v = data!.byDate[date]?.views ?? 0;
                const pct = (v / maxViews) * 100;
                const d = new Date(date + "T12:00:00");
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                // Thin bars for many days (90D/all)
                const thin = data!.days.length > 45;
                return (
                  <div key={date} className={styles.barWrap} title={`${date}: ${v} views`}>
                    <div className={styles.bar30 + (isWeekend ? " " + styles.weekend : "") + (thin ? " " + styles.thin : "")}
                      style={{ height: `${Math.max(pct, 2)}%` }} />
                  </div>
                );
              })}
        </div>
        {!loading && data && (
          <div className={styles.chartXAxis}>
            <span>{data.days[0]?.slice(5)}</span>
            {data.days.length > 14 && <span>{data.days[Math.floor(data.days.length / 2)]?.slice(5)}</span>}
            <span>{data.days[data.days.length - 1]?.slice(5)}</span>
          </div>
        )}
      </article>

      <div className={styles.bottomRow}>
        {/* TOP LINKS TABLE */}
        <article className={styles.tableCard + " glass card"}>
          <div className="section-head row">
            <div><p className="eyebrow">Top destinations</p><h2 className={styles.chartTitle}>Link performance</h2></div>
          </div>
          <div className={styles.linkTable}>
            <div className={styles.tableHeader}>
              <span>Link</span><span>Clicks</span><span>Share</span>
            </div>
            {loading
              ? [1,2,3,4].map(i => <div key={i} className={"skeleton " + styles.skeletonRow} />)
              : activeLinks.slice(0, 8).map((link, i) => {
                  const share = data!.totalClicks > 0 ? ((link.clicks / data!.totalClicks) * 100).toFixed(1) : "0.0";
                  const barW  = (link.clicks / maxClicks) * 100;
                  return (
                    <div key={link.id} className={styles.tableRow + (transitioning ? " " + styles.fading : "")}>
                      <div className={styles.tableRank}>{i + 1}</div>
                      <div className={styles.tableLink}>
                        <span className={styles.tableLinkTitle}>{link.title}</span>
                        <div className={styles.tableBarTrack}><div className={styles.tableBarFill} style={{ width:`${barW}%` }} /></div>
                      </div>
                      <div className={styles.tableClicks}>{formatCompact(link.clicks)}</div>
                      <div className={styles.tableShare}>{share}%</div>
                    </div>
                  );
                })}
            {!loading && activeLinks.length === 0 && (
              <p className={styles.noData}>No link data yet — share your profile to get started.</p>
            )}
          </div>
        </article>

        {/* DAY-OF-WEEK HEATMAP */}
        <article className={styles.heatCard + " glass card"}>
          <div className="section-head">
            <p className="eyebrow">Traffic by weekday</p>
            <h2 className={styles.chartTitle}>Best days</h2>
            <p className={styles.heatSubtitle}>{rangeLabel} data</p>
          </div>
          <div className={styles.heatGrid + (transitioning ? " " + styles.fading : "")}>
            {(loading ? Array.from({ length: 7 }) : data!.dowBuckets).map((b, i) => {
              if (loading) return (
                <div key={i} className={styles.heatBar}>
                  <div className={"skeleton " + styles.heatFill} style={{ height: `${20 + Math.random() * 60}%` }} />
                  <span className={styles.heatLabel}>{DOW_LABELS[i]}</span>
                </div>
              );
              const bucket = b as { dow: number; total: number };
              const pct = (bucket.total / maxDow) * 100;
              return (
                <div key={bucket.dow} className={styles.heatBar} title={`${DOW_LABELS[bucket.dow]}: ${bucket.total} views`}>
                  <div className={styles.heatFill} style={{ height:`${Math.max(pct, 6)}%` }} />
                  <span className={styles.heatLabel}>{DOW_LABELS[bucket.dow]}</span>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
}
