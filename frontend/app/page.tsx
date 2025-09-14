import LandingPage from "@/components/main/landing-page";
import MobileApp from "@/components/main/mobile-app";
import { appConfig } from "@/lib/app-config";

export default function HomePage() {
  if (appConfig.mode === "native") {
    return <MobileApp />;
  }
  return <LandingPage />;
}
