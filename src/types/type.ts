export interface Register {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleType: string;
}

export interface Login {
  email: string;
  password: string;
  roleType: string;
}

// Pet Types
export interface PetType {
  id: string;
  name: string;
  name_tr: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  user_id: string;
  pet_type_id: string;
  pet_type?: {
    id: string;
    name: string;
    name_tr: string;
  };
  name: string;
  breed?: string;
  age?: Date;
  age_display?: string;
  gender?: "male" | "female" | "unknown";
  weight_kg?: number;
  color?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PetImage {
  id: string;
  profile_type: string;
  profile_id: string;
  image_url: string;
  image_order: number;
  image_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePetRequest {
  pet_type_id: string;
  name: string;
  breed?: string;
  age?: Date;
  age_display?: string;
  gender?: "male" | "female" | "unknown";
  weight_kg?: number;
  color?: string;
  description?: string;
}

// 1. Ortak özellikler (Her iki türde de olanlar)
export type ItemType = "product" | "service";

interface BaseItem {
  id: string;
  name: string;
  price: number;
  type: ItemType;
  image?: string | null; // <--- Buraya ekle (ProductItem'dan silip buraya al)
}

// 2. Fiziksel Ürün Tipi
export interface ProductItem extends BaseItem {
  type: "product";
  quantity: number;
}

// 3. Bakıcı Hizmeti Tipi
export interface ServiceItem extends BaseItem {
  type: "service";
  providerId: string;
  priceType: string;
  // BaseItem sayesinde artık burada da otomatik olarak image var
}

// 4. Sepet Elemanı (Union Type)
export type CartItem = ProductItem | ServiceItem;

// Chat & Social Types
export interface UserRole {
  id: string;
  user_id: string;
  role_type: string;
  status: string;
  user_profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  participant_role_id: string;
  is_deleted: boolean;
  last_read_at: string;
  is_muted: boolean;
  user_roles?: UserRole;
}

export interface Conversation {
  id: string;
  participant_1_role_id: string;
  participant_2_role_id: string;
  last_message_content: string | null;
  last_message_at: string | null;
  last_message_sender_role_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  conversation_participants?: ConversationParticipant[];
  other_participant?: UserRole; // Helper for UI
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_role_id: string;
  message_type: "text" | "image" | "location";
  content: string | null;
  image_url?: string | null;
  location_name?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  is_deleted: boolean;
}
