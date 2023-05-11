export interface Thematique {
  id: number;
  nom: string;
  nom_en: string;
  image_src: string;
  schema: string;
  color: string;
  ordre: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export interface SousThematique {
  id: number;
  thematique_id: number;
  nom: string;
  nom_en: string;
  image_src: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
  thematique: Thematique[];
}

export interface Metadatas {
  id: number;
  carte_id?: any;
  couche_id: number;
  resume: string;
  description: string;
  zone: string;
  epsg: string;
  langue: string;
  echelle: string;
  licence: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export interface Tag {
  id: number;
  couche_id: number;
  key: string;
  value: string;
  operateur: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export interface Couche {
  id: number;
  sous_thematique_id: number;
  nom: string;
  nom_en: string;
  description:string;
  geometry: string;
  schema_table_name: string;
  remplir_color: string;
  contour_color: string;
  service_carto: string;
  identifiant: string;
  wms_type: string;
  logo: string;
  sql: string;
  condition: string;
  mode_sql: boolean;
  sql_complete?: any;
  opacite: string;
  qgis_url: string;
  bbox: string;
  projection: string;
  number_features: number;
  vues: number;
  surface: string;
  distance: string;
  telechargement: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
  sousThematique: SousThematique[];
  metadatas: Metadatas;
  tags: Tag[];
  check: boolean;
}

export interface Data {
  couches: Couche[];
}

export interface CoucheInterface {
  success: boolean;
  data: Data;
  message: string;
}
