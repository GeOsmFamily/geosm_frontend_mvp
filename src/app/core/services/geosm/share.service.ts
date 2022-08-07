import {
  Feature,
  Point,
  GeoJSON,
  Overlay,
  Transform,
  Style,
  CircleStyle,
  Stroke,
  Text,
  Fill,
  VectorSource,
  VectorLayer
} from 'src/app/core/modules/openlayers';
import { Injectable } from '@angular/core';
import { MapHelper } from 'src/app/layouts/sidebar-layout/map/helpers/maphelper';
import { CarteService } from './carte/carte.service';
import { LayersService } from './layers.service';
import { ThematiqueService } from './thematique/thematique.service';
import { Couche } from 'src/app/layouts/navbar-layout/searchbar-layout/interfaces/couche';
import { ComponentHelper } from '../../modules/componentHelper';
import { ApiService } from '../api/api.service';
import * as jQuery from 'jquery';
import { environment } from 'src/environments/environment';
import { DrawService } from 'src/app/layouts/sidebar-layout/sidebar-right/map-tools/services/draw.service';
import { DataHelper } from '../../modules/dataHelper';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  source_draw = new VectorSource();

  vector_draw = new VectorLayer();

  constructor(
    public thematiqueService: ThematiqueService,
    public carteService: CarteService,
    public layerService: LayersService,
    public componentHelper: ComponentHelper,
    public apiService: ApiService,
    public drawService: DrawService
  ) {
    this.vector_draw = new VectorLayer({
      source: this.source_draw
    });
  }

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

  shareFeature(typeLayer: 'carte' | 'couche', id_layer: number, group_id: number, coordinates: number[], featureId: number): string {
    return 'feature=' + typeLayer + ',' + id_layer + ',' + group_id + ',' + coordinates.join(',') + ',' + featureId;
  }

  addLayersFromUrl(layers: Array<string>) {
    for (let index = 0; index < layers.length; index++) {
      const element = layers[index].split(',');
      try {
        let type = element[0];
        if (type == 'carte') {
          let carte = this.carteService.getCarteFromIdAndGroupeCarteId(parseInt(element[1]), parseInt(element[2]));
          if (carte) {
            this.layerService.addLayerCarte(carte);
            let groupCarte = this.carteService.getGroupeCarteByCarteId(carte.id);
            if (groupCarte) {
              //  this.componentHelper.openGroupCarteSlide(groupCarte);
            }
          }
        } else if (type == 'couche') {
          let couche = this.thematiqueService.getCoucheFromIdCoucheAndThematiqueId(parseInt(element[1]), parseInt(element[2]));
          if (couche) {
            this.layerService.addLayerCouche(couche);
            let groupThem = this.thematiqueService.getThematiqueFromIdCouche(couche.id);
            if (groupThem) {
              //  this.componentHelper.openGroupThematiqueSlide(groupThem);
              setTimeout(() => {
                try {
                  jQuery('#couche_' + couche!.id)[0].scrollIntoView(false);
                } catch (error) {}
              }, 1000);
            }
          }
        }
      } catch (error) {}
    }
  }

  displayFeatureShared(parametersShared: Array<any>) {
    for (let index = 0; index < parametersShared.length; index++) {
      const parameterOneFeature = parametersShared[index].split(',');
      if (parameterOneFeature.length == 6) {
        let group_id = parseInt(parameterOneFeature[2]),
          couche_id = parseInt(parameterOneFeature[1]),
          type = parameterOneFeature[0],
          id = parameterOneFeature[5];
        this.addLayersFromUrl([type + ',' + couche_id + ',' + group_id + ',']);

        let mapHelper = new MapHelper();

        setTimeout(() => {
          let layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
            group_id: group_id,
            couche_id: couche_id,
            type: type
          });
          let tries = 0;
          while (tries < 5 && layer.length == 0) {
            tries++;
            layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
              group_id: group_id,
              couche_id: couche_id,
              type: type
            });
          }

          let geom = new Point([parseFloat(parameterOneFeature[3]), parseFloat(parameterOneFeature[4])]);
          mapHelper.fit_view(geom, 12);

          if (layer.length > 0) {
            let couche: Couche = this.thematiqueService.getCoucheFromIdCoucheAndThematiqueId(couche_id, group_id)!;

            this.getFeatureOSMFromCartoServer(couche, id).then(feature => {
              if (feature) {
                let propertie = feature.getProperties();
                let geometry = feature.getGeometry();
                this.componentHelper.openDescriptiveSheet(
                  layer[0].get('descriptionSheetCapabilities'),
                  mapHelper.constructLayerInMap(layer[0]),
                  [parseFloat(parameterOneFeature[3]), parseFloat(parameterOneFeature[4])],
                  geometry,
                  propertie
                );
              }
            });
          }
        }, 3000);
      }
    }
  }

  getFeatureOSMFromCartoServer(couche: Couche, osmId: number): Promise<Feature> {
    let url =
      couche.qgis_url +
      '&SERVICE=WFS&VERSION=1.1.0&REQUEST=GETFEATURE&outputFormat=GeoJSON&typeName=' +
      couche.identifiant +
      '&EXP_FILTER=osm_id=' +
      osmId;

    return this.apiService.getRequestFromOtherHost(url).then(
      response => {
        let features = new GeoJSON().readFeatures(response, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        if (features.length == 1) {
          return features[0];
        } else {
          return undefined!;
        }
      },
      _err => {
        return undefined!;
      }
    );
  }

  displayLocationShared(parametersShared: any, parametersPath: any) {
    for (let index = 0; index < parametersPath.length; index++) {
      const element = parametersPath[index].split(',');
      let lon = parseFloat(element[0]);
      let lat = parseFloat(element[1]);

      let coord = [lon, lat];

      let mapHelper = new MapHelper();

      let coord_caracteri = new Overlay({
        position: coord,
        element: document.getElementById('coord_caracteristics')!
      });

      mapHelper.map?.addOverlay(coord_caracteri);

      jQuery('#spinner_loading').show();

      jQuery('#coord_caracteristics').show();

      jQuery('#coord_caracteristics').on('mousemove', _evt => {
        jQuery('#coord_caracteristics .fa-times').show();

        jQuery('#coord_caracteristics .fa-dot-circle').hide();
      });

      jQuery('#coord_caracteristics').on('mouseout', _evt => {
        jQuery('#coord_caracteristics .fa-times').hide();

        jQuery('#coord_caracteristics .fa-dot-circle').show();
      });

      let coord_4326 = Transform(coord!, 'EPSG:3857', 'EPSG:4326');
      let caracteristicsPoint = { display: false };

      //@ts-ignore
      caracteristicsPoint['adresse'] = false;
      //@ts-ignore
      caracteristicsPoint['position'] = false;

      //@ts-ignore
      caracteristicsPoint['coord'] = coord_4326[0].toFixed(4) + ' , ' + coord_4326[1].toFixed(4);

      let geocodeOsm =
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
        coord_4326[1] +
        '&lon=' +
        coord_4326[0] +
        '&zoom=18&addressdetails=1';
      //@ts-ignore
      caracteristicsPoint['lieu_dit'] = false;
      jQuery.get(geocodeOsm, data => {
        let name = data.display_name.split(',')[0];
        let osm_url = 'https://www.openstreetmap.org/' + data.osm_type + '/' + data.osm_id;
        //@ts-ignore
        caracteristicsPoint['lieu_dit'] = name;
        //@ts-ignore
        caracteristicsPoint['url_osm'] = osm_url;
      });

      let url_share: string;

      this.componentHelper.openCaracteristic({
        properties: caracteristicsPoint,
        geometry: coord,
        map: mapHelper.map!,
        url_share: url_share!
      });
    }
  }

  displayDrawShared(parametersShared: any, parametersId: any) {
    console.log(parametersId);
    let mapHelper = new MapHelper();
    jQuery('#spinner_loading').show();

    this.drawService.getAllDrawByCode(parametersId).subscribe(results => {
      jQuery('#spinner_loading').hide();

      if (results.success) {
        let dessins = {
          point: Array(),
          polygon: Array(),
          linestring: Array(),
          text: Array()
        };

        for (let index = 0; index < results.data.draws.length; index++) {
          let element = results.data.draws[index];
          let i: number;
          if (element.type == 'Point') {
            i = dessins['point'].length;
            dessins['point'].push('element');
          } else if (element.type == 'Polygon') {
            i = dessins['polygon'].length;
            dessins['polygon'].push(element);
          } else if (element.type == 'LineString') {
            i = dessins['linestring'].length;
            dessins['linestring'].push(element);
          }

          let type_dessin = element.type;
          let color_dessin = element.color;

          let geometry = JSON.parse(element.geom);

          let feature = new GeoJSON().readFeature(geometry);
          feature.set('descripion', element.description);
          feature.set('type', type_dessin);
          feature.set('id', i!);

          feature.setStyle(
            new Style({
              fill: new Fill({
                color: [
                  DataHelper.hexToRgb(color_dessin)!.r,
                  DataHelper.hexToRgb(color_dessin)!.g,
                  DataHelper.hexToRgb(color_dessin)!.b,
                  0.7
                ]
              }),
              stroke: new Stroke({
                color: color_dessin,
                width: 2
              }),
              image: new CircleStyle({
                radius: 7,
                stroke: new Stroke({
                  color: color_dessin,
                  width: 2
                }),
                fill: new Fill({
                  color: [
                    DataHelper.hexToRgb(color_dessin)!.r,
                    DataHelper.hexToRgb(color_dessin)!.g,
                    DataHelper.hexToRgb(color_dessin)!.b,
                    0.7
                  ]
                })
              }),
              text: new Text({
                font: 'bold 18px Calibri,sans-serif',
                offsetY: 15,
                fill: new Fill({
                  color: color_dessin
                }),
                text: element.description,
                stroke: new Stroke({ color: '#fff', width: 2 })
              })
            })
          );

          this.source_draw.addFeature(feature);
        }

        setTimeout(() => {
          this.vector_draw.set('iconImagette', environment.url_frontend + '/assets/images/svg/draw.svg');
          this.vector_draw.set('inToc', false);
          this.vector_draw.setZIndex(1000);
          this.vector_draw.set('name', 'draw');
          this.vector_draw.set('nom', 'draw');
          this.vector_draw.set('type_layer', 'draw');
          mapHelper.addLayerToMap(this.vector_draw);
          mapHelper.map?.getView().fit(this.source_draw.getExtent(), {
            size: mapHelper.map.getSize(),
            duration: 1000
          });
        }, 3000);
      }
    });
  }
}
