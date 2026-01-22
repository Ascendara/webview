import { Loader } from "lucide-react"
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin" />
      </div>
    </div>
  )
}
