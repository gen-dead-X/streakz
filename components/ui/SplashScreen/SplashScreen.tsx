"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import lottieData from "../../../public/lottie/Loading_Lottie.json";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            /* Very light tint: 14% brand blended into the page bg — soft, themed, not saturated */
            backgroundColor:
              "color-mix(in srgb, var(--color-brand) 14%, var(--color-bg-page))",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Lottie — 3× original 180 px = 540 px */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ width: 540, height: 540 }}
            className="flex flex-col items-center justify-center mt-[-64px]"
          >
            <Lottie animationData={lottieData} loop autoplay />
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--color-brand)",
                marginTop: -64,
                fontFamily: "var(--font-family-sans)",
                userSelect: "none",
              }}
            >
              StreakZ
            </motion.span>
          </motion.div>
          {/* Brand name */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
