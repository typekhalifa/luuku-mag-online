export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author: string | null
          category: string
          content: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          our_pick: boolean | null
          published_at: string
          slug: string | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author?: string | null
          category: string
          content?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          our_pick?: boolean | null
          published_at?: string
          slug?: string | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author?: string | null
          category?: string
          content?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          our_pick?: boolean | null
          published_at?: string
          slug?: string | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      breaking_news: {
        Row: {
          active: boolean | null
          article_id: string | null
          content: string | null
          created_at: string
          date: string | null
          id: string
          link: string
          priority: number | null
          text: string
        }
        Insert: {
          active?: boolean | null
          article_id?: string | null
          content?: string | null
          created_at?: string
          date?: string | null
          id?: string
          link?: string
          priority?: number | null
          text: string
        }
        Update: {
          active?: boolean | null
          article_id?: string | null
          content?: string | null
          created_at?: string
          date?: string | null
          id?: string
          link?: string
          priority?: number | null
          text?: string
        }
        Relationships: []
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: string
          user_identifier: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_identifier: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_email: string | null
          reporter_name: string | null
        }
        Insert: {
          comment_id: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_email?: string | null
          reporter_name?: string | null
        }
        Update: {
          comment_id?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_email?: string | null
          reporter_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string
          author_name: string | null
          content: string
          dislikes_count: number | null
          flag_reason: string | null
          id: string
          is_spam: boolean | null
          likes_count: number | null
          moderated_at: string | null
          moderated_by: string | null
          parent_comment_id: string | null
          posted_at: string | null
          status: string | null
        }
        Insert: {
          article_id: string
          author_name?: string | null
          content: string
          dislikes_count?: number | null
          flag_reason?: string | null
          id?: string
          is_spam?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          parent_comment_id?: string | null
          posted_at?: string | null
          status?: string | null
        }
        Update: {
          article_id?: string
          author_name?: string | null
          content?: string
          dislikes_count?: number | null
          flag_reason?: string | null
          id?: string
          is_spam?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          parent_comment_id?: string | null
          posted_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          email: string
          id: string
          message: string
          name: string | null
          sent_at: string
        }
        Insert: {
          email: string
          id?: string
          message: string
          name?: string | null
          sent_at?: string
        }
        Update: {
          email?: string
          id?: string
          message?: string
          name?: string | null
          sent_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          article_id: string
          author_name: string | null
          id: string
          liked_at: string | null
        }
        Insert: {
          article_id: string
          author_name?: string | null
          id?: string
          liked_at?: string | null
        }
        Update: {
          article_id?: string
          author_name?: string | null
          id?: string
          liked_at?: string | null
        }
        Relationships: []
      }
      subscription_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          id: string
          ip_address: unknown
        }
        Insert: {
          attempted_at?: string | null
          email: string
          id?: string
          ip_address: unknown
        }
        Update: {
          attempted_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "editor" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
