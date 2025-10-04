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
