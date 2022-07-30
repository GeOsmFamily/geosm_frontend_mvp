export interface Address {
  village: string;
  town: string;
  county: string;
  state: string;
  country: string;
  country_code: string;
  suburb: string;
  city_district: string;
  city: string;
}

export interface Properties {
  place_id: number;
  osm_type: string;
  osm_id: any;
  display_name: string;
  place_rank: number;
  category: string;
  type: string;
  importance: number;
  icon: string;
  address: Address;
}

export interface Geometry {
  type: string;
  coordinates: any[];
}

export interface Feature {
  type: string;
  properties: Properties;
  bbox: number[];
  geometry: Geometry;
}

export interface Nominatim {
  type: string;
  licence: string;
  features: Feature[];
}
