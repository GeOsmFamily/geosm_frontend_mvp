import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  constructor() {}

  shareLayers(
    layers: Array<{
      typeLayer: 'carte' | 'couche';
      id_layer: number;
      group_id: number;
    }>
  ): string {
    let parameters = Array();
    for (let index = 0; index < layers.length; index++) {
      parameters.push(layers[index].typeLayer + ',' + layers[index].id_layer + ',' + layers[index].group_id);
    }
    return 'layers=' + parameters.join(';');
  }

  shareLayer(typeLayer: 'carte' | 'couche', id_layer: number, group_id: number): string {
    return 'layers=' + typeLayer + ',' + id_layer + ',' + group_id;
  }
}
