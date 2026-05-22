/**
 * Tipos gerados para o schema do Supabase.
 *
 * Hand-written for Phase 2. To regenerate automatically when CLI is configured:
 *   npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 *
 * Tabelas criadas na Fase 2:
 *   - orgs        → organizações (tenants: construtoras + time interno)
 *   - org_members → membros de cada org com role (admin | company)
 *   - assessments → avaliações de prontidão com snapshot JSONB
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          name: string
          cnpj: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          cnpj?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          cnpj?: string | null
          active?: boolean
          created_at?: string
        }
      }
      org_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: Database['public']['Enums']['member_role']
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role?: Database['public']['Enums']['member_role']
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: Database['public']['Enums']['member_role']
          created_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          org_id: string
          status: Database['public']['Enums']['assessment_status']
          version: number
          form_data: Json
          readiness_level_mgmt: string | null
          readiness_level_tech: string | null
          created_at: string
          submitted_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          status?: Database['public']['Enums']['assessment_status']
          version?: number
          form_data?: Json
          readiness_level_mgmt?: string | null
          readiness_level_tech?: string | null
          created_at?: string
          submitted_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          status?: Database['public']['Enums']['assessment_status']
          version?: number
          form_data?: Json
          readiness_level_mgmt?: string | null
          readiness_level_tech?: string | null
          created_at?: string
          submitted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_org_member: {
        Args: { p_org_id: string }
        Returns: boolean
      }
    }
    Enums: {
      member_role: 'admin' | 'company'
      assessment_status: 'draft' | 'submitted'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Utility types (keep existing — do not modify)
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
