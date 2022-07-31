import { Feature, Point,GeoJSON, Overlay, Transform } from 'src/app/core/modules/openlayers';
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

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  constructor(
    public thematiqueService: ThematiqueService,
    public carteService: CarteService,
    public layerService: LayersService,
    public componentHelper: ComponentHelper,
    public apiService: ApiService
  ) {}

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
                  $('#couche_' + couche!.id)[0].scrollIntoView(false);
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

      $('#spinner_loading').show();

      $('#coord_caracteristics').show();

      $('#coord_caracteristics').on('mousemove', _evt => {
        $('#coord_caracteristics .fa-times').show();

        $('#coord_caracteristics .fa-dot-circle').hide();
      });

      $('#coord_caracteristics').on('mouseout', _evt => {
        $('#coord_caracteristics .fa-times').hide();

        $('#coord_caracteristics .fa-dot-circle').show();
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
    // functions to display draw
  }
}
