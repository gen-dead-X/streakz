"use client";
import { useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import lottieData from "../../../public/lottie/Loading_Lottie.json";

// Read data-mode synchronously before first paint to avoid bg flash.
const useDarkMode = () => {
  const [dark, setDark] = useState(true);

  useLayoutEffect(() => {
    const read = () =>
      document.documentElement.getAttribute("data-mode") !== "light";
    setDark(read());

    const observer = new MutationObserver(() => setDark(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode"],
    });
    return () => observer.disconnect();
  }, []);

  return dark;
};

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const dark = useDarkMode();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const bg = dark ? "#0d0d0d" : "#f5f5f5";
  const textColor = dark ? "#ffffff" : "#0a0a0a";

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
            backgroundColor: bg,
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
                color: textColor,
                marginTop: -64,
                fontFamily: "var(--font-family-sans)",
                userSelect: "none",
              }}
            >
              StreakZ
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
