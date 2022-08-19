export interface Pivot {
  model_id: number;
  role_id: number;
  model_type: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: Date;
  updated_at: Date;
  pivot: Pivot;
}

export interface User {
  id: number;
  last_name: string;
  first_name:string;
  titre:string,
  email: string;
  email_verified_at: Date;
  phone: string;
  fcmToken?: any;
  imageProfil?: string;
  created_at: Date;
  updated_at: Date;
  roles: Role[];
}

export interface Data {
  token: string;
  user: User;
}

export interface AuthInterface {
  success: boolean;
  data: Data;
  message: string;
}
