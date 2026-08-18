import React from "react";

/** Parse a 6-digit hex color to rgb components */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export function computeBtnStyle(
  btnStyle: string,
  btnRadius: string,
  btnColor: string | null,
  btnTextColor: string | null
): React.CSSProperties {
  if (btnStyle === "default") return {};

  const vars: Record<string, string> = {};

  const color   = btnColor    || "#FFFFFF";
  const textColor = btnTextColor || "#000000";
  const rgb = hexToRgb(color);
  const r = rgb?.r ?? 255;
  const g = rgb?.g ?? 255;
  const b = rgb?.b ?? 255;

  // 1. Text Color
  vars["--pub-link-color"] = textColor;

  // 2. Corner Radius
  if (btnRadius !== "default") {
    if (btnRadius === "square")  vars["--pub-link-radius"] = "0px";
    if (btnRadius === "rounded") vars["--pub-link-radius"] = "8px";
    if (btnRadius === "pill")    vars["--pub-link-radius"] = "999px";
  }

  // 3. Style
  if (btnStyle === "solid") {
    vars["--pub-link-bg"]           = `rgb(${r},${g},${b})`;
    vars["--pub-link-border"]       = `rgba(${r},${g},${b},0.85)`;
    vars["--pub-link-backdrop"]     = "none";
    vars["--pub-link-shadow"]       = "none";
    vars["--pub-link-hover-bg"]     = `rgba(${r},${g},${b},0.88)`;
    vars["--pub-link-hover-border"] = `rgba(${r},${g},${b},1)`;
  }
  else if (btnStyle === "glass") {
    // Frosted glass: top-edge white shimmer (always visible) + color tint below
    // + real backdrop-filter blur (shows depth when custom image/gradient bg is behind it)
    vars["--pub-link-bg"]           = `linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(${r},${g},${b},0.16) 55%, rgba(${r},${g},${b},0.08) 100%)`;
    vars["--pub-link-border"]       = `rgba(255,255,255,0.50)`;
    vars["--pub-link-backdrop"]     = "blur(20px)";
    vars["--pub-link-shadow"]       = `0 4px 20px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.60)`;
    vars["--pub-link-hover-bg"]     = `linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(${r},${g},${b},0.24) 55%, rgba(${r},${g},${b},0.14) 100%)`;
    vars["--pub-link-hover-border"] = `rgba(255,255,255,0.70)`;
  }
  else if (btnStyle === "outline") {
    vars["--pub-link-bg"]           = "transparent";
    vars["--pub-link-border"]       = `rgba(${r},${g},${b},0.9)`;
    vars["--pub-link-backdrop"]     = "none";
    vars["--pub-link-shadow"]       = "none";
    vars["--pub-link-hover-bg"]     = `rgba(${r},${g},${b},0.12)`;
    vars["--pub-link-hover-border"] = `rgba(${r},${g},${b},1)`;
  }

  return vars as React.CSSProperties;
}
