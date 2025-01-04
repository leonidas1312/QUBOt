import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        className={`h-8 w-8 ${
          theme === "light" ? "bg-accent" : "bg-background"
        }`}
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light theme</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`h-8 w-8 ${
          theme === "dark" ? "bg-accent" : "bg-background"
        }`}
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark theme</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`h-8 w-8 ${
          theme === "system" ? "bg-accent" : "bg-background"
        }`}
        onClick={() => setTheme("system")}
      >
        <Monitor className="h-4 w-4" />
        <span className="sr-only">System theme</span>
      </Button>
    </div>
  )
}