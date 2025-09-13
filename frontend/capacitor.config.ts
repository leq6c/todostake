import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize, KeyboardStyle } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.cinnon.todohabit",
  appName: "todohabit",
  webDir: "out",
  plugins: {
    Keyboard: {
      resize: KeyboardResize.None,
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      // Optional: supply client IDs via env if you have them handy
      // For native iOS/Android, prefer using platform-specific client IDs and URL schemes
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      iosClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.NEXT_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    },
    FirebaseAuthentication: {
      // Use native providers only to obtain credentials; sign into Web SDK explicitly.
      skipNativeAuth: false,
      providers: ["google.com"],
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    },
  },
};

export default config;
