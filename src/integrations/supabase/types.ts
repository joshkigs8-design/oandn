export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          id: string;
          image: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          address: string;
          county: string;
          created_at: string;
          delivery_fee: number;
          email: string;
          full_name: string;
          id: string;
          instructions: string;
          items: Json;
          mpesa_checkout_request_id: string | null;
          mpesa_merchant_request_id: string | null;
          mpesa_receipt_number: string | null;
          mpesa_result_desc: string | null;
          payment_method: string;
          payment_status: string;
          phone: string;
          status: string;
          subtotal: number;
          total: number;
          town: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          address: string;
          county: string;
          created_at?: string;
          delivery_fee?: number;
          email: string;
          full_name: string;
          id?: string;
          instructions?: string;
          items?: Json;
          mpesa_checkout_request_id?: string | null;
          mpesa_merchant_request_id?: string | null;
          mpesa_receipt_number?: string | null;
          mpesa_result_desc?: string | null;
          payment_method?: string;
          payment_status?: string;
          phone: string;
          status?: string;
          subtotal?: number;
          total?: number;
          town: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          address?: string;
          county?: string;
          created_at?: string;
          delivery_fee?: number;
          email?: string;
          full_name?: string;
          id?: string;
          instructions?: string;
          items?: Json;
          mpesa_checkout_request_id?: string | null;
          mpesa_merchant_request_id?: string | null;
          mpesa_receipt_number?: string | null;
          mpesa_result_desc?: string | null;
          payment_method?: string;
          payment_status?: string;
          phone?: string;
          status?: string;
          subtotal?: number;
          total?: number;
          town?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category: string;
          colors: Json;
          created_at: string;
          description: string;
          featured: boolean;
          gallery: string[];
          id: string;
          image: string;
          in_stock: boolean;
          is_new: boolean;
          name: string;
          price: number;
          sizes: string[];
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          category?: string;
          colors?: Json;
          created_at?: string;
          description?: string;
          featured?: boolean;
          gallery?: string[];
          id?: string;
          image?: string;
          in_stock?: boolean;
          is_new?: boolean;
          name: string;
          price?: number;
          sizes?: string[];
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          colors?: Json;
          created_at?: string;
          description?: string;
          featured?: boolean;
          gallery?: string[];
          id?: string;
          image?: string;
          in_stock?: boolean;
          is_new?: boolean;
          name?: string;
          price?: number;
          sizes?: string[];
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          created_at: string;
          enabled: boolean;
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          key: string;
          updated_at?: string;
          value?: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          key?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;
