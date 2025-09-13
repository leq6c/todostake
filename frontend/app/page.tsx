"use client"

import TodoAppMain from "@/components/app"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div
      className={
        "min-h-screen w-full bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.08),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(56,189,248,0.08),transparent_60%)] flex items-center justify-center p-3 md:p-6"
      }
    >
      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl font-medium">TodoHabit</div>
          <div className="text-lg text-muted-foreground">Keep your word or lose your stake.</div>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            Stake tokens on your tasks and routines. Complete them to get your stake back, or lose it if you
            don't. Prove completion by chatting with AI.
          </p>
        </div>

        <Button className="" onClick={() => router.push("/app")}>
          Enter Web App
        </Button>

        <div className="flex flex-col items-center gap-4 mt-2">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-md">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 px-3 bg-transparent"
              onClick={() => {
                /* TODO: Add download link */
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.175 1.219-5.175s-.312-.623-.312-1.544c0-1.446.839-2.525 1.883-2.525.888 0 1.317.666 1.317 1.466 0 .893-.568 2.229-.861 3.467-.245 1.04.522 1.887 1.55 1.887 1.861 0 3.314-1.963 3.314-4.795 0-2.507-1.799-4.263-4.370-4.263-2.976 0-4.727 2.234-4.727 4.546 0 .901.347 1.869.780 2.393.086.103.098.194.072.299-.079.33-.254 1.037-.289 1.183-.046.191-.151.232-.349.140-1.301-.605-2.115-2.507-2.115-4.032 0-3.306 2.403-6.344 6.931-6.344 3.636 0 6.462 2.592 6.462 6.056 0 3.615-2.279 6.524-5.441 6.524-1.062 0-2.063-.552-2.404-1.209 0 0-.526 2.006-.654 2.497-.237.914-.878 2.058-1.307 2.755C9.014 23.596 10.479 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
              </svg>
              <span className="text-xs font-medium">macOS</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 px-3 bg-transparent"
              onClick={() => {
                /* TODO: Add download link */
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.351" />
              </svg>
              <span className="text-xs font-medium">Windows</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 px-3 bg-transparent"
              onClick={() => {
                /* TODO: Add App Store link */
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="text-xs font-medium">iOS</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 px-3 bg-transparent"
              onClick={() => {
                /* TODO: Add Play Store link */
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.699 12l1.999-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
              </svg>
              <span className="text-xs font-medium">Android</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
