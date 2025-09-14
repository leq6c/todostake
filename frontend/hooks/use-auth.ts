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
import { Preferences } from "@capacitor/preferences";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    // Try to prime from last known user for offline reloads
    try {
      let raw =
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

    if (Capacitor.isNativePlatform()) {
      (async () => {
        const userRaw = (await Preferences.get({ key: "wb:lastUser" })).value;
        if (userRaw) {
          const user = JSON.parse(userRaw);
          console.log("setUser[native]", user);
          setUser(user as unknown as User);
          setLoading(false);
        }
      })();
    }

    FirebaseAuthentication.addListener("authStateChange", async (state) => {
      console.log("====onAuthSatteChange", state);
      console.log("====onAuthSatteChangeUser", state.user);
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
          if (Capacitor.isNativePlatform()) {
            await Preferences.set({
              key: "wb:lastUser",
              value: JSON.stringify(payload),
            });
          } else {
            localStorage.setItem("wb:lastUser", JSON.stringify(payload));
          }
        } else {
          if (Capacitor.isNativePlatform()) {
            await Preferences.remove({ key: "wb:lastUser" });
          } else {
            localStorage.removeItem("wb:lastUser");
          }
        }
      } catch {}
    });

    if (!Capacitor.isNativePlatform()) {
      const unsub = auth.onAuthStateChanged(async (u) => {
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
            if (Capacitor.isNativePlatform()) {
              await Preferences.set({
                key: "wb:lastUser",
                value: JSON.stringify(payload),
              });
            } else {
              localStorage.setItem("wb:lastUser", JSON.stringify(payload));
            }
          } else {
            if (Capacitor.isNativePlatform()) {
              await Preferences.remove({ key: "wb:lastUser" });
            } else {
              localStorage.removeItem("wb:lastUser");
            }
          }
        } catch {}
      });
      return () => unsub();
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    // Use native Google Sign-In inside Capacitor apps to avoid popup/CORS issues
    /*
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
    }*/

    if (Capacitor.isNativePlatform()) {
      // Native fallback
      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log("====signInWithGoogle result", result);
      console.log("====signInWithGoogle result user", result.user);
      console.log(result);
      if (result.user) {
        setUser(result.user as unknown as User);
      }
    } else {
      // Web fallback
      await signInWithPopup(auth, googleProvider);
    }
  }, []);

  const signInGuest = useCallback(async () => {
    setError(null);
    if (Capacitor.isNativePlatform()) {
      const result = await FirebaseAuthentication.signInAnonymously();
      if (result.user) {
        setUser(result.user as unknown as User);
      }
    } else {
      await signInAnonymously(auth);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await FirebaseAuthentication.signOut();
        await Preferences.remove({ key: "wb:lastUser" });
      } else {
        await firebaseSignOut(auth);
        localStorage.removeItem("wb:lastUser");
      }
    } catch {}
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setError(null);
      if (Capacitor.isNativePlatform()) {
        const cred =
          await FirebaseAuthentication.createUserWithEmailAndPassword({
            email,
            password,
          });
        if (displayName) {
          await updateProfile(cred.user as unknown as User, { displayName });
        }
      } else {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
      }
    },
    []
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      if (Capacitor.isNativePlatform()) {
        await FirebaseAuthentication.signInWithEmailAndPassword({
          email,
          password,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    },
    []
  );

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.sendPasswordResetEmail({ email });
    } else {
      await sendPasswordResetEmail(auth, email);
    }
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
