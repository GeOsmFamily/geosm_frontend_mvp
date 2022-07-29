import { Couche } from './couche';
import { Nominatim } from './nominatim';

export interface SearchInterface {
  name: string;
  id: number;
  type: string;
  logo_src: string;
  details: string;
  couche?: Couche;
  nominatim?: Nominatim;
  [key: string]: any;
}
