"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Todo, TodoList } from "@/types";
import { useReliabilityScore } from "@/hooks/use-reliability-score";
import {
  getTaskCompletionContext,
  generateReliabilityReason,
} from "@/utils/reliability-helpers";
import { db } from "@/lib/firebase";
import { todoConverter, listConverter } from "@/lib/converters";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { FirebaseFirestore } from "@capacitor-firebase/firestore";
import { Capacitor } from "@capacitor/core";

export function useTodoOperations() {
  const { user } = useAuth();
  const { updateReliabilityScore } = useReliabilityScore();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [customLists, setCustomLists] = useState<TodoList[]>([]);
  // Local cache keys
  const cacheTodosKey = user ? `wb:cache:${user.uid}:todos` : null;
  const cacheListsKey = user ? `wb:cache:${user.uid}:lists` : null;

  // Helpers
  const userTodosCol = useMemo(
    () =>
      user
        ? collection(db, "users", user.uid, "todos").withConverter(
            todoConverter
          )
        : null,
    [user]
  );
  const userListsCol = useMemo(
    () =>
      user
        ? collection(db, "users", user.uid, "lists").withConverter(
            listConverter
          )
        : null,
    [user]
  );

  const fromFirestoreTodo = useCallback((id: string, data: any): Todo => {
    // createdAt may be Firestore Timestamp, JS Date, ISO string, or missing
    let createdAt: Date;
    if (data?.createdAt instanceof Timestamp) createdAt = data.createdAt.toDate();
    else if (data?.createdAt instanceof Date) createdAt = data.createdAt as Date;
    else if (typeof data?.createdAt === "string") createdAt = new Date(data.createdAt);
    else if (typeof data?.createdAt === "number") createdAt = new Date(data.createdAt);
    else createdAt = new Date();

    // dueDate normalization (Timestamp | Date | string | number | null)
    let dueDate: Date | undefined;
    if (data?.dueDate instanceof Timestamp) dueDate = data.dueDate.toDate();
    else if (data?.dueDate instanceof Date) dueDate = data.dueDate as Date;
    else if (typeof data?.dueDate === "string") dueDate = new Date(data.dueDate);
    else if (typeof data?.dueDate === "number") dueDate = new Date(data.dueDate);
    else dueDate = undefined;

    return {
      id,
      text: data?.text,
      completed: !!data?.completed,
      createdAt,
      list: data?.list || "tasks",
      dueDate,
      starred: !!data?.starred,
      stakeAmount: data?.stakeAmount ?? undefined,
      stakeCurrency: data?.stakeCurrency ?? undefined,
      memo: data?.memo ?? undefined,
      proverInstructions: data?.proverInstructions ?? undefined,
      todayAddedOn: data?.todayAddedOn ?? undefined,
    };
  }, []);

  useEffect(() => {
    if (!user || !userTodosCol || !userListsCol) {
      setTodos([]);
      setCustomLists([]);
      return;
    }

    // Prime from localStorage cache (for environments where Firestore persistence is unavailable)
    try {
      if (cacheTodosKey) {
        const raw = localStorage.getItem(cacheTodosKey);
        if (raw) setTodos(JSON.parse(raw));
      }
      if (cacheListsKey) {
        const raw = localStorage.getItem(cacheListsKey);
        if (raw) setCustomLists(JSON.parse(raw));
      }
    } catch {}

    if (Capacitor.isNativePlatform()) {
      let todosListenerId: string | null = null;
      let listsListenerId: string | null = null;

      // Native listeners
      void FirebaseFirestore.addCollectionSnapshotListener(
        { reference: userTodosCol.path },
        (event) => {
          try {
            const next: Todo[] = [];
            const snaps = event?.snapshots ?? [];
            for (const s of snaps) {
              const data = s.data ?? {};
              next.push(fromFirestoreTodo(s.id, data));
            }
            setTodos(next);
            try {
              if (cacheTodosKey)
                localStorage.setItem(cacheTodosKey, JSON.stringify(next));
            } catch {}
          } catch {}
        }
      ).then((id) => (todosListenerId = id));

      void FirebaseFirestore.addCollectionSnapshotListener(
        { reference: userListsCol.path },
        (event) => {
          try {
            const next: TodoList[] = [];
            const snaps = event?.snapshots ?? [];
            for (const s of snaps) {
              if (s.id === "__seeded") continue;
              const data = (s.data ?? {}) as any;
              next.push({
                id: data.id ?? s.id,
                name: data.name,
                color: data.color,
              });
            }
            setCustomLists(next);
            try {
              if (cacheListsKey)
                localStorage.setItem(cacheListsKey, JSON.stringify(next));
            } catch {}
          } catch {}
        }
      ).then((id) => (listsListenerId = id));

      return () => {
        if (todosListenerId)
          void FirebaseFirestore.removeSnapshotListener({
            id: todosListenerId,
          }).catch(() => {});
        if (listsListenerId)
          void FirebaseFirestore.removeSnapshotListener({
            id: listsListenerId,
          }).catch(() => {});
      };
    }

    // Web listeners
    const unsubTodos = onSnapshot(query(userTodosCol), (snap) => {
      const next: Todo[] = [];
      snap.forEach((d) => next.push(d.data()));
      setTodos(next);
      try {
        if (cacheTodosKey)
          localStorage.setItem(cacheTodosKey, JSON.stringify(next));
      } catch {}
    });

    const unsubLists = onSnapshot(query(userListsCol), (snap) => {
      const next: TodoList[] = [];
      snap.forEach((d) => {
        if (d.id === "__seeded") return;
        next.push(d.data());
      });
      setCustomLists(next);
      try {
        if (cacheListsKey)
          localStorage.setItem(cacheListsKey, JSON.stringify(next));
      } catch {}
    });

    return () => {
      unsubTodos();
      unsubLists();
    };
  }, [user, userTodosCol, userListsCol, fromFirestoreTodo]);

  const addTodo = useCallback(
    async (
      text: string,
      activeList: string,
      stakeAmount?: number,
      stakeCurrency?: string,
      proverInstructions?: string,
      dueDate?: Date
    ) => {
      if (!user || !userTodosCol) {
        console.log("addTodo: no user or userTodosCol");
        return;
      }
      const now = new Date();
      const todayOnly = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const todayStr = todayOnly.toISOString().split("T")[0];

      const payload: any = {
        text,
        completed: false,
        createdAt: serverTimestamp(),
        list: activeList,
        starred: false,
      };
      if (typeof stakeAmount === "number" && stakeAmount > 0) {
        payload.stakeAmount = stakeAmount;
        payload.stakeCurrency = stakeCurrency || "SOL";
      }
      if (proverInstructions && proverInstructions.trim()) {
        payload.proverInstructions = proverInstructions.trim();
      }
      if (dueDate instanceof Date) {
        payload.dueDate = dueDate;
      }
      // Behavior based on current view
      if (activeList === "today") {
        payload.todayAddedOn = todayStr;
      } else if (activeList === "planned") {
        payload.dueDate = todayOnly;
      }
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.addDocument({
          reference: userTodosCol.path,
          data: payload,
        });
      } else {
        await addDoc(userTodosCol, payload as any);
      }
      toast({ title: "Task added" });
    },
    [user, userTodosCol]
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      if (!user || !userTodosCol) return;
      const current = todos.find((t) => t.id === id);
      if (!current) return;
      const newCompleted = !current.completed;
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.updateDocument({
          reference: `${userTodosCol.path}/${id}`,
          data: { completed: newCompleted },
        });
      } else {
        await updateDoc(doc(userTodosCol, id), { completed: newCompleted });
      }

      // Update reliability score (frontend only)
      const updatedTemp = { ...current, completed: newCompleted };
      const context = getTaskCompletionContext(updatedTemp);
      const action = newCompleted ? "complete_task" : "miss_task";
      const reason = generateReliabilityReason(
        action,
        updatedTemp.text,
        context
      );
      updateReliabilityScore(action, reason, context);
    },
    [user, userTodosCol, todos, updateReliabilityScore]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      if (!user || !userTodosCol) return;
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.deleteDocument({
          reference: `${userTodosCol.path}/${id}`,
        });
      } else {
        await deleteDoc(doc(userTodosCol, id));
      }
      //toast({ title: "Task deleted" })
    },
    [user, userTodosCol]
  );

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Todo>) => {
      if (!user || !userTodosCol) return;
      const toUpdateWeb: Record<string, any> = { ...updates };
      if (updates.dueDate instanceof Date || updates.dueDate === null) {
        toUpdateWeb.dueDate = updates.dueDate
          ? Timestamp.fromDate(updates.dueDate)
          : null;
      }
      if (updates.createdAt instanceof Date) {
        toUpdateWeb.createdAt = Timestamp.fromDate(updates.createdAt);
      }

      if (Capacitor.isNativePlatform()) {
        // For native plugin, prefer plain values
        const toUpdateNative: Record<string, any> = { ...updates };
        if (updates.dueDate instanceof Date || updates.dueDate === null) {
          toUpdateNative.dueDate = updates.dueDate ?? null;
        }
        if (updates.createdAt instanceof Date) {
          toUpdateNative.createdAt = updates.createdAt;
        }
        await FirebaseFirestore.updateDocument({
          reference: `${userTodosCol.path}/${id}`,
          data: toUpdateNative,
        });
      } else {
        await updateDoc(doc(userTodosCol, id), toUpdateWeb);
      }
    },
    [user, userTodosCol]
  );

  const toggleStar = useCallback(
    async (id: string) => {
      if (!user || !userTodosCol) return;
      const current = todos.find((t) => t.id === id);
      if (!current) return;
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.updateDocument({
          reference: `${userTodosCol.path}/${id}`,
          data: { starred: !current.starred },
        });
      } else {
        await updateDoc(doc(userTodosCol, id), { starred: !current.starred });
      }
    },
    [user, userTodosCol, todos]
  );

  const addCustomList = useCallback(
    async (name: string, color: string) => {
      if (!user || !userListsCol) return;
      const id = name.toLowerCase().replace(/\s+/g, "-");
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.setDocument({
          reference: `${userListsCol.path}/${id}`,
          data: { id, name, color },
        });
      } else {
        await setDoc(doc(userListsCol, id), { id, name, color });
      }
      toast({ title: "List created", description: name });
    },
    [user, userListsCol]
  );

  const deleteCustomList = useCallback(
    async (id: string) => {
      if (!user || !userListsCol || !userTodosCol) return;
      // Delete todos that belong to this list then the list doc
      if (Capacitor.isNativePlatform()) {
        const qy = {
          type: "where" as const,
          fieldPath: "list",
          opStr: "==" as const,
          value: id,
        };
        const result = await FirebaseFirestore.getCollection({
          reference: userTodosCol.path,
          compositeFilter: { type: "and", queries: [qy] },
        } as any);
        const operations: any[] = [];
        for (const s of result.snapshots ?? []) {
          operations.push({ type: "delete", reference: s.path });
        }
        operations.push({
          type: "delete",
          reference: `${userListsCol.path}/${id}`,
        });
        if (operations.length > 0) {
          await FirebaseFirestore.writeBatch({ operations });
        }
      } else {
        const qy = query(userTodosCol, where("list", "==", id));
        const batch = writeBatch(db);
        const { getDocs } = await import("firebase/firestore");
        const snap = await getDocs(qy);
        snap.forEach((d) => batch.delete(d.ref));
        batch.delete(doc(userListsCol, id));
        await batch.commit();
      }
      toast({ title: "List deleted" });
    },
    [user, userListsCol, userTodosCol]
  );

  // Seed default lists once for new users
  useEffect(() => {
    if (!user || !userListsCol) return;
    let done = false;
    const seed = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const basePath = `users/${user.uid}/lists`;
          const seededPath = `${basePath}/__seeded`;
          const seeded = await FirebaseFirestore.getDocument({
            reference: seededPath,
          });
          if (seeded.snapshot.data) return;
          const lists = await FirebaseFirestore.getCollection({
            reference: basePath,
          });
          if (!lists.snapshots || lists.snapshots.length === 0) {
            await FirebaseFirestore.setDocument({
              reference: `${basePath}/work`,
              data: { id: "work", name: "Work", color: "bg-blue-500" },
            });
            await FirebaseFirestore.setDocument({
              reference: `${basePath}/personal`,
              data: { id: "personal", name: "Personal", color: "bg-green-500" },
            });
            await FirebaseFirestore.setDocument({
              reference: seededPath,
              data: { at: new Date() },
            });
          }
        } else {
          const seededRef = doc(
            collection(db, "users", user.uid, "lists"),
            "__seeded"
          );
          const { getDoc, getDocs } = await import("firebase/firestore");
          const seededSnap = await getDoc(seededRef);
          if (seededSnap.exists()) return;
          const listsSnap = await getDocs(query(userListsCol));
          if (listsSnap.empty) {
            await setDoc(doc(userListsCol, "work"), {
              id: "work",
              name: "Work",
              color: "bg-blue-500",
            });
            await setDoc(doc(userListsCol, "personal"), {
              id: "personal",
              name: "Personal",
              color: "bg-green-500",
            });
            await setDoc(seededRef, { at: serverTimestamp() });
          }
        }
      } catch {
        // ignore seeding errors
      }
    };
    if (!done) {
      done = true;
      void seed();
    }
  }, [user, userListsCol]);

  return {
    todos,
    customLists,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    toggleStar,
    addCustomList,
    deleteCustomList,
  };
}
