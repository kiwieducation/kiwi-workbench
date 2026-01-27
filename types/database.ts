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
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          role: 'admin' | 'manager' | 'team_leader' | 'sales' | 'tutor' | 'bd' | 'marketing' | 'finance' | 'academic'
          department: string | null
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          wechat: string | null
          source: string | null
          stage: 'new' | 'following' | 'proposal' | 'signed' | 'lost'
          risk_level: 'low' | 'medium' | 'high' | null
          assigned_to: string | null // sales user_id
          tags: string[] | null
          notes: string | null
          next_action: string | null
          next_action_date: string | null
          student_name: string | null
          grade: string | null
          target_country: string | null
          budget: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }

      students: {
        Row: {
          id: string
          customer_id: string | null
          name: string
          tutor_id: string // tutor user_id
          business_template_id: string | null
          enrollment_date: string | null
          status: 'active' | 'completed' | 'paused'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }

      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          assignee_id: string // user_id
          related_type: 'student' | 'customer' | 'project' | 'contract' | null
          related_id: string | null
          project_id: string | null
          due_date: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'rejected'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }

      wechat_messages: {
        Row: {
          id: string
          msg_id: string
          from_user_id: string
          to_user_id: string | null
          room_id: string | null
          msg_type: string
          content: Json
          send_time: string
          related_type: string | null
          related_id: string | null
          synced_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['wechat_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['wechat_messages']['Insert']>
      }

      knowledge_documents: {
        Row: {
          id: string
          title: string
          description: string | null
          file_url: string | null
          category: string | null
          department: string | null
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_documents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['knowledge_documents']['Insert']>
      }

      knowledge_folders: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          icon: string | null
          sort_order: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_folders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['knowledge_folders']['Insert']>
      }

      knowledge_files: {
        Row: {
          id: string
          folder_id: string | null
          title: string
          description: string | null
          file_path: string | null
          file_url: string | null
          file_type: string
          mime_type: string | null
          size: number
          tags: string[] | null
          view_count: number
          download_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_files']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['knowledge_files']['Insert']>
      }

      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          status: 'active' | 'completed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }

      quality_reviews: {
        Row: {
          id: string
          alert_id: string
          alert_type: string
          related_type: string | null
          related_id: string | null
          status: 'pending' | 'processing' | 'resolved' | 'ignored'
          notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['quality_reviews']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['quality_reviews']['Insert']>
      }

      conversation_analyses: {
        Row: {
          id: string
          conversation_id: string
          idempotency_key: string
          intent_primary: string
          intent_confidence: number
          intent_secondary: string[] | null
          sentiment_overall: 'positive' | 'neutral' | 'negative' | 'mixed'
          sentiment_score: number
          sentiment_emotions: string[] | null
          key_points: Record<string, unknown>[] | null
          risk_level: 'low' | 'medium' | 'high' | 'critical'
          risk_factors: string[] | null
          risk_suggestions: string[] | null
          suggested_replies: Record<string, unknown>[] | null
          ai_provider: string
          ai_model: string
          tokens_used: number | null
          processing_time_ms: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversation_analyses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conversation_analyses']['Insert']>
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
  }
}
