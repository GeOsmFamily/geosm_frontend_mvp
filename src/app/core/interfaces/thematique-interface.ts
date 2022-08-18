import { Couche } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';

export interface SousThematique {
  id: number;
  thematique_id: number;
  nom: string;
  nom_en: string;
  image_src: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
  open?:boolean;
  couches: Couche[];
}

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
  nbCouches?:number;
  nomSousThem?:string;

  sous_thematiques: SousThematique[];
}

export interface Data {
  thematiques: Thematique[];
}

export interface ThematiqueInterface {
  success: boolean;
  data: Data;
  message: string;
}
