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
      generated_images: {
        Row: {
          aspect_ratio: string
          created_at: string
          id: string
          image_url: string
          prompt: string
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aspect_ratio: string
          created_at?: string
          id?: string
          image_url: string
          prompt: string
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aspect_ratio?: string
          created_at?: string
          id?: string
          image_url?: string
          prompt?: string
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_credentials: {
        Row: {
          access_token: string
          expires_at: string
          id: number
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          expires_at: string
          id: number
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          expires_at?: string
          id?: number
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          answer: string
          citations: Json | null
          created_at: string
          id: string
          query: string
          user_id: string
        }
        Insert: {
          answer: string
          citations?: Json | null
          created_at?: string
          id?: string
          query: string
          user_id: string
        }
        Update: {
          answer?: string
          citations?: Json | null
          created_at?: string
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      staged_images: {
        Row: {
          created_at: string
          id: string
          original_image_url: string
          prompt: string
          room_type: string
          staged_image_url: string
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          original_image_url: string
          prompt: string
          room_type: string
          staged_image_url: string
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          original_image_url?: string
          prompt?: string
          room_type?: string
          staged_image_url?: string
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          api_key_encrypted: string
          api_key_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          api_key_name: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          api_key_name?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_uploads: {
        Row: {
          content_type: string
          created_at: string
          file_size: number
          file_url: string
          filename: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          file_size: number
          file_url: string
          filename: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          file_size?: number
          file_url?: string
          filename?: string
          id?: string
          updated_at?: string
          user_id?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
