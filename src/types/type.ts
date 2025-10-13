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
  age_years?: number;
  age_months?: number;
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
  age_years?: number;
  age_months?: number;
  gender?: "male" | "female" | "unknown";
  weight_kg?: number;
  color?: string;
  description?: string;
}
