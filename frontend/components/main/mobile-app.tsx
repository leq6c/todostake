"use client"

import TodoAppMain from "@/components/app"
import { useEffect } from "react";
import { SafeArea } from "capacitor-plugin-safe-area";
import { Capacitor } from "@capacitor/core";

export default function HomePage() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const updateSafeArea = (async function(){
        const safeAreaData = await SafeArea.getSafeAreaInsets();
        const {insets} = safeAreaData;
        for (const [key, value] of Object.entries(insets)) {
            document.documentElement.style.setProperty(
                `--safe-area-inset-${key}`,
                `${value}px`,
            );
        }
    });

    SafeArea.addListener("safeAreaChanged", ()=> { updateSafeArea(); });

    updateSafeArea();
    }, []);

    return <TodoAppMain floatingMode={false} />;
}
