/**
 * Tipos alineados con `supabase/migrations/20260403210000_initial_schema.sql`.
 * Tras cambios en DB, regenerar:
 * npx supabase gen types typescript --project-id <id> > src/types/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "USER" | "ADMIN";
export type FieldType = "F5" | "F6" | "F7" | "F8" | "F11";
export type SurfaceType = "ROOFED" | "OPEN";
export type BookingStatus = "PENDING" | "PAID" | "CANCELLED";
export type IdDocumentType = "CC" | "CE" | "NIT";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          address: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fields: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          field_type: FieldType;
          surface: SurfaceType;
          hourly_price: string;
          is_active: boolean;
          image_url: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          parking_available: boolean;
          sells_liquor: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          field_type: FieldType;
          surface: SurfaceType;
          hourly_price: string;
          is_active?: boolean;
          image_url?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          parking_available?: boolean;
          sells_liquor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          field_type?: FieldType;
          surface?: SurfaceType;
          hourly_price?: string;
          is_active?: boolean;
          image_url?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          parking_available?: boolean;
          sells_liquor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fields_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          field_id: string;
          start_time: string;
          end_time: string;
          total_price: string;
          status: BookingStatus;
          payment_method: string | null;
          hold_expires_at: string | null;
          billing_first_name: string | null;
          billing_last_name: string | null;
          billing_address: string | null;
          billing_email: string | null;
          billing_phone: string | null;
          id_document_type: IdDocumentType | null;
          id_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          field_id: string;
          start_time: string;
          end_time: string;
          total_price: string;
          status?: BookingStatus;
          payment_method?: string | null;
          hold_expires_at?: string | null;
          billing_first_name?: string | null;
          billing_last_name?: string | null;
          billing_address?: string | null;
          billing_email?: string | null;
          billing_phone?: string | null;
          id_document_type?: IdDocumentType | null;
          id_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          field_id?: string;
          start_time?: string;
          end_time?: string;
          total_price?: string;
          status?: BookingStatus;
          payment_method?: string | null;
          hold_expires_at?: string | null;
          billing_first_name?: string | null;
          billing_last_name?: string | null;
          billing_address?: string | null;
          billing_email?: string | null;
          billing_phone?: string | null;
          id_document_type?: IdDocumentType | null;
          id_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_field_id_fkey";
            columns: ["field_id"];
            isOneToOne: false;
            referencedRelation: "fields";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      field_type: FieldType;
      surface_type: SurfaceType;
      booking_status: BookingStatus;
      id_document_type: IdDocumentType;
    };
    CompositeTypes: Record<string, never>;
  };
};
