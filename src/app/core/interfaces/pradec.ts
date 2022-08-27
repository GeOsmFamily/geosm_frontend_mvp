
  export interface Properties {
    name: string;
  }

  export interface Crs {
    typeeau: string;
    properties: Properties;
  }

  export interface Geometry {
    typeeau: string;
    coordinates: number[];
  }

  export interface Properties2 {
    id: number;
    nomsyndicat: string;
    nomdepartement: string;
    nomcommune: string;
    nomlocalite: string;
    latitude: string;
    longitude: string;
    numeroreferenceouvrage: string;
    nomouvrage: string;
    datecollecte: string;
    typeeau: string;
    etat: string;
    descriptionetatouvrage?: any;
    fontionnel: string;
    datemiseoeuvre: string;
    sourcefinancement: string;
    maitreouvrage: string;
    maitreoeuvre: string;
    photourl: string;
    quantitesuffisanteeau: string;
    qualiteeau: string;
    etateau: string;
    descriptionautresourcepollution: string;
    sourcepollution: string;
    existencecomitegestion: string;
    statutlegal: string;
    nomcomite?: any;
    nompointfocal: string;
    contactpointfocal: string;
    commentaire: string;
    nomvillage?: any;
    icon?: any;
  }

  export interface Feature {
    typeeau: string;
    geometry: Geometry;
    properties: Properties2;
  }

  export interface PradecInterface {
    typeeau: string;
    name: string;
    crs: Crs;
    features: Feature[];
  }

