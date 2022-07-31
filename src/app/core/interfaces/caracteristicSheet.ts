import { Map } from 'src/app/core/modules/openlayers';
import { ShareService } from '../services/geosm/share.service';
export interface CaracteristicSheet {
  map: Map;
  url_share: string;
  properties: Object | any;
  geometry?: any;
  getShareUrl?: (environment:any, ShareService: ShareService) => string;
}
