export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: Date;
  phone: string;
  fcmToken?: any;
  imageProfil?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Data {
  user: User;
}

export interface UserInterface {
  success: boolean;
  data: Data;
  message: string;
}




  export interface User {
      id: number;
      last_name: string;
      first_name: string;
      titre?: any;
      osm_changeset?: any;
      email: string;
      email_verified_at: Date;
      phone: string;
      profile_picture: string;
      created_at: Date;
      updated_at: Date;
      deleted_at?: any;
  }

  export interface Data {
      token: string;
      user: User;
  }

  export interface loginInterface {
      success: boolean;
      data: Data;
      message: string;
  }

