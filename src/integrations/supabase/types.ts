export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          apellidos: string
          calle: string | null
          created_at: string | null
          email: string | null
          fecha_nacimiento: string | null
          fecha_vencimiento_nie: string | null
          id: string
          nacionalidad: string | null
          nie_pasaporte: string
          nombre: string
          numero: string | null
          observaciones: string | null
          piso: string | null
          puerta: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          apellidos: string
          calle?: string | null
          created_at?: string | null
          email?: string | null
          fecha_nacimiento?: string | null
          fecha_vencimiento_nie?: string | null
          id?: string
          nacionalidad?: string | null
          nie_pasaporte: string
          nombre: string
          numero?: string | null
          observaciones?: string | null
          piso?: string | null
          puerta?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          apellidos?: string
          calle?: string | null
          created_at?: string | null
          email?: string | null
          fecha_nacimiento?: string | null
          fecha_vencimiento_nie?: string | null
          id?: string
          nacionalidad?: string | null
          nie_pasaporte?: string
          nombre?: string
          numero?: string | null
          observaciones?: string | null
          piso?: string | null
          puerta?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documentos_requeridos: {
        Row: {
          active: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre_documento: string
          orden: number | null
          tipo_tramite_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre_documento: string
          orden?: number | null
          tipo_tramite_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre_documento?: string
          orden?: number | null
          tipo_tramite_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_requeridos_tipo_tramite_id_fkey"
            columns: ["tipo_tramite_id"]
            isOneToOne: false
            referencedRelation: "tipos_tramite"
            referencedColumns: ["id"]
          },
        ]
      }
      expediente_documentos: {
        Row: {
          created_at: string | null
          documento_requerido_id: string | null
          estado_documento: string | null
          expediente_id: string
          fecha_recibido: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          documento_requerido_id?: string | null
          estado_documento?: string | null
          expediente_id: string
          fecha_recibido?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          documento_requerido_id?: string | null
          estado_documento?: string | null
          expediente_id?: string
          fecha_recibido?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expediente_documentos_documento_requerido_id_fkey"
            columns: ["documento_requerido_id"]
            isOneToOne: false
            referencedRelation: "documentos_requeridos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expediente_documentos_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      expedientes: {
        Row: {
          cliente_id: string
          created_at: string | null
          estado: string | null
          fecha_inicio: string
          fecha_presentacion: string | null
          id: string
          numero_expediente: string
          numero_expediente_oficial: string | null
          observaciones: string | null
          precio_acordado: number | null
          tipo_tramite_id: string
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          estado?: string | null
          fecha_inicio: string
          fecha_presentacion?: string | null
          id?: string
          numero_expediente: string
          numero_expediente_oficial?: string | null
          observaciones?: string | null
          precio_acordado?: number | null
          tipo_tramite_id: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          estado?: string | null
          fecha_inicio?: string
          fecha_presentacion?: string | null
          id?: string
          numero_expediente?: string
          numero_expediente_oficial?: string | null
          observaciones?: string | null
          precio_acordado?: number | null
          tipo_tramite_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expedientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expedientes_tipo_tramite_id_fkey"
            columns: ["tipo_tramite_id"]
            isOneToOne: false
            referencedRelation: "tipos_tramite"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_estados: {
        Row: {
          estado_anterior: string | null
          estado_nuevo: string
          expediente_id: string
          fecha_cambio: string | null
          id: string
          usuario_id: string | null
        }
        Insert: {
          estado_anterior?: string | null
          estado_nuevo: string
          expediente_id: string
          fecha_cambio?: string | null
          id?: string
          usuario_id?: string | null
        }
        Update: {
          estado_anterior?: string | null
          estado_nuevo?: string
          expediente_id?: string
          fecha_cambio?: string | null
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_estados_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          cliente_id: string
          concepto: string | null
          created_at: string | null
          expediente_id: string
          fecha_pago: string
          id: string
          importe: number
          metodo_pago: string | null
          observaciones: string | null
        }
        Insert: {
          cliente_id: string
          concepto?: string | null
          created_at?: string | null
          expediente_id: string
          fecha_pago: string
          id?: string
          importe: number
          metodo_pago?: string | null
          observaciones?: string | null
        }
        Update: {
          cliente_id?: string
          concepto?: string | null
          created_at?: string | null
          expediente_id?: string
          fecha_pago?: string
          id?: string
          importe?: number
          metodo_pago?: string | null
          observaciones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_tramite: {
        Row: {
          active: boolean | null
          codigo: string
          created_at: string | null
          id: string
          nombre: string
          precio_base: number | null
        }
        Insert: {
          active?: boolean | null
          codigo: string
          created_at?: string | null
          id?: string
          nombre: string
          precio_base?: number | null
        }
        Update: {
          active?: boolean | null
          codigo?: string
          created_at?: string | null
          id?: string
          nombre?: string
          precio_base?: number | null
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
    Enums: {},
  },
} as const
