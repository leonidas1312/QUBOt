export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      community_results: {
        Row: {
          comment: string
          created_at: string
          description: string
          email: string
          id: string
          timestamp: string
        }
        Insert: {
          comment: string
          created_at?: string
          description: string
          email: string
          id?: string
          timestamp?: string
        }
        Update: {
          comment?: string
          created_at?: string
          description?: string
          email?: string
          id?: string
          timestamp?: string
        }
        Relationships: []
      }
      datasets: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          format: string | null
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          format?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          format?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hardware_providers: {
        Row: {
          availability: boolean
          base_cost_per_hour: number | null
          cloud_provider: string | null
          cost_per_hour: number
          description: string | null
          id: string
          instance_type: string | null
          markup_percentage: number | null
          name: string
          provider_type: string
          specs: Json
        }
        Insert: {
          availability?: boolean
          base_cost_per_hour?: number | null
          cloud_provider?: string | null
          cost_per_hour: number
          description?: string | null
          id?: string
          instance_type?: string | null
          markup_percentage?: number | null
          name: string
          provider_type: string
          specs?: Json
        }
        Update: {
          availability?: boolean
          base_cost_per_hour?: number | null
          cloud_provider?: string | null
          cost_per_hour?: number
          description?: string | null
          id?: string
          instance_type?: string | null
          markup_percentage?: number | null
          name?: string
          provider_type?: string
          specs?: Json
        }
        Relationships: []
      }
      optimization_jobs: {
        Row: {
          created_at: string
          dataset_id: string
          error_message: string | null
          id: string
          logs: string[] | null
          parameters: Json | null
          results: Json | null
          solver_id: string
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset_id: string
          error_message?: string | null
          id?: string
          logs?: string[] | null
          parameters?: Json | null
          results?: Json | null
          solver_id: string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset_id?: string
          error_message?: string | null
          id?: string
          logs?: string[] | null
          parameters?: Json | null
          results?: Json | null
          solver_id?: string
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "optimization_jobs_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "optimization_jobs_solver_id_fkey"
            columns: ["solver_id"]
            isOneToOne: false
            referencedRelation: "solvers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          github_username: string | null
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          github_username?: string | null
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          github_username?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      solver_guidelines: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      solver_likes: {
        Row: {
          created_at: string
          id: string
          solver_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          solver_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          solver_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solver_likes_solver_id_fkey"
            columns: ["solver_id"]
            isOneToOne: false
            referencedRelation: "solvers"
            referencedColumns: ["id"]
          },
        ]
      }
      solvers: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          id: string
          name: string
          solver_parameters: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          name: string
          solver_parameters?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          name?: string
          solver_parameters?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      job_status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
