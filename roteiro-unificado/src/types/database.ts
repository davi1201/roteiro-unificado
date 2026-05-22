/**
 * Tipos gerados para o schema do Supabase.
 *
 * Este arquivo será expandido na Fase 2 quando as tabelas forem criadas.
 * Para regenerar após mudanças no schema:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 *
 * Tabelas planejadas (Fase 2):
 *   - companies          → dados das construtoras (tenants)
 *   - assessments        → avaliações de prontidão
 *   - assessment_answers → respostas individuais por pergunta
 *   - users              → perfis de usuários (via Supabase Auth)
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      // Tabelas serão adicionadas na Fase 2
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      // Enums serão adicionados conforme necessário
      // grade: 'G1' | 'G2' | 'G3' | 'G4' | 'G5'
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos utilitários para uso na aplicação
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
