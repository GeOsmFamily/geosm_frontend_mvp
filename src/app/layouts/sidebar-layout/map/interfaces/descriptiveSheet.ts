import { ShareService } from 'src/app/core/services/geosm/share.service';
import { LayersInMap } from './layerinmap';

export interface DescriptiveSheet {
  type: string;

  layer: LayersInMap;

  geometry?: any;

  properties: {
    [key: string]: any;
  };
  coordinates_3857: [number, number];
  getShareUrl?: (environment: any, ShareService: ShareService) => string;
}
