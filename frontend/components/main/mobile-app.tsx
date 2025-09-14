"use client"

import TodoAppMain from "@/components/app"
import { useEffect } from "react";
import { SafeArea } from "capacitor-plugin-safe-area";

export default function HomePage() {
  useEffect(() => {
        (async function(){
            const safeAreaData = await SafeArea.getSafeAreaInsets();
            const {insets} = safeAreaData;
            for (const [key, value] of Object.entries(insets)) {
                document.documentElement.style.setProperty(
                    `--safe-area-inset-${key}`,
                    `${value}px`,
                );
            }
        })()
    }, []);

    return <TodoAppMain floatingMode={false} />;
}
