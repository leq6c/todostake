"use client"

import TodoAppMain from "@/components/app"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return <div
        className={
            "min-h-screen w-full bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.08),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(56,189,248,0.08),transparent_60%)] flex items-center justify-center p-3 md:p-6"
        }
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl font-medium">
            WordBond
          </div>

          <div className="text-lg text-muted-foreground">
            Keep your word or lose your stake.
          </div>

          <Button className="mt-4" onClick={() => router.push("/app")}>
            Enter App
          </Button>
        </div>
      </div>
  //return <TodoAppMain />
}
