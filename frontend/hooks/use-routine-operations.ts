"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Routine } from "@/types";
import { useReliabilityScore } from "@/hooks/use-reliability-score";
import {
  getRoutineCompletionContext,
  generateReliabilityReason,
} from "@/utils/reliability-helpers";
import { db } from "@/lib/firebase";
import { routineConverter } from "@/lib/converters";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";
import { FirebaseFirestore } from "@capacitor-firebase/firestore";

export function useRoutineOperations() {
  const { user } = useAuth();
  const { updateReliabilityScore } = useReliabilityScore();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const cacheRoutinesKey = user ? `wb:cache:${user.uid}:routines` : null;

  const routinesCol = useMemo(
    () =>
      user
        ? collection(db, "users", user.uid, "routines").withConverter(
            routineConverter
          )
        : null,
    [user]
  );

  useEffect(() => {
    if (!user || !routinesCol) {
      setRoutines([]);
      setLoading(false);
      return;
    }

    // Prime from localStorage cache for offline-first UX when IndexedDB is unavailable
    try {
      if (cacheRoutinesKey) {
        const raw = localStorage.getItem(cacheRoutinesKey);
        if (raw) {
          setRoutines(JSON.parse(raw));
          setLoading(false);
        }
      }
    } catch {}

    if (Capacitor.isNativePlatform()) {
      let listenerId: string | null = null;
      void FirebaseFirestore.addCollectionSnapshotListener(
        { reference: routinesCol.path },
        (event) => {
          const next: Routine[] = [];
          for (const s of event?.snapshots ?? []) {
            const d = s.data as any;
            next.push({
              id: s.id,
              name: d.name,
              type: d.type,
              createdAt: d.createdAt ?? new Date(),
              description: d.description ?? undefined,
              memo: d.memo ?? undefined,
              streak: d.streak ?? 0,
              maxStreak: d.maxStreak ?? 0,
              completedDates: Array.isArray(d.completedDates)
                ? d.completedDates
                : [],
              stakeAmount: d.stakeAmount ?? undefined,
              stakeCurrency: d.stakeCurrency ?? undefined,
              maxAbsence: d.maxAbsence ?? undefined,
              endDate: d.endDate ?? undefined,
              stopped: !!d.stopped,
              paused: !!d.paused,
              proverInstructions: d.proverInstructions ?? undefined,
              starred: !!d.starred,
            });
          }
          setRoutines(next);
          setLoading(false);
          try {
            if (cacheRoutinesKey)
              localStorage.setItem(cacheRoutinesKey, JSON.stringify(next));
          } catch {}
        }
      ).then((id) => (listenerId = id));
      return () => {
        if (listenerId)
          void FirebaseFirestore.removeSnapshotListener({ id: listenerId });
      };
    }

    const unsub = onSnapshot(query(routinesCol), (snap) => {
      const next: Routine[] = [];
      snap.forEach((d) => next.push(d.data()));
      setRoutines(next);
      setLoading(false);
      try {
        if (cacheRoutinesKey)
          localStorage.setItem(cacheRoutinesKey, JSON.stringify(next));
      } catch {}
    });
    return () => unsub();
  }, [user, routinesCol]);

  const addRoutine = useCallback(
    async (
      name: string,
      type: Routine["type"],
      stakeAmount?: number,
      stakeCurrency?: string,
      maxAbsence?: number,
      proverInstructions?: string,
      endDate?: Date
    ) => {
      if (!user || !routinesCol) return;
      const id = doc(routinesCol).id;
      const payload: Routine = {
        id,
        name,
        type,
        createdAt: new Date(),
        streak: 0,
        maxStreak: 0,
        completedDates: [],
        stakeAmount: stakeAmount ?? undefined,
        stakeCurrency: stakeCurrency ?? undefined,
        maxAbsence: maxAbsence ?? undefined,
        proverInstructions: proverInstructions ?? undefined,
        endDate: endDate ?? undefined,
        starred: false,
      };
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.setDocument({
          reference: `${routinesCol.path}/${id}`,
          data: payload as any,
        });
      } else {
        await setDoc(doc(routinesCol, id), payload);
      }
    },
    [user, routinesCol]
  );

  const updateRoutine = useCallback(
    async (id: string, updates: Partial<Routine>) => {
      if (!user || !routinesCol) return;
      const toUpdate: Record<string, any> = { ...updates };
      // filter out id field
      delete toUpdate.id;
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.updateDocument({
          reference: `${routinesCol.path}/${id}`,
          data: toUpdate,
        });
      } else {
        await updateDoc(doc(routinesCol, id), toUpdate);
      }
    },
    [user, routinesCol]
  );

  const deleteRoutine = useCallback(
    async (id: string) => {
      if (!user || !routinesCol) return;
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.deleteDocument({
          reference: `${routinesCol.path}/${id}`,
        });
      } else {
        await deleteDoc(doc(routinesCol, id));
      }
    },
    [user, routinesCol]
  );

  const toggleRoutine = useCallback(
    async (id: string) => {
      if (!user || !routinesCol) return;
      const current = routines.find((r) => r.id === id);
      if (!current) return;
      const today = new Date().toISOString().split("T")[0];
      const isCompletedToday = current.completedDates.includes(today);

      const context = getRoutineCompletionContext(current);
      if (isCompletedToday) {
        const action = "miss_routine";
        const reason = generateReliabilityReason(action, current.name, context);
        updateReliabilityScore(action, reason, context);

        const newDates = current.completedDates.filter((d) => d !== today);
        if (Capacitor.isNativePlatform()) {
          await FirebaseFirestore.updateDocument({
            reference: `${routinesCol.path}/${id}`,
            data: {
              completedDates: newDates,
              streak: Math.max(0, current.streak - 1),
            },
          });
        } else {
          await updateDoc(doc(routinesCol, id), {
            completedDates: newDates,
            streak: Math.max(0, current.streak - 1),
          });
        }
      } else {
        const action = "complete_routine";
        const reason = generateReliabilityReason(action, current.name, context);
        updateReliabilityScore(action, reason, context);

        const newStreak = current.streak + 1;
        if (Capacitor.isNativePlatform()) {
          await FirebaseFirestore.updateDocument({
            reference: `${routinesCol.path}/${id}`,
            data: {
              completedDates: [...current.completedDates, today],
              streak: newStreak,
              maxStreak: Math.max(current.maxStreak, newStreak),
            },
          });
        } else {
          await updateDoc(doc(routinesCol, id), {
            completedDates: [...current.completedDates, today],
            streak: newStreak,
            maxStreak: Math.max(current.maxStreak, newStreak),
          });
        }
      }
    },
    [user, routinesCol, routines, updateReliabilityScore]
  );

  const stopRoutine = useCallback(
    async (id: string) => {
      if (!user || !routinesCol) return;
      const current = routines.find((r) => r.id === id);
      if (current) {
        const context = getRoutineCompletionContext(current);
        const reason = generateReliabilityReason(
          "break_streak",
          current.name,
          context
        );
        updateReliabilityScore("break_streak", reason, context);
      }
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.updateDocument({
          reference: `${routinesCol.path}/${id}`,
          data: { stopped: true },
        });
      } else {
        await updateDoc(doc(routinesCol, id), { stopped: true });
      }
      toast({ title: "Routine stopped" });
    },
    [user, routinesCol, routines, updateReliabilityScore]
  );

  const pauseRoutine = useCallback(
    async (id: string) => {
      if (!user || !routinesCol) return;
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.updateDocument({
          reference: `${routinesCol.path}/${id}`,
          data: { paused: true },
        });
      } else {
        await updateDoc(doc(routinesCol, id), { paused: true });
      }
      toast({ title: "Routine paused" });
    },
    [user, routinesCol]
  );

  const toggleStar = useCallback(
    async (id: string) => {
      if (!user || !routinesCol) return;
      const current = routines.find((r) => r.id === id);
      if (!current) return;
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.updateDocument({
          reference: `${routinesCol.path}/${id}`,
          data: { starred: !current.starred },
        });
      } else {
        await updateDoc(doc(routinesCol, id), { starred: !current.starred });
      }
    },
    [user, routinesCol, routines]
  );

  return {
    routines,
    loading,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    toggleRoutine,
    stopRoutine,
    pauseRoutine,
    toggleStar,
  };
}
