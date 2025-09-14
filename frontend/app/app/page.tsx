"use client"

import TodoAppMain from "@/components/app"

export default function HomePage() {
  if (typeof window !== "undefined") {
    document.documentElement.style.setProperty("--safe-area-inset-top", "0.25em");
    document.documentElement.style.setProperty("--safe-area-inset-bottom", "0.5em");
  }
  return <TodoAppMain />
}
