import { ShareService } from 'src/app/core/services/geosm/share.service';

export interface CaracteristicSheet {
  url_share?: string;
  properties: Object | any;
  geometry?: any;
  getShareUrl?: (environment: string, shareService: ShareService) => string;
}
