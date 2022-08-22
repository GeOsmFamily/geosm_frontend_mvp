import { ActiveLayersInterface } from "./activelayers";
import { LegendInterface } from "./legend";


export interface GeosmLayer {
  nom: string;
  inToc: boolean;
  type_layer: 'geosmCatalogue' | 'draw' | 'mesure' | 'mapillary' | 'exportData' | 'other' | 'comments' | 'routing';
  type: 'wfs' | 'wms' | 'xyz';
  crs?: string;
  visible: boolean;
  strategy?: 'bbox' | 'all';
  load?: boolean;
  style?: any;
  maxzoom?: number;
  minzoom?: number;
  zindex?: number;
  size?: number;
  cluster?: boolean;
  icon?: string;
  iconImagette?: string;
  url?: string;
  identifiant: string;
  activeLayers?: ActiveLayersInterface;
  legendCapabilities?: LegendInterface;
  properties:
    | {
        group_id: number;
        couche_id: number;
        type: 'couche' | 'carte';
      }
    | null;
  descriptionSheetCapabilities: string;
}
