import type { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { Timestamp } from "firebase/firestore"
import type { Todo, TodoList, Routine } from "@/types"

const toTs = (d?: Date | null | unknown) => {
  if (!d) return undefined
  if (d instanceof Date) return Timestamp.fromDate(d)
  return d as DocumentData // allow FieldValue like serverTimestamp
}

export const todoConverter: FirestoreDataConverter<Todo> = {
  toFirestore(todo: Todo): DocumentData {
    return {
      text: todo.text,
      completed: !!todo.completed,
      createdAt: toTs(todo.createdAt) ?? Timestamp.fromDate(new Date()),
      list: todo.list,
      dueDate: toTs(todo.dueDate) ?? null,
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
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()
    const dueDate = data.dueDate instanceof Timestamp ? data.dueDate.toDate() : undefined
    return {
      id: snapshot.id,
      text: data.text,
      completed: !!data.completed,
      createdAt,
      list: data.list || "tasks",
      dueDate,
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
      createdAt: toTs((r as any).createdAt) ?? Timestamp.fromDate(new Date()),
      description: (r as any).description ?? null,
      memo: (r as any).memo ?? null,
      streak: r.streak ?? 0,
      maxStreak: r.maxStreak ?? 0,
      completedDates: Array.isArray(r.completedDates) ? r.completedDates : [],
      stakeAmount: r.stakeAmount ?? null,
      stakeCurrency: r.stakeCurrency ?? null,
      maxAbsence: r.maxAbsence ?? null,
      endDate: toTs((r as any).endDate) ?? null,
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
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      description: data.description ?? undefined,
      memo: data.memo ?? undefined,
      streak: data.streak ?? 0,
      maxStreak: data.maxStreak ?? 0,
      completedDates: Array.isArray(data.completedDates) ? data.completedDates : [],
      stakeAmount: data.stakeAmount ?? undefined,
      stakeCurrency: data.stakeCurrency ?? undefined,
      maxAbsence: data.maxAbsence ?? undefined,
      endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : undefined,
      stopped: !!data.stopped,
      paused: !!data.paused,
      proverInstructions: data.proverInstructions ?? undefined,
      starred: !!data.starred,
    }
  },
}
