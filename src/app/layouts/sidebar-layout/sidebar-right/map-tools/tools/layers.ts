import { DataHelper } from "src/app/core/modules/dataHelper";
import { BaseLayer, VectorSource,VectorLayer, Style, Fill, Stroke, CircleStyle, Text, Modify, Select, Overlay } from "src/app/core/modules/openlayers";
import { environment } from "src/environments/environment";
import OverlayPositioning from 'ol/OverlayPositioning';

export class LayersTools {
  createVectorLayer(source: VectorSource, type_layer: string, layer_name: string): BaseLayer {
    return new VectorLayer({
      source: source,
      style: feature => {
        let color = environment.primarycolor;
        if (feature.get('color')) {
          color = feature.get('color');
        }
        return new Style({
          fill: new Fill({
            color: [DataHelper.hexToRgb(color)!.r, DataHelper.hexToRgb(color)!.g, DataHelper.hexToRgb(color)!.b, 0.7]
          }),
          stroke: new Stroke({
            color: color,
            width: 2
          }),
          image: new CircleStyle({
            radius: 7,
            stroke: new Stroke({
              color: color,
              width: 2
            }),
            fill: new Fill({
              color: [DataHelper.hexToRgb(color)!.r, DataHelper.hexToRgb(color)!.g, DataHelper.hexToRgb(color)!.b, 0.7]
            })
          }),
          text: new Text({
            font: 'bold 18px Calibri,sans-serif',
            offsetY: 15,
            fill: new Fill({
              color: color
            }),
            text: feature.get('comment'),
            stroke: new Stroke({ color: '#fff', width: 2 })
          })
        });
      },
      //@ts-ignore
      type_layer: type_layer,
      nom: layer_name
    });
  }

  createModify(source: VectorSource): Modify {
    return new Modify({
      source: source,
      style: new Style({
        fill: new Fill({
          color: [255, 0, 255, 0.7]
        }),
        stroke: new Stroke({
          color: [255, 0, 255, 1],
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: [255, 0, 255, 0.7]
          }),
          stroke: new Stroke({
            color: [255, 0, 255, 1],
            width: 2
          })
        })
      })
    });
  }

  createSelect(layer: BaseLayer) {
    return new Select({
      //@ts-ignore
      layers: [layer],
      style: new Style({
        fill: new Fill({
          color: [255, 255, 0, 0.7]
        }),
        stroke: new Stroke({
          color: '#ffff00',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: [255, 255, 0, 0.7]
          }),
          stroke: new Stroke({
            color: '#ffff00',
            width: 2
          })
        })
      })
    });
  }

  createOverlay(htmlElement:string) : Overlay {
    return new Overlay({
      position: undefined,
      positioning: OverlayPositioning.TOP_LEFT,
      element: document.getElementById(htmlElement)!,
      stopEvent: true
    });
  }
}
