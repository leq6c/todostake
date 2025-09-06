"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Todo, TodoList } from "@/types"
import { useReliabilityScore } from "@/hooks/use-reliability-score"
import { getTaskCompletionContext, generateReliabilityReason } from "@/utils/reliability-helpers"
import { db } from "@/lib/firebase"
import { todoConverter, listConverter } from "@/lib/converters"
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
} from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

export function useTodoOperations() {
  const { user } = useAuth()
  const { updateReliabilityScore } = useReliabilityScore()

  const [todos, setTodos] = useState<Todo[]>([])
  const [customLists, setCustomLists] = useState<TodoList[]>([])

  // Helpers
  const userTodosCol = useMemo(
    () => (user ? collection(db, "users", user.uid, "todos").withConverter(todoConverter) : null),
    [user],
  )
  const userListsCol = useMemo(
    () => (user ? collection(db, "users", user.uid, "lists").withConverter(listConverter) : null),
    [user],
  )

  const fromFirestoreTodo = useCallback((id: string, data: any): Todo => {
    const createdAt: Date = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()
    const dueDate: Date | undefined = data.dueDate instanceof Timestamp ? data.dueDate.toDate() : undefined
    return {
      id,
      text: data.text,
      completed: !!data.completed,
      createdAt,
      list: data.list || "tasks",
      dueDate,
      starred: !!data.starred,
      stakeAmount: data.stakeAmount,
      stakeCurrency: data.stakeCurrency,
    }
  }, [])

  useEffect(() => {
    if (!user || !userTodosCol || !userListsCol) {
      setTodos([])
      setCustomLists([])
      return
    }

    const unsubTodos = onSnapshot(query(userTodosCol), (snap) => {
      const next: Todo[] = []
      snap.forEach((d) => next.push(d.data()))
      setTodos(next)
    })

    const unsubLists = onSnapshot(query(userListsCol), (snap) => {
      const next: TodoList[] = []
      snap.forEach((d) => {
        if (d.id === "__seeded") return
        next.push(d.data())
      })
      setCustomLists(next)
    })

    return () => {
      unsubTodos()
      unsubLists()
    }
  }, [user, userTodosCol, userListsCol, fromFirestoreTodo])

  const addTodo = useCallback(
    async (
      text: string,
      activeList: string,
      stakeAmount?: number,
      stakeCurrency?: string,
      proverInstructions?: string,
      dueDate?: Date,
    ) => {
      if (!user || !userTodosCol) return
      const now = new Date()
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayStr = todayOnly.toISOString().split("T")[0]

      const payload: any = {
        text,
        completed: false,
        createdAt: serverTimestamp(),
        list: activeList,
        starred: false,
      }
      if (typeof stakeAmount === "number" && stakeAmount > 0) {
        payload.stakeAmount = stakeAmount
        payload.stakeCurrency = stakeCurrency || "SOL"
      }
      if (proverInstructions && proverInstructions.trim()) {
        payload.proverInstructions = proverInstructions.trim()
      }
      if (dueDate instanceof Date) {
        payload.dueDate = dueDate
      }
      // Behavior based on current view
      if (activeList === "today") {
        payload.todayAddedOn = todayStr
      } else if (activeList === "planned") {
        payload.dueDate = todayOnly
      }
      await addDoc(userTodosCol, payload as any)
      toast({ title: "Task added" })
    },
    [user, userTodosCol],
  )

  const toggleTodo = useCallback(
    async (id: string) => {
      if (!user || !userTodosCol) return
      const current = todos.find((t) => t.id === id)
      if (!current) return
      const newCompleted = !current.completed
      await updateDoc(doc(userTodosCol, id), { completed: newCompleted })

      // Update reliability score (frontend only)
      const updatedTemp = { ...current, completed: newCompleted }
      const context = getTaskCompletionContext(updatedTemp)
      const action = newCompleted ? "complete_task" : "miss_task"
      const reason = generateReliabilityReason(action, updatedTemp.text, context)
      updateReliabilityScore(action, reason, context)
    },
    [user, userTodosCol, todos, updateReliabilityScore],
  )

  const deleteTodo = useCallback(
    async (id: string) => {
      if (!user || !userTodosCol) return
      await deleteDoc(doc(userTodosCol, id))
      toast({ title: "Task deleted" })
    },
    [user, userTodosCol],
  )

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Todo>) => {
      if (!user || !userTodosCol) return
      const toUpdate: Record<string, any> = { ...updates }
      if (updates.dueDate instanceof Date || updates.dueDate === null) {
        toUpdate.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null
      }
      if (updates.createdAt instanceof Date) {
        toUpdate.createdAt = Timestamp.fromDate(updates.createdAt)
      }
      await updateDoc(doc(userTodosCol, id), toUpdate)
    },
    [user, userTodosCol],
  )

  const toggleStar = useCallback(
    async (id: string) => {
      if (!user || !userTodosCol) return
      const current = todos.find((t) => t.id === id)
      if (!current) return
      await updateDoc(doc(userTodosCol, id), { starred: !current.starred })
    },
    [user, userTodosCol, todos],
  )

  const addCustomList = useCallback(
    async (name: string, color: string) => {
      if (!user || !userListsCol) return
      const id = name.toLowerCase().replace(/\s+/g, "-")
      await setDoc(doc(userListsCol, id), { id, name, color })
      toast({ title: "List created", description: name })
    },
    [user, userListsCol],
  )

  const deleteCustomList = useCallback(
    async (id: string) => {
      if (!user || !userListsCol || !userTodosCol) return
      // Delete todos that belong to this list then the list doc
      const qy = query(userTodosCol, where("list", "==", id))
      const batch = writeBatch(db)
      const { getDocs } = await import("firebase/firestore")
      const snap = await getDocs(qy)
      snap.forEach((d) => batch.delete(d.ref))
      batch.delete(doc(userListsCol, id))
      await batch.commit()
      toast({ title: "List deleted" })
    },
    [user, userListsCol, userTodosCol],
  )

  // Seed default lists once for new users
  useEffect(() => {
    if (!user || !userListsCol) return
    let done = false
    const seed = async () => {
      try {
        const seededRef = doc(collection(db, "users", user.uid, "lists"), "__seeded")
        const { getDoc, getDocs } = await import("firebase/firestore")
        const seededSnap = await getDoc(seededRef)
        if (seededSnap.exists()) return
        const listsSnap = await getDocs(query(userListsCol))
        if (listsSnap.empty) {
          await setDoc(doc(userListsCol, "work"), { id: "work", name: "Work", color: "bg-blue-500" })
          await setDoc(doc(userListsCol, "personal"), { id: "personal", name: "Personal", color: "bg-green-500" })
          await setDoc(seededRef, { at: serverTimestamp() })
        }
      } catch {
        // ignore seeding errors
      }
    }
    if (!done) {
      done = true
      void seed()
    }
  }, [user, userListsCol])

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
  }
}
