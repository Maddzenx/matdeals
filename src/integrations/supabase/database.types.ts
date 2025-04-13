export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          instructions: string[]
          category: string
          created_at: string | null
          ingredients: Json
          image_url?: string
          time_minutes?: number | null
          servings?: number | null
          difficulty?: string | null
          source_url?: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructions: string[]
          category: string
          created_at?: string | null
          ingredients: Json
          image_url?: string
          time_minutes?: number | null
          servings?: number | null
          difficulty?: string | null
          source_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructions?: string[]
          category?: string
          created_at?: string | null
          ingredients?: Json
          image_url?: string
          time_minutes?: number | null
          servings?: number | null
          difficulty?: string | null
          source_url?: string | null
        }
      }
    }
    Functions: {
      scrape_willys_products: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      scrape_recipes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      scrape_ica: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      scrape_hemkop: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
  }
} 