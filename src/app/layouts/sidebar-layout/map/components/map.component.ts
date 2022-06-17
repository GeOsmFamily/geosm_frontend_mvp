import { Component, OnInit, QueryList, ViewChild } from '@angular/core';
import { Map, View, LayerGroup } from 'src/app/core/modules/openlayers';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import * as jQuery from 'jquery';
import { MapHelper } from './../helpers/maphelper';
import { Carte, GroupesCarte } from 'src/app/core/interfaces/carte-interface';
import { environment } from 'src/environments/environment';
import { bboxPolygon, intersect, toWgs84 } from '@turf/turf';
import { MatDrawer, MatSidenavContainer } from '@angular/material/sidenav';
var view = new View({
  center: [0, 0],
  zoom: 0,
  minZoom: 4
});

export const map = new Map({
  layers: [
    new LayerGroup({
      //@ts-ignore
      nom: 'group-layer-shadow'
    })
  ],
  view: view
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  principalMap:
    | {
        groupecarte: GroupesCarte;
        carte: Carte;
      }
    | null
    | undefined;

  @ViewChild(MatSidenavContainer, { static: true })
  sidenavContainer: MatSidenavContainer | undefined;

  constructor(public storageService: StorageService) {}

  ngOnInit(): void {
    this.storageService.loadProjectData().then(
      response => {
        console.log(response);
        jQuery('.loading-apps').hide();
        map.getView().fit(this.storageService.getConfigProjet().data.instance.bbox, {
          size: map.getSize(),
          duration: 1000
        });
      },
      error => {
        console.log(error);
        $('.loading-apps').hide();
      }
    );
    this.initialiazeMap();
  }

  initialiazeMap() {
    map.setTarget('map');
    map.updateSize();
    map.addControl(MapHelper.scaleControl('scaleline', 'scale-map'));
    map.addControl(MapHelper.mousePositionControl('mouse-position-map'));
    this.loadPrincipalMapLayer();
  }

  getMap(): Map {
    return map;
  }

  loadPrincipalMapLayer() {
    this.storageService.states.subscribe(value => {
      if (value.loadProjectData) {
        this.addLayerShadow();
        this.tooglePrincipalMapLayer();

        if (value.loadProjectData) {
          map.on('moveend', () => {
            var bbox_cam = bboxPolygon(
              //@ts-ignore
              this.storageService.getConfigProjet().data.instance.bbox
            );
            //@ts-ignore
            var bbox_view = bboxPolygon(map.getView().calculateExtent());

            var bool = intersect(toWgs84(bbox_view), toWgs84(bbox_cam));

            if (!bool) {
              map.getView().fit(this.storageService.getConfigProjet().data.instance.bbox, {
                size: [map.getSize()?.[0]!, map.getSize()?.[1]! - 50],
                duration: 1000
              });
            }
          });
          map.updateSize();
          var drawers: QueryList<MatDrawer> = this.sidenavContainer?._drawers!;
          drawers.forEach(drawer => {
            drawer.openedChange.subscribe(() => {
              map.updateSize();
            });
          });
        }
      }
    });
  }

  //Ajouter le shadow background a la carte
  addLayerShadow() {
    var mapHelper = new MapHelper();
    var layer = mapHelper.constructShadowLayer(this.storageService.getConfigProjet().roiGeojson);
    layer.setZIndex(1000);
    map.addLayer(layer);
  }

  tooglePrincipalMapLayer() {
    this.principalMap = this.storageService.getPrincipalCarte();
    if (this.principalMap) {
      if (this.principalMap.carte.check) {
        this.removePrincipalMapLayer();
      } else {
        this.addPrincipalMapLayer();
      }
    }
  }

  addPrincipalMapLayer() {
    var mapHelper = new MapHelper();
    this.principalMap = this.storageService.getPrincipalCarte();
    if (this.principalMap) {
      let groupCarte = this.principalMap.groupecarte;
      let carte = this.principalMap.carte;
      this.principalMap.carte.check = true;
      var type: 'wms' | 'wfs' | 'xyz' | undefined;
      if (carte.type == 'wms') {
        type = 'wms';
      } else if (carte.type == 'xyz') {
        type = 'xyz';
      }
      var layer = mapHelper.constructLayer({
        nom: carte.nom,
        type: type!,
        type_layer: 'geosmCatalogue',
        url: carte.url,
        visible: true,
        inToc: true,
        properties: {
          group_id: groupCarte.id,
          couche_id: carte.id,
          type: 'carte'
        },
        activeLayers: {
          share: false,
          metadata: true,
          opacity: true
        },
        iconImagette: environment.url_services + '/' + carte.image_url,
        descriptionSheetCapabilities: undefined!
      });
      console.log(layer);
      mapHelper.addLayerToMap(layer!);
      carte.check = true;
    } else {
      console.log('carte non definie');
    }
  }

  removePrincipalMapLayer() {
    this.principalMap = this.storageService.getPrincipalCarte();
    var mapHelper = new MapHelper(map);
    this.principalMap!.carte.check = false;
    var layer = mapHelper.getLayerByPropertiesCatalogueGeosm({
      group_id: this.principalMap!.groupecarte.id,
      couche_id: this.principalMap!.carte.id,
      type: 'carte'
    });
    for (let index = 0; index < layer.length; index++) {
      mapHelper.removeLayerToMap(layer[index]);
    }
  }
}
