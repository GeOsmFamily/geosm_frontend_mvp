export interface User {
  id: number;
  last_name: string;
  first_name: string;
  titre?: any;
  osm_changeset?: any;
  email: string;
  email_verified_at: Date;
  phone: string;
  profile_picture?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export interface Comment {
  id: number;
  user_id: number;
  commentaire: string;
  longitude: string;
  latitude: string;
  image_url: string;
  video_url?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
  user: User;
}

export interface Data {
  comments: Comment[];
}

export interface CommentInterface {
  success: boolean;
  data: Data;
  message: string;
}
