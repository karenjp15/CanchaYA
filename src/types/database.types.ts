/**
 * Tipos alineados con migraciones Supabase (p. ej. `20260412120000_sport_types_and_court_attrs.sql`).
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
export type SportType = "PADEL" | "FUTBOL";
export type FootballCapacity = "F5" | "F7" | "F9" | "F11";
export type FootballSurface = "SYNTHETIC_GRASS" | "NATURAL_GRASS";
export type PadelWallMaterial = "GLASS" | "WALL";
export type PadelCourtLocation = "INDOOR" | "OUTDOOR";
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
      venues: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          parking_available: boolean;
          sells_liquor: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          parking_available?: boolean;
          sells_liquor?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          parking_available?: boolean;
          sells_liquor?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "venues_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      fields: {
        Row: {
          id: string;
          owner_id: string;
          venue_id: string;
          name: string;
          description: string | null;
          sport: SportType;
          football_capacity: FootballCapacity | null;
          football_surface: FootballSurface | null;
          padel_wall_material: PadelWallMaterial | null;
          padel_location: PadelCourtLocation | null;
          slot_duration_minutes: number;
          hourly_price: string;
          is_active: boolean;
          image_url: string | null;
          list_in_explore: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          venue_id: string;
          name: string;
          description?: string | null;
          sport?: SportType;
          football_capacity?: FootballCapacity | null;
          football_surface?: FootballSurface | null;
          padel_wall_material?: PadelWallMaterial | null;
          padel_location?: PadelCourtLocation | null;
          slot_duration_minutes?: number;
          hourly_price: string;
          is_active?: boolean;
          image_url?: string | null;
          list_in_explore?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          venue_id?: string;
          name?: string;
          description?: string | null;
          sport?: SportType;
          football_capacity?: FootballCapacity | null;
          football_surface?: FootballSurface | null;
          padel_wall_material?: PadelWallMaterial | null;
          padel_location?: PadelCourtLocation | null;
          slot_duration_minutes?: number;
          hourly_price?: string;
          is_active?: boolean;
          image_url?: string | null;
          list_in_explore?: boolean;
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
          {
            foreignKeyName: "fields_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      field_composite_members: {
        Row: {
          composite_field_id: string;
          member_field_id: string;
        };
        Insert: {
          composite_field_id: string;
          member_field_id: string;
        };
        Update: {
          composite_field_id?: string;
          member_field_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "field_composite_members_composite_field_id_fkey";
            columns: ["composite_field_id"];
            isOneToOne: false;
            referencedRelation: "fields";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "field_composite_members_member_field_id_fkey";
            columns: ["member_field_id"];
            isOneToOne: false;
            referencedRelation: "fields";
            referencedColumns: ["id"];
          },
        ];
      };
      field_pricing_windows: {
        Row: {
          id: string;
          field_id: string;
          start_minute: number;
          end_minute: number;
          hourly_price: string;
          day_of_week: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          field_id: string;
          start_minute: number;
          end_minute: number;
          hourly_price: string | number;
          day_of_week?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          field_id?: string;
          start_minute?: number;
          end_minute?: number;
          hourly_price?: string | number;
          day_of_week?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "field_pricing_windows_field_id_fkey";
            columns: ["field_id"];
            isOneToOne: false;
            referencedRelation: "fields";
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
    Functions: {
      get_venues_visible_for_fields: {
        Args: { p_ids: string[] };
        Returns: {
          id: string;
          owner_id: string;
          name: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          parking_available: boolean;
          sells_liquor: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }[];
      };
      market_hourly_price_hint: {
        Args: {
          p_sport: SportType;
          p_city_slug: string;
          p_football_capacity: FootballCapacity | null;
          p_football_surface: FootballSurface | null;
          p_padel_wall: PadelWallMaterial | null;
          p_padel_location: PadelCourtLocation | null;
          p_slot_duration_minutes: number;
          p_exclude_field_id?: string | null;
        };
        Returns: Record<string, unknown>;
      };
    };
    Enums: {
      user_role: UserRole;
      sport_type: SportType;
      football_capacity: FootballCapacity;
      football_surface: FootballSurface;
      padel_wall_material: PadelWallMaterial;
      padel_court_location: PadelCourtLocation;
      booking_status: BookingStatus;
      id_document_type: IdDocumentType;
    };
    CompositeTypes: Record<string, never>;
  };
};
