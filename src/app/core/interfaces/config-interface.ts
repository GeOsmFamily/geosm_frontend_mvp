
  export interface Instance {
    id: number;
    nom: string;
    mapillary: boolean;
    comparator: boolean;
    altimetrie: boolean;
    download: boolean;
    routing: boolean;
    app_version: string;
    app_github_url: string;
    app_email: string;
    app_whatsapp: string;
    app_facebook: string;
    app_twitter: string;
    bbox: number[];
  }

  export interface Data {
    instance: Instance;
  }

  export interface ConfigInterface {
    success: boolean;
    data: Data;
    message: string;
    roiGeojson: any;
  }

