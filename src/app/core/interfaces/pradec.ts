
  export interface Properties {
    name: string;
  }

  export interface Crs {
    type: string;
    properties: Properties;
  }

  export interface Geometry {
    type: string;
    coordinates: number[];
  }

  export interface Properties2 {
    nomsyndicat: string;
    nomdepartement: string;
    nomcommunebe: string;
    nomcommunemr: string;
    nomcommuneml?: any;
    nomlocalite: string;
    latitude: string;
    longitude: string;
    numeroreferenceouvrage: string;
    nomouvrage: string;
    datecollecte: string;
    typeouvrage: string;
    typepointeau: string;
    etatpointeau: string;
    etatlatrine?: any;
    fontionnel: string;
    datemiseoeuvre: string;
    sourcefinancement: string;
    maitreouvrage: string;
    maitreoeuvre: string;
    photourl: string;
    quantitesuffisanteeau: string;
    qualiteeau: string;
    etateau: string;
    sourcepollution: string;
    existencecomitegestion: string;
    statutlegal: string;
    nomcomite: string;
    nompointfocal: string;
    contactpointfocal: string;
    commentaire: string;
    nomvillage?: any;
  }

  export interface Feature {
    type: string;
    geometry: Geometry;
    properties: Properties2;
  }

  export interface PradecInterface {
    type: string;
    name: string;
    crs: Crs;
    features: Feature[];
  }
