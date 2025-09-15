"use client";

import { useState, useEffect, useRef } from "react";

export function useUIState(activeList?: string) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1200;
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
      // When transitioning to mobile, ensure sidebar is closed so it doesn't get stuck open
      if (nowMobile) {
        setSidebarOpen(false);
      }
      if (isLargeScreen && activeList !== "reliability") {
        setRightPanelOpen(true);
      } else {
        setRightPanelOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeList]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 250 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return {
    // State
    sidebarOpen,
    sidebarWidth,
    isResizing,
    rightPanelOpen,
    isMobile,
    sidebarRef,
    // Actions
    setSidebarOpen,
    setSidebarWidth,
    setIsResizing,
    setRightPanelOpen,
  };
}
