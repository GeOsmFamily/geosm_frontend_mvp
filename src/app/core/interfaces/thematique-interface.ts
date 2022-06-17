


    export interface Proprietes {
        id: number;
        couche_id: number;
        instance_id: number;
        opacite: string;
        qgis_url: string;
        bbox: string;
        projection: string;
        number_features: number;
        vues: number;
        surface: string;
        distance: string;
        telechargement: number;
        created_at?: any;
        updated_at?: any;
        deleted_at?: any;
    }

    export interface Couche {
        id: number;
        sous_thematique_id: number;
        nom: string;
        nom_en: string;
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
        sql_complete: string;
        created_at?: any;
        updated_at?: any;
        deleted_at?: any;
        proprietes: Proprietes;
    }

    export interface SousThematique {
        id: number;
        thematique_id: number;
        nom: string;
        nom_en: string;
        image_src?: any;
        created_at: Date;
        updated_at: Date;
        deleted_at?: any;
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



