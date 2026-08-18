"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  style = {},
  duration = 0.75,
}: ScrollRevealProps) {
  const getInitial = () => {
    if (direction === "up") return { opacity: 0, y: 36, scale: 0.98 };
    if (direction === "down") return { opacity: 0, y: -36, scale: 0.98 };
    if (direction === "left") return { opacity: 0, x: -36, scale: 0.98 };
    if (direction === "right") return { opacity: 0, x: 36, scale: 0.98 };
    if (direction === "scale") return { opacity: 0, scale: 0.92, y: 20 };
    return { opacity: 0, y: 36, scale: 0.98 };
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1], // Apple/Vercel spring ease-out bezier curve
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
