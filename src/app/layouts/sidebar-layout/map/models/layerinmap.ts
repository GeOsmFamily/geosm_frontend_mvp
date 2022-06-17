import { ActiveLayersInterface } from "./activelayers";
import { LegendInterface } from "./legend";

export interface LayersInMap {
  nom: string;
  type_layer: 'geosmCatalogue' | 'draw' | 'mesure' | 'mapillary' | 'exportData' | 'comments' | 'other' | 'routing';
  image: string;
  properties: Object | null;
  zIndex: number;
  visible: boolean;
  data: any;
  badge?: {
    text: string;
    bgColor: string;
  };
  layer: any;
  activeLayers: ActiveLayersInterface;
  legendCapabilities?: LegendInterface;
  descriptionSheetCapabilities: string;
}
