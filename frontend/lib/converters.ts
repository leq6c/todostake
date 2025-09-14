import type { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import type { Todo, TodoList, Routine } from "@/types"

// Convert various Firestore/JS date-like inputs to epoch ms number
const toMillis = (d: any): number | undefined => {
  if (d == null) return undefined
  if (typeof d === "number") return d
  if (d instanceof Date) return d.getTime()
  if (typeof d === "string") {
    const t = Date.parse(d)
    return Number.isNaN(t) ? undefined : t
  }
  // Firestore Timestamp-like (duck typing for toMillis/toDate)
  if (d && typeof d.toMillis === "function") return d.toMillis()
  if (d && typeof d.toDate === "function") return (d.toDate() as Date).getTime()
  return undefined
}

export const todoConverter: FirestoreDataConverter<Todo> = {
  toFirestore(todo: Todo): DocumentData {
    return {
      text: todo.text,
      completed: !!todo.completed,
      // store as epoch ms
      createdAt: typeof todo.createdAt === "number" ? todo.createdAt : Date.now(),
      list: todo.list,
      dueDate: typeof todo.dueDate === "number" ? todo.dueDate : null,
      starred: !!todo.starred,
      stakeAmount: todo.stakeAmount ?? null,
      stakeCurrency: todo.stakeCurrency ?? null,
      memo: todo.memo ?? null,
      proverInstructions: todo.proverInstructions ?? null,
      todayAddedOn: todo.todayAddedOn ?? null,
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Todo {
    const data = snapshot.data()
    const createdAt = toMillis(data.createdAt) ?? Date.now()
    const dueDate = toMillis(data.dueDate)
    return {
      id: snapshot.id,
      text: data.text,
      completed: !!data.completed,
      createdAt,
      list: data.list || "tasks",
      dueDate: typeof dueDate === "number" ? dueDate : undefined,
      starred: !!data.starred,
      stakeAmount: data.stakeAmount ?? undefined,
      stakeCurrency: data.stakeCurrency ?? undefined,
      memo: data.memo ?? undefined,
      proverInstructions: data.proverInstructions ?? undefined,
      todayAddedOn: data.todayAddedOn ?? undefined,
    }
  },
}

export const listConverter: FirestoreDataConverter<TodoList> = {
  toFirestore(list: TodoList): DocumentData {
    return { id: list.id, name: list.name, color: list.color }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): TodoList {
    const data = snapshot.data()
    return { id: data.id ?? snapshot.id, name: data.name, color: data.color }
  },
}

export const routineConverter: FirestoreDataConverter<Routine> = {
  toFirestore(r: Routine): DocumentData {
    return {
      name: r.name,
      type: r.type,
      createdAt: typeof (r as any).createdAt === "number" ? (r as any).createdAt : Date.now(),
      description: (r as any).description ?? null,
      memo: (r as any).memo ?? null,
      streak: r.streak ?? 0,
      maxStreak: r.maxStreak ?? 0,
      completedDates: Array.isArray(r.completedDates) ? r.completedDates : [],
      stakeAmount: r.stakeAmount ?? null,
      stakeCurrency: r.stakeCurrency ?? null,
      maxAbsence: r.maxAbsence ?? null,
      endDate: typeof (r as any).endDate === "number" ? (r as any).endDate : null,
      stopped: !!r.stopped,
      paused: !!r.paused,
      proverInstructions: r.proverInstructions ?? null,
      starred: !!r.starred,
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Routine {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      name: data.name,
      type: data.type,
      createdAt: toMillis(data.createdAt) ?? Date.now(),
      description: data.description ?? undefined,
      memo: data.memo ?? undefined,
      streak: data.streak ?? 0,
      maxStreak: data.maxStreak ?? 0,
      completedDates: Array.isArray(data.completedDates) ? data.completedDates : [],
      stakeAmount: data.stakeAmount ?? undefined,
      stakeCurrency: data.stakeCurrency ?? undefined,
      maxAbsence: data.maxAbsence ?? undefined,
      endDate: (() => {
        const v = toMillis(data.endDate)
        return typeof v === "number" ? v : undefined
      })(),
      stopped: !!data.stopped,
      paused: !!data.paused,
      proverInstructions: data.proverInstructions ?? undefined,
      starred: !!data.starred,
    }
  },
}
