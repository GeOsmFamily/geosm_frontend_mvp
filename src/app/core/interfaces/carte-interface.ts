
  export interface Carte {
    id: number;
    groupe_carte_id: number;
    nom: string;
    url: string;
    image_url: string;
    type: string;
    identifiant?: any;
    bbox?: any;
    projection?: any;
    zmax: string;
    zmin: string;
    commentaire?: any;
    principal: boolean;
    vues: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
  }

  export interface GroupesCartes {
    id: number;
    nom: string;
    nom_en: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
    cartes: Carte[];
  }

  export interface Data {
    groupes_cartes: GroupesCartes;
  }

  export interface CarteInterface {
    success: boolean;
    data: Data;
    message: string;
  }

