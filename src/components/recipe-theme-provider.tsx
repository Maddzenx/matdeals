import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type RecipeThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type RecipeThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: RecipeThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const RecipeThemeProviderContext = createContext<RecipeThemeProviderState>(initialState)

export function RecipeThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-recipe-theme",
  ...props
}: RecipeThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <RecipeThemeProviderContext.Provider {...props} value={value}>
      {children}
    </RecipeThemeProviderContext.Provider>
  )
}

export const useRecipeTheme = () => {
  const context = useContext(RecipeThemeProviderContext)

  if (context === undefined)
    throw new Error("useRecipeTheme must be used within a RecipeThemeProvider")

  return context
} 