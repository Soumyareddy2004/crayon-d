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
      user_profiles: {
        Row: {
          id: string
          risk_tolerance: 'low' | 'moderate' | 'high'
          retirement_goal: number
          current_age: number
          target_retirement_age: number
          monthly_contribution: number
          current_portfolio: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          risk_tolerance: 'low' | 'moderate' | 'high'
          retirement_goal: number
          current_age: number
          target_retirement_age: number
          monthly_contribution: number
          current_portfolio?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_tolerance?: 'low' | 'moderate' | 'high'
          retirement_goal?: number
          current_age?: number
          target_retirement_age?: number
          monthly_contribution?: number
          current_portfolio?: Json
          created_at?: string
          updated_at?: string
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          embedding: number[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          embedding: number[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          content?: string
          embedding?: number[]
          created_at?: string
        }
      }
    }
    Functions: {
      match_messages: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
          user_id: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
        }[]
      }
    }
  }
}