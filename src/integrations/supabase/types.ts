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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string | null
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          phone: string | null
          recipient_name: string | null
          street: string | null
          updated_at: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          area?: string | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          phone?: string | null
          recipient_name?: string | null
          street?: string | null
          updated_at?: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          area?: string | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          phone?: string | null
          recipient_name?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      auth_events: {
        Row: {
          created_at: string
          event: string
          id: string
          method: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          method?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          method?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          city: string
          created_at: string
          delivery_fee: number
          id: string
          is_served: boolean
          name: string
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          delivery_fee?: number
          id?: string
          is_served?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          delivery_fee?: number
          id?: string
          is_served?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_events: {
        Row: {
          actor_id: string | null
          actor_label: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          note: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          actor_id?: string | null
          actor_label?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          actor_id?: string | null
          actor_label?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          sku: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          name: string
          order_id: string
          product_id?: string | null
          quantity: number
          sku: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          sku?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          created_at: string
          delivery_fee: number
          delivery_window: string | null
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          placed_at: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          address_id?: string | null
          created_at?: string
          delivery_fee?: number
          delivery_window?: string | null
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          address_id?: string | null
          created_at?: string
          delivery_fee?: number
          delivery_window?: string | null
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          metadata: Json
          order_id: string
          provider: string
          provider_ref: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json
          order_id: string
          provider: string
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json
          order_id?: string
          provider?: string
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          max_order: number
          min_order: number
          name: string
          price_business: number | null
          price_retail: number
          size_label: string
          sku: string
          sort_order: number
          stock: number
          subscription_eligible: boolean
          updated_at: string
          volume_ml: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_order?: number
          min_order?: number
          name: string
          price_business?: number | null
          price_retail?: number
          size_label: string
          sku: string
          sort_order?: number
          stock?: number
          subscription_eligible?: boolean
          updated_at?: string
          volume_ml: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_order?: number
          min_order?: number
          name?: string
          price_business?: number | null
          price_retail?: number
          size_label?: string
          sku?: string
          sort_order?: number
          stock?: number
          subscription_eligible?: boolean
          updated_at?: string
          volume_ml?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          contact_channel: string
          created_at: string
          delivery_instructions: string | null
          delivery_reminders: boolean
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_delivery_window: string | null
          preferred_size_label: string | null
          updated_at: string
        }
        Insert: {
          contact_channel?: string
          created_at?: string
          delivery_instructions?: string | null
          delivery_reminders?: boolean
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_delivery_window?: string | null
          preferred_size_label?: string | null
          updated_at?: string
        }
        Update: {
          contact_channel?: string
          created_at?: string
          delivery_instructions?: string | null
          delivery_reminders?: boolean
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_delivery_window?: string | null
          preferred_size_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_requests: {
        Row: {
          city: string | null
          contact: string | null
          created_at: string
          id: string
          location_text: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          location_text: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          location_text?: string
          notes?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "executive"
        | "operations_manager"
        | "production_manager"
        | "quality_manager"
        | "inventory_manager"
        | "sales_manager"
        | "support"
        | "finance_manager"
        | "distributor"
        | "retailer"
        | "driver"
        | "business_customer"
        | "household_customer"
        | "pod_operator"
      order_status:
        | "cart"
        | "checkout"
        | "payment_pending"
        | "paid"
        | "confirmed"
        | "allocated"
        | "production"
        | "packed"
        | "ready_for_dispatch"
        | "out_for_delivery"
        | "delivered"
        | "completed"
        | "cancelled"
        | "failed"
        | "refunded"
        | "returned"
      payment_status:
        | "pending"
        | "processing"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded"
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
      app_role: [
        "super_admin",
        "executive",
        "operations_manager",
        "production_manager",
        "quality_manager",
        "inventory_manager",
        "sales_manager",
        "support",
        "finance_manager",
        "distributor",
        "retailer",
        "driver",
        "business_customer",
        "household_customer",
        "pod_operator",
      ],
      order_status: [
        "cart",
        "checkout",
        "payment_pending",
        "paid",
        "confirmed",
        "allocated",
        "production",
        "packed",
        "ready_for_dispatch",
        "out_for_delivery",
        "delivered",
        "completed",
        "cancelled",
        "failed",
        "refunded",
        "returned",
      ],
      payment_status: [
        "pending",
        "processing",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
    },
  },
} as const
