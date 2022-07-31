import { Feature } from 'src/app/core/modules/openlayers';
export interface DataFromClickOnMapInterface {
  type: 'vector' | 'raster' | 'clear';
  data: {
    coord: number[];
    layers: Array<any>;
    feature?: Feature;
    data?: {};
  };
}
