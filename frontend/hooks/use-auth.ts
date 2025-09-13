"use client";

import { useEffect, useState, useCallback } from "react";
import { googleProvider } from "@/lib/firebase";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type User,
  getAuth,
} from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    // Try to prime from last known user for offline reloads
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("wb:lastUser")
          : null;
      if (raw) {
        // Minimal shape sufficient for our app (uid, email, displayName, isAnonymous)
        const cached = JSON.parse(raw);
        if (cached?.uid) {
          setUser(cached as unknown as User);
          setLoading(false);
        }
      }
    } catch {}

    FirebaseAuthentication.addListener("authStateChange", (state) => {
      console.log("====nativeeee");
      console.log("authStateChange", state);
      setUser(state.user as unknown as User);
      setLoading(false);

      try {
        const u = state.user as unknown as User;
        if (u) {
          const payload = {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            isAnonymous: u.isAnonymous,
          };
          localStorage.setItem("wb:lastUser", JSON.stringify(payload));
        } else {
          localStorage.removeItem("wb:lastUser");
        }
      } catch {}
    });

    const unsub = auth.onAuthStateChanged((u) => {
      console.log("====");
      console.log("onAuthStateChanged", u);
      setUser(u);
      setLoading(false);
      try {
        if (u) {
          const payload = {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            isAnonymous: u.isAnonymous,
          };
          localStorage.setItem("wb:lastUser", JSON.stringify(payload));
        } else {
          localStorage.removeItem("wb:lastUser");
        }
      } catch {}
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    // Use native Google Sign-In inside Capacitor apps to avoid popup/CORS issues
    if (Capacitor.isNativePlatform()) {
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      const accessToken = result.credential?.accessToken;
      if (!idToken && !accessToken) {
        throw new Error("Missing Google credential from native sign-in");
      }
      const { GoogleAuthProvider, signInWithCredential } = await import(
        "firebase/auth"
      );
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      await signInWithCredential(auth, credential);
      return;
    }

    // Web fallback
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signInGuest = useCallback(async () => {
    setError(null);
    //await signInAnonymously(auth);
    const result = await FirebaseAuthentication.signInAnonymously();
    if (result.user) {
      setUser(result.user as unknown as User);
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    try {
      localStorage.removeItem("wb:lastUser");
    } catch {}
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
    },
    []
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    await sendPasswordResetEmail(auth, email);
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInGuest,
    signOut,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
  };
}
