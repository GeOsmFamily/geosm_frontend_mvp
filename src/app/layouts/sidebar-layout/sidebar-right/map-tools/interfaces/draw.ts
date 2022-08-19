export interface Draw {
  code: string;
  description?: string;
  geom: string;
  type: string;
  color: string;
  updated_at?: Date;
  created_at?: Date;
  id?: number;
}

export interface Data {
  draw: Draw;
}

export interface DrawInterface {
  success: boolean;
  data: Data;
  message: string;
}
