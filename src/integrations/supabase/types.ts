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
      block_connections: {
        Row: {
          configuration: Json | null
          created_at: string
          creator_id: string | null
          dataset_id: string | null
          description: string | null
          hardware_id: string | null
          id: string
          is_public: boolean | null
          name: string
          solver_id: string | null
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          creator_id?: string | null
          dataset_id?: string | null
          description?: string | null
          hardware_id?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          solver_id?: string | null
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          creator_id?: string | null
          dataset_id?: string | null
          description?: string | null
          hardware_id?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          solver_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "block_connections_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "block_connections_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "block_connections_hardware_id_fkey"
            columns: ["hardware_id"]
            isOneToOne: false
            referencedRelation: "hardware_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "block_connections_solver_id_fkey"
            columns: ["solver_id"]
            isOneToOne: false
            referencedRelation: "solvers"
            referencedColumns: ["id"]
          },
        ]
      }
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
          creator_id: string
          description: string | null
          file_path: string | null
          format: string
          id: string
          is_public: boolean
          name: string
          size: number | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          file_path?: string | null
          format: string
          id?: string
          is_public?: boolean
          name: string
          size?: number | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          file_path?: string | null
          format?: string
          id?: string
          is_public?: boolean
          name?: string
          size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "datasets_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guideline_solvers: {
        Row: {
          created_at: string
          description: string | null
          file_content: string
          id: string
          name: string
          openai_file_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_content: string
          id?: string
          name: string
          openai_file_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_content?: string
          id?: string
          name?: string
          openai_file_id?: string | null
          updated_at?: string
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
      jobs: {
        Row: {
          configuration: Json | null
          created_at: string
          creator_id: string
          dataset_id: string | null
          error: string | null
          hardware_id: string | null
          id: string
          name: string
          result: Json | null
          solver_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          creator_id: string
          dataset_id?: string | null
          error?: string | null
          hardware_id?: string | null
          id?: string
          name: string
          result?: Json | null
          solver_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          creator_id?: string
          dataset_id?: string | null
          error?: string | null
          hardware_id?: string | null
          id?: string
          name?: string
          result?: Json | null
          solver_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_hardware_id_fkey"
            columns: ["hardware_id"]
            isOneToOne: false
            referencedRelation: "hardware_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_solver_id_fkey"
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
      qubots: {
        Row: {
          algorithm_logic: string | null
          cost_function: string | null
          created_at: string
          creator_id: string
          description: string | null
          file_path: string | null
          id: string
          input_parameters: Json
          is_public: boolean
          name: string
          repository_url: string | null
          solver_parameters: Json
          solver_type: string
          updated_at: string
        }
        Insert: {
          algorithm_logic?: string | null
          cost_function?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          file_path?: string | null
          id?: string
          input_parameters?: Json
          is_public?: boolean
          name: string
          repository_url?: string | null
          solver_parameters?: Json
          solver_type?: string
          updated_at?: string
        }
        Update: {
          algorithm_logic?: string | null
          cost_function?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          file_path?: string | null
          id?: string
          input_parameters?: Json
          is_public?: boolean
          name?: string
          repository_url?: string | null
          solver_parameters?: Json
          solver_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qubots_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      solvers: {
        Row: {
          code_content: string
          created_at: string
          creator_id: string
          description: string | null
          download_url: string | null
          file_path: string | null
          id: string
          is_public: boolean
          name: string
          repository_url: string | null
          solver_parameters: Json
          solver_type: string
          updated_at: string
        }
        Insert: {
          code_content: string
          created_at?: string
          creator_id: string
          description?: string | null
          download_url?: string | null
          file_path?: string | null
          id?: string
          is_public?: boolean
          name: string
          repository_url?: string | null
          solver_parameters?: Json
          solver_type?: string
          updated_at?: string
        }
        Update: {
          code_content?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          download_url?: string | null
          file_path?: string | null
          id?: string
          is_public?: boolean
          name?: string
          repository_url?: string | null
          solver_parameters?: Json
          solver_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solvers_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
