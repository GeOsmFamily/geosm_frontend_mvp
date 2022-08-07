export interface Draw {
  id: number;
  code: string;
  description: string;
  type: string;
  color: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
  geom: string;
}

export interface Data {
  draws: Draw[];
}

export interface Draws {
  success: boolean;
  data: Data;
  message: string;
}
