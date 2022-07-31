import { VectorLayer } from '../../../../core/modules/openlayers';
import { ActiveLayersInterface } from './activelayers';
import { LegendInterface } from './legend';

export interface LayersInMap {
  nom: string;
  type_layer: 'geosmCatalogue' | 'draw' | 'mesure' | 'mapillary' | 'exportData' | 'comments' | 'other' | 'routing';
  image: string;
  properties: { group_id: number; couche_id: number; type: 'couche' | 'carte' } | null;
  zIndex: number;
  visible: boolean;
  data: any;
  badge?: {
    text: string;
    bgColor: string;
  };
  layer: VectorLayer<any>;
  activeLayers: ActiveLayersInterface;
  legendCapabilities?: LegendInterface;
  descriptionSheetCapabilities: string;
}
