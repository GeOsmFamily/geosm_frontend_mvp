export interface Geometry {
  coordinates: number[];
  type: string;
}

export interface HstoreToJson {
  osm_changeset: string;
  osm_timestamp: Date;
  osm_uid: string;
  osm_user: string;
  osm_version: string;
  shop: string;
  building: string;
  name: string;
  opening_hours: string;
  way_area: string;
  amenity: string;
  rooms: string;
  operator: string;
  standing: string;
}

export interface Properties {
  amenity: string;
  fid: number;
  hstore_to_json: HstoreToJson;
  name: string;
  osm_id: any;
}

export interface Feature {
  geometry: Geometry;
  id: string;
  properties: Properties;
  type: string;
}

export interface QgisInterface {
  type: string;
  bbox: number[];
  features: Feature[];
}
