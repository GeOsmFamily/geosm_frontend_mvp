import { Component, Input, NgZone, OnInit, QueryList } from '@angular/core';
import {
  Map,
  View,
  LayerGroup,
  Point,
  Overlay,
  BaseLayer,
  unByKey,
  Stroke,
  Style,
  VectorTileLayer,
  VectorTileSource,
  MVT,
  CreateXYZ,
  Feature,
  GeoJSON,
  VectorSource,
  VectorLayer,
  CircleStyle,
  Fill,
  Text
} from 'src/app/core/modules/openlayers';
import { MapHelper } from './../helpers/maphelper';
import { MatDrawer, MatSidenavContainer } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAllLayersInToc, selectIsLoading, selectProject } from '../states/map.selector';
import { addPrincipalMap, ALL_LAYERS_IN_TOC, globalView, INITMAP, zoomToPoint, ZOOM_MINUS, ZOOM_PLUS } from '../states/map.actions';
import { ProjectInterface } from 'src/app/core/interfaces/project-interface';
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
  faDownload,
  faEdit,
  faGlobe,
  faInfo,
  faInfoCircle,
  faLayerGroup,
  faMap,
  faMapMarker,
  faMinus,
  faPlus,
  faRoute,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { TranslateService } from '@ngx-translate/core';
import { fromLonLat, transform } from 'ol/proj';
import { bboxPolygon, booleanContains, point } from '@turf/turf';
import * as jQuery from 'jquery';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LayersInMap } from '../interfaces/layerinmap';
import { RightMenuInterface } from '../../sidebar-right/interfaces/rightMenuInterface';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { EventsKey } from 'ol/events';
import { ButtomSheetComponent } from './buttom-sheet/buttom-sheet.component';
import { Viewer } from 'mapillary-js';
import { Pixel } from 'ol/pixel';
import { DataFromClickOnMapInterface } from '../interfaces/dataClick';
import { DescriptiveSheetModalComponent } from './descriptive-sheet-modal/descriptive-sheet-modal.component';
import { DescriptiveSheet } from '../interfaces/descriptiveSheet';
import { ActivatedRoute } from '@angular/router';
import { ShareService } from 'src/app/core/services/geosm/share.service';
import { ComponentHelper } from 'src/app/core/modules/componentHelper';
import { CarteService } from 'src/app/core/services/geosm/carte/carte.service';
import { LayersService } from 'src/app/core/services/geosm/layers.service';
let view = new View({
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
  isLoading$: Observable<boolean>;
  project$: Observable<ProjectInterface>;
  project: ProjectInterface | undefined;

  isMapillary: boolean = false;
  isComparator: boolean = false;
  isDownload: boolean = false;
  isRouting: boolean = false;
  isAltimetrie: boolean = false;
  faPlus = faPlus;
  faMinus = faMinus;
  faGlobe = faGlobe;
  faMarker = faMapMarker;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;
  faAngleDouble = faAngleDoubleLeft;
  faAngleDoubleRight = faAngleDoubleRight;

  faMapLayers = faLayerGroup;
  faEdit = faEdit;
  faRouting = faRoute;
  faLegend = faInfo;
  faDownload = faDownload;

  faTimes = faTimes;

  faLayers = faMap;

  @Input() sidenavContainer: MatSidenavContainer | undefined;

  layersInToc$: Observable<LayersInMap[]>;

  @Input() ritghtMenus: Array<RightMenuInterface> | undefined;

  modeCompare: boolean = false;

  layerInCompare = Array();

  precompose: EventsKey | EventsKey[] | undefined;

  postcompose: EventsKey | EventsKey[] | undefined;

  swipeEvent: void | EventsKey | EventsKey[] | undefined;

  modeMapillary: boolean = false;

  mly: Viewer | undefined;

  mlyc: HTMLElement | null | undefined;

  point: { url: any; img: any } | undefined;

  newMarker: Feature<Point> | undefined;

  responseMapillary: { type: string; features: any[] } | undefined;

  previewPointMapillary: any;

  constructor(
    private store: Store,
    public dialog: MatDialog,
    public translate: TranslateService,
    private _snackBar: MatSnackBar,
    private bottomSheet: MatBottomSheet,
    public zone: NgZone,
    private activatedRoute: ActivatedRoute,
    public shareService: ShareService,
    public componentHelper:ComponentHelper,
    public carteService: CarteService,
    public layerService: LayersService
  ) {
    this.isLoading$ = this.store.select(selectIsLoading);
    this.project$ = this.store.select(selectProject);
    this.layersInToc$ = this.store.select(selectAllLayersInToc);
  }

  ngOnInit(): void {
    this.initializeMap();
    this.store.dispatch({ type: INITMAP });

    this.project$.subscribe(project => {
      this.project = project;
      if (project.config.data.instance.mapillary) {
        this.isMapillary = true;
      }
      if (project.config.data.instance.comparator) {
        this.isComparator = true;
      }
      if (project.config.data.instance.download) {
        this.isDownload = true;
      }
      if (project.config.data.instance.routing) {
        this.isRouting = true;
      }
      if (project.config.data.instance.altimetrie) {
        this.isAltimetrie = true;
      }
      this.mapClicked();
      this.handleMapParamsUrl();
      let drawers: QueryList<MatDrawer> = this.sidenavContainer?._drawers!;
      drawers.forEach(drawer => {
        drawer.openedChange.subscribe(() => {
          map.updateSize();
        });
      });

      map.getLayers().on('propertychange', _ObjectEvent => {
        this.store.dispatch({ type: ALL_LAYERS_IN_TOC });

        this.layersInToc$.subscribe(layersInToc => {
          if (layersInToc.length == 2 && !this.getRightMenu('toc')!.active) {
            this.openRightMenu('toc');
          }
        });
      });
    });

    let popup_lot = new Overlay({
      element: document.getElementById('popup_lot')!,
      stopEvent: true
    });
    map.addOverlay(popup_lot);

    let popup_mapillary = new Overlay({
      element: document.getElementById('popup_mapillary')!,
      stopEvent: true
    });
    map.addOverlay(popup_mapillary);

    let target = map.getTarget();
    let jTarget = typeof target === 'string' ? jQuery('#' + target) : jQuery(target!);
    let cursor_on_popup = false;
    let popup_once_open = false;

    jQuery(map.getViewport()).on('mousemove', evt => {
      let pixel = map.getEventPixel(evt.originalEvent!);

      let feature = map.forEachFeatureAtPixel(pixel!, (feature, _layer) => {
        return feature;
      });

      let layer = map.forEachFeatureAtPixel(pixel!, (_feature, layer) => {
        return layer;
      });

      if (layer && feature && layer.get('type') == 'querry') {
        //
      } else if (layer && feature && layer.get('type') == 'mapillaryPoint' && feature.getProperties()) {
        let pte = feature.getProperties();
        this.point = {
          img: pte['id'],
          url: pte['thumb_256_url']
        };

        let stActive = new Style({
          image: new CircleStyle({
            radius: 9,
            fill: new Fill({
              color: 'rgba(53, 175, 109,0.7)'
            })
          })
        });

        //@ts-ignore
        feature['setStyle'](stActive);

        map.addOverlay(popup_mapillary);
        let coordinate = Object.create(feature.getGeometry()!).getCoordinates();
        popup_mapillary.setPosition(coordinate);

        jQuery('#img_mappilary').attr('src', this.point.url);

        this.zone?.run(() => {
          this.previewPointMapillary = feature;
        });
      } else {
        if (popup_once_open) {
          jQuery('#popup_lot').on('mousemove', _evt => {
            cursor_on_popup = true;
          });

          jQuery('#popup_lot').on('mouseleave', _evt => {
            cursor_on_popup = false;

            jQuery('#popup_infos_contain').text('');
            map.removeOverlay(popup_lot);
            popup_once_open = false;
          });
          setTimeout(() => {
            if (cursor_on_popup == false) {
              jQuery('#popup_infos_contain').text('');
              map.removeOverlay(popup_lot);
              popup_once_open = false;
            }
          }, 200);
        }

        if (this.previewPointMapillary) {
          let st = new Style({
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({
                color: '#fff'
              }),
              stroke: new Stroke({
                color: 'rgba(53, 175, 109,0.7)',
                width: 3
              })
            }),
            stroke: new Stroke({
              color: 'rgba(53, 175, 109,0.7)',
              width: 4
            })
          });
          this.previewPointMapillary.setStyle(st);
          this.previewPointMapillary = undefined;
          map.removeOverlay(popup_mapillary);
          console.log(15);
          jQuery('#img_mappilary').attr('src', '');
        }
      }
    });
  }

  initializeMap() {
    map.setTarget('map');
    map.updateSize();
    map.addControl(MapHelper.scaleControl('scaleline', 'scale-map'));
    map.addControl(MapHelper.mousePositionControl('mouse-position-map'));
    this.tooglePrincipalMapLayer();
  }

  getMap(): Map {
    return map;
  }

  tooglePrincipalMapLayer() {
    this.project$.subscribe(project => {
      let principalMap = project.principalMap;
      if (principalMap) {
        this.store.dispatch(addPrincipalMap({ principalMap }));
      }
    });
  }

  handleMapParamsUrl() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['layers']) {
        let layers = params['layers'].split(';');
        this.shareService.addLayersFromUrl(layers);
      }
      if (params['feature']) {
        let parametersShared = params['feature'].split(';');
        this.shareService.displayFeatureShared(parametersShared);
      }
      if (params['share'] && params['path']) {
        let parametersShared = params['share'].split(';');
        let parametersPath = params['path'].split(';');
        this.shareService.displayLocationShared(parametersShared, parametersPath);
      }
      if (params['share'] && params['id']) {
        let parametersShared = params['share'].split(';');
        let parametersId = params['id'];
        this.shareService.displayDrawShared(parametersShared, parametersId);
      }
    });
  }

  mapClicked() {
    map.on('singleclick', evt => {
      function compare(a: { getZIndex: () => number }, b: { getZIndex: () => number }) {
        if (a.getZIndex() < b.getZIndex()) {
          return 1;
        }
        if (a.getZIndex() > b.getZIndex()) {
          return -1;
        }
        return 0;
      }

      this.zone.run(() => {
        let mapHelper = new MapHelper();

        mapHelper.mapHasCliked(evt, (data: DataFromClickOnMapInterface) => {
          if (data.type == 'raster') {
            let layers = data.data.layers.sort(compare);
            let layerTopZindex = layers.length > 0 ? layers[0] : undefined;

            if (layerTopZindex) {
              let descriptionSheetCapabilities = layerTopZindex.get('descriptionSheetCapabilities');
              this.componentHelper.openDescriptiveSheet(
                descriptionSheetCapabilities,
                mapHelper.constructLayerInMap(layerTopZindex),
                //@ts-ignore
                data.data.coord
              );
            }
          } else if (data.type == 'vector') {
            let layers = data.data.layers.sort(compare);
            let layerTopZindex = layers.length > 0 ? layers[0] : undefined;

            if (layerTopZindex) {
              let descriptionSheetCapabilities = layerTopZindex.get('descriptionSheetCapabilities');
              this.componentHelper.openDescriptiveSheet(
                descriptionSheetCapabilities,
                mapHelper.constructLayerInMap(layerTopZindex),
                //@ts-ignore
                data.data.coord,
                data.data.feature?.getGeometry(),
                data.data.feature?.getProperties()
              );
            }
          }
        });
      });
    });
  }

  changeLayer() {
    let carte = this.carteService.getCarteById(7);
    this.layerService.addLayerCarte(carte!);
  }


  toogleLeftSidenav() {
    if (this.sidenavContainer?.start?.opened) {
      this.sidenavContainer.start.close();
    } else {
      this.sidenavContainer?.start?.open();
    }
  }

  toogleRightSidenav() {
    if (this.sidenavContainer?.end?.opened) {
      this.sidenavContainer.end.close();
    } else {
      this.sidenavContainer?.end?.open();
    }
  }

  zoom_in() {
    this.store.dispatch({ type: ZOOM_PLUS });
  }
  zoom_out() {
    this.store.dispatch({ type: ZOOM_MINUS });
  }

  global_view() {
    this.project$.subscribe(project => {
      this.store.dispatch(globalView({ project }));
    });
  }

  zoomTo() {
    this.translate.get('modal').subscribe((res: any) => {
      const dialogRef = this.dialog?.open(ModalComponent, {
        width: '400px',
        data: { icon: faInfoCircle, title: res.zoomto, type: 'zoomto' }
      });

      dialogRef.afterClosed().subscribe(modal_result => {
        if (modal_result.statut) {
          let result = modal_result['data'];
          if (result.projection == 'WGS84') {
            this.project$.subscribe(project => {
              let coord_wgs84 = Array();
              coord_wgs84[0] = parseFloat(result.longitude);
              coord_wgs84[1] = parseFloat(result.latitude);
              let coord = transform([coord_wgs84[0], coord_wgs84[1]], 'EPSG:4326', 'EPSG:3857');

              let point_geojson = point(coord);
              let bbox_cam = bboxPolygon(
                // @ts-ignore
                project.config.data.instance.bbox
              );

              let bool = booleanContains(bbox_cam, point_geojson);

              if (bool) {
                this.store.dispatch(zoomToPoint({ point: new Point(coord), zoom: 17 }));

                jQuery('#setCoordOverlay').show();
                let setCoordOverlay = new Overlay({
                  position: coord,
                  element: document.getElementById('setCoordOverlay')!
                });

                map?.addOverlay(setCoordOverlay);

                jQuery('#setCoordOverlay').on('mousemove', _evt => {
                  jQuery('#setCoordOverlay fa-icon').show();
                });

                jQuery('#setCoordOverlay').on('mouseout', _evt => {
                  jQuery('#setCoordOverlay fa-icon').hide();
                });
              } else {
                this._snackBar.open(res.coordinates_out_country, res.cancel, {
                  duration: 5000,
                  verticalPosition: 'bottom',
                  horizontalPosition: 'center'
                });
              }
            });
          }
        }
      });
    });
  }

  close_setCoordOverlay() {
    jQuery('#setCoordOverlay').hide();
  }

  getRightMenu(name: string): RightMenuInterface | undefined {
    for (let index = 0; index < this.ritghtMenus!.length; index++) {
      const element = this.ritghtMenus![index];
      if (element.name == name) {
        return element;
      }
    }
    return undefined;
  }

  openRightMenu(name: string) {
    let menu = this.getRightMenu(name);
    if (menu?.active) {
      this.sidenavContainer?.end?.close();
      for (let index = 0; index < this.ritghtMenus!.length; index++) {
        const element = this.ritghtMenus![index];
        element.active = false;
      }
    } else {
      this.sidenavContainer?.end?.open();
      for (let index = 0; index < this.ritghtMenus!.length; index++) {
        const element = this.ritghtMenus![index];
        element.active = false;
      }
      menu!.active = true;
    }
  }

  countLayersInToc(): number {
    let count = 0;
    this.layersInToc$.subscribe(layersInToc => {
      count = layersInToc.length;
    });
    return count;
  }

  toogleCompare() {
    let swipe = document.getElementById('swipe');
    let mapHelper = new MapHelper();
    let layerInMap = mapHelper.getAllLayersInToc();
    if (!this.modeCompare) {
      const buttonheet_compare = this.bottomSheet.open(ButtomSheetComponent, {
        data: { type: 'compare', data: layerInMap }
      });

      this.modeCompare = true;

      buttonheet_compare.afterDismissed().subscribe(result => {
        if (!result) {
          this.modeCompare = false;
          jQuery('#swipe').hide();
        } else {
          jQuery('#swipe').show();

          let index1 = parseFloat(result['layer1']);
          let index2 = parseFloat(result['layer2']);

          let layer1: BaseLayer;
          let layer2: BaseLayer;

          map.getLayers().forEach(layer => {
            if (layer.get('nom') == layerInMap[index1]['nom']) {
              layer1 = layer;
              console.log(layer1);
              layer.setVisible(true);
            } else if (layer.get('nom') == layerInMap[index2]['nom']) {
              layer2 = layer;
              console.log(layer2);
              layer.setVisible(true);
            } else if (layer.get('properties')?.type == 'carte') {
              layer.setVisible(false);
            }
          });

          for (let i = 0; i < layerInMap.length; i++) {
            if (
              //@ts-ignore
              layerInMap[i]['properties']?.type == 'carte'
            ) {
              layerInMap[i]['visible'] = false;
            }
          }

          this.toogleVisibilityLayer(layerInMap[index1]);
          this.toogleVisibilityLayer(layerInMap[index2]);

          layerInMap[index1]['visible'] = true;
          layerInMap[index2]['visible'] = true;

          this.layerInCompare[0] = layerInMap[index1];
          this.layerInCompare[1] = layerInMap[index2];

          let lay1: any;

          if (layer1!.getZIndex() > layer2!.getZIndex()) {
            lay1 = layer1!;
          } else {
            lay1 = layer2!;
          }

          //@ts-ignore
          this.precompose = lay1.on('prerender', function (event) {
            let ctx = event.context;
            //@ts-ignore
            let width = ctx.canvas.width * (swipe!['value'] / 100);

            ctx.save();
            ctx.beginPath();
            ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
            ctx.clip();
          });

          this.postcompose = lay1.on('postrender', function (event: { context: any }) {
            let ctx = event.context;
            ctx.restore();
          });

          this.swipeEvent = swipe?.addEventListener(
            'input',
            () => {
              map.render();
            },
            false
          );
        }
      });
    } else {
      this.closeModeCompare();
    }
  }

  closeModeCompare() {
    this.layerInCompare = Array();

    unByKey(this.precompose!);
    unByKey(this.postcompose!);
    unByKey(this.swipeEvent!);

    this.modeCompare = false;

    jQuery('#swipe').hide();
  }

  toogleVisibilityLayer(data: LayersInMap) {
    console.log(data);

    if (data.visible) {
      map.getLayers().forEach(layer => {
        if (layer.get('nom') == data.nom) {
          layer.setVisible(false);
        }

        if (layer.get('type') == 'mapillaryPoint' && data.nom == 'mapillary') {
          layer.setVisible(false);
        }
      });
    } else {
      map.getLayers().forEach(layer => {
        if (layer.get('nom') == data.nom) {
          layer.setVisible(true);
        }

        if (layer.get('type') == 'mapillaryPoint' && data.nom == 'mapillary') {
          layer.setVisible(true);
        }
      });
    }
  }

  toogleMapillary() {
    if (!this.modeMapillary) {
      let data = {
        type: 'mapillary',
        nom: 'mapillary',
        type_layer: 'mapillary',
        checked: true,
        img: 'assets/images/png/mapillary-couche.png'
      };

      this.displayDataOnMap(data);

      this.modeMapillary = !this.modeMapillary;

      if (map.getView()?.getZoom()! > 14) {
        this.displayMapillaryPoint();
      }

      map.on('moveend', () => {
        this.displayMapillaryPoint();
      });
    } else {
      let data = {
        type: 'mapillary',
        nom: 'mapillary',
        type_layer: 'mapillary',
        checked: false,
        img: 'assets/images/png/mapillary-couche.png'
      };

      this.displayDataOnMap(data);
    }
  }

  displayDataOnMap(data: {
    type: string;
    nom: string;
    type_layer: string;
    checked: boolean;
    img?: string;
    zIndex_inf?: any;
    visible?: any;
  }) {
    let mapHelper = new MapHelper();
    let LayTheCopy_vector: VectorTileLayer;
    if (data.checked) {
      let zMax = mapHelper.getMaxZindexInMap();
      let strokestyle = new Style({
        stroke: new Stroke({
          color: 'rgba(53, 175, 109,0.7)',
          width: 4
        })
      });

      LayTheCopy_vector = new VectorTileLayer({
        source: new VectorTileSource({
          format: new MVT(),
          tileGrid: CreateXYZ({ maxZoom: 22 }),
          projection: 'EPSG:3857',
          url:
            'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=' +
            this.project?.config.data.instance.mapillary_api_key
        })
      });

      LayTheCopy_vector.setStyle(strokestyle);

      LayTheCopy_vector.set('name', this.space2underscore(data.nom));
      LayTheCopy_vector.set('nom', this.space2underscore('Mapillary'));
      LayTheCopy_vector.set('properties', { type: 'couche' });
      LayTheCopy_vector.set('type', data.type);
      LayTheCopy_vector.set('type_layer', data.type_layer);
      LayTheCopy_vector.set('inToc', true);
      LayTheCopy_vector.set('iconImagette', 'assets/images/png/mappilary.png');
      LayTheCopy_vector.setZIndex(zMax + 1);
      map.addLayer(LayTheCopy_vector);

      data.type_layer = 'mapillary';
      data.zIndex_inf = zMax;
    } else {
      if (this.modeMapillary && this.space2underscore(data.nom) == 'mapillary') {
        this.modeMapillary = false;

        if (!this.sidenavContainer?.start?.opened) {
          this.toogleLeftSidenav();
        }
        if (!this.sidenavContainer?.end?.opened) {
          this.toogleRightSidenav();
        }

        if (this.mly != undefined) {
          this.mly.remove();
        }
        document.getElementById('mly')!.style.display = 'none';
        map.setTarget('map');
      }

      if (this.layerInCompare.length != 0) {
        for (let i = 0; i < this.layerInCompare.length; i++) {
          if (this.layerInCompare[i].nom == data.nom) {
            this.closeModeCompare();
          }
        }
      }

      let layerInMap = mapHelper.getAllLayerInMap();

      for (let j = 0; j < layerInMap.length; j++) {
        if (layerInMap[j].get('name') == this.space2underscore(data.nom)) {
          layerInMap[j].getZIndex();
          layerInMap.splice(j, 1);
        }
      }

      data.visible = false;

      let lay = Array();
      map.getLayers().forEach(layer => {
        if (layer.get('name') == this.space2underscore(data.nom)) {
          lay.push(layer);
        }

        if (layer.get('type') == 'mapillaryPoint' && this.space2underscore(data.nom) == 'mapillary') {
          lay.push(layer);
        }
      });

      for (let i = 0; i < lay.length; i++) {
        map.removeLayer(lay[i]);
      }

      map.getLayers().forEach(layer => {
        layer.setZIndex(layer.getZIndex() - 1);
      });
    }
  }

  space2underscore(donne: string): any {
    return donne.replace(/ /g, '_');
  }

  displayMapillaryPoint() {
    if (this.modeMapillary && map.getView()?.getZoom()! > 14) {
      let bboxMap = map.getView().calculateExtent(map.getSize()).toString().split(',');

      let Amin = transform([parseFloat(bboxMap![0]), parseFloat(bboxMap![1])], 'EPSG:3857', 'EPSG:4326');
      let Amax = transform([parseFloat(bboxMap![2]), parseFloat(bboxMap![3])], 'EPSG:3857', 'EPSG:4326');

      let bboxUrl = Amin[0] + ',' + Amin[1] + ',' + Amax[0] + ',' + Amax[1];

      let url_sequence =
        'https://graph.mapillary.com/images?access_token=' +
        this.project?.config.data.instance.mapillary_api_key +
        ' &fields=id,width,sequence,geometry,thumb_original_url,height,thumb_256_url,thumb_1024_url,thumb_2048_url,compass_angle&bbox=' +
        bboxUrl;
      jQuery.get(url_sequence, data => {
        let responses = Array();

        data.data.forEach(
          (element: {
            geometry: any;
            id: any;
            width: any;
            sequence: any;
            thumb_original_url: any;
            height: any;
            thumb_256_url: any;
            thumb_1024_url: any;
            thumb_2048_url: any;
            compass_angle: any;
          }) => {
            let geometry = element.geometry;

            let properties = {
              id: element.id,
              width: element.width,
              sequence: element.sequence,
              thumb_original_url: element.thumb_original_url,
              height: element.height,
              thumb_256_url: element.thumb_256_url,
              thumb_1024_url: element.thumb_1024_url,
              thumb_2048_url: element.thumb_2048_url,
              compass_angle: element.compass_angle
            };

            responses.push({
              type: 'Feature',
              geometry: geometry,
              properties: properties
            });
          }
        );

        let geojson = {
          type: 'FeatureCollection',
          features: responses
        };

        let layer_mappilary: any;
        let layer_mappilaryPoint: any;

        map.getLayers().forEach(layer => {
          if (layer.get('name') == 'mapillary') {
            layer_mappilary = layer;
          }

          if (layer.get('name') == 'mapillaryPoint') {
            layer_mappilaryPoint = layer;
          }
        });

        let point = Array();
        for (let i = 0; i < geojson.features.length; i++) {
          for (let j = 0; j < geojson.features[i].geometry.coordinates.length; j++) {
            let coord = transform(geojson.features[i].geometry.coordinates[j], 'EPSG:4326', 'EPSG:3857');

            this.newMarker = new Feature({
              geometry: new Point(coord),
              data: { i: i, j: j, type: 'point' }
            });

            point.push(this.newMarker);
          }
        }

        let vectorFeature = new GeoJSON().readFeatures(geojson, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        let vectorSource = new VectorSource({
          features: point
        });

        vectorSource.addFeatures(vectorFeature);

        let vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({
                color: '#fff'
              }),
              stroke: new Stroke({
                color: 'rgba(53, 175, 109,0.7)',
                width: 3
              })
            }),
            stroke: new Stroke({
              color: 'rgba(53, 175, 109,0.7)',
              width: 4
            })
          })
        });

        if (layer_mappilaryPoint!) {
          layer_mappilaryPoint.getSource().clear();
          layer_mappilaryPoint.setSource(vectorSource);
        }

        vectorLayer.set('name', 'mapillaryPoint');
        vectorLayer.set('type', 'mapillaryPoint');
        vectorLayer.setZIndex(layer_mappilary.getZIndex());

        map.addLayer(vectorLayer);

        this.zone?.run(() => {
          this.responseMapillary = geojson;
        });
      });

      map.on('click', e => {
        map.forEachLayerAtPixel(e.pixel, layer => {
          if (this.modeMapillary && layer.get('type') == 'mapillaryPoint') {
            this.displayViewMapillary(e.pixel, true);
          }
        });
      });
    }
  }

  displayViewMapillary(pixel: Pixel, isClick: boolean) {
    this.toogleLeftSidenav();
    this.toogleRightSidenav();

    let faCircleLineMarkerStyle = new Style({
      image: new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: '#fff'
        }),
        stroke: new Stroke({
          color: 'rgba(53, 175, 109,0.7)',
          width: 2
        })
      }),
      stroke: new Stroke({
        color: 'rgba(53, 175, 109,0.7)',
        width: 3
      })
    });

    let faWifiStyle = new Style({
      text: new Text({
        text: '\uf1eb',
        scale: 1.2,
        font: 'normal 18px FontAwesome',
        offsetY: -10,
        rotation: 0,
        fill: new Fill({ color: 'green' }),
        stroke: new Stroke({ color: 'green', width: 3 })
      })
    });

    let updateBearingStyle = (bearing: number) => {
      let liveBearing = new Style({
        text: new Text({
          text: '\uf1eb',
          scale: 1.2,
          font: 'normal 18px FontAwesome',
          offsetY: -10,
          rotation: (bearing * Math.PI) / 180,
          fill: new Fill({ color: 'green' }),
          stroke: new Stroke({ color: 'green', width: 3 })
        })
      });

      return [liveBearing, faCircleLineMarkerStyle];
    };

    let featureOverlay = new VectorLayer({
      source: new VectorSource(),
      map: map,
      style: [faWifiStyle, faCircleLineMarkerStyle]
    });
    this.mlyc = document.getElementById('mly');
    let old_html = jQuery('#mly').html();

    if (this.sidenavContainer?.start?.opened) {
      this.sidenavContainer.start.close();
    }

    let highlight;

    this.mlyc!.style.display = 'inline';
    let feature = map.forEachFeatureAtPixel(
      pixel,
      (feature1, layer) => {
        return feature1;
      },
      {
        hitTolerance: 5
      }
    );

    jQuery('#mly').html(old_html);
    this.mly = new Viewer({
      accessToken: this.project?.config.data.instance.mapillary_api_key,
      component: { cover: false },
      container: this.mlyc!,
      imageId: this.point!.img
    });

    if (feature) {
      if (isClick) {
        let bearing = feature.get('compass_angle');
        this.mly.moveTo(feature.get('id'));
        featureOverlay.setStyle(updateBearingStyle(bearing));
      }
    } else {
      return;
    }
    if (feature !== highlight) {
      if (highlight) {
        featureOverlay.getSource()?.removeFeature(highlight);
      }

      if (feature) {
        //@ts-ignore
        featureOverlay.getSource().addFeature(feature);
      }

      highlight = feature;
    }
    this.mly.on('image', node => {
      if (featureOverlay.getVisible()) {
        featureOverlay.setVisible(false);
      }

      let lonLat = fromLonLat([node.image.originalLngLat.lng, node.image.originalLngLat.lat]);

      map.getView().setCenter(lonLat);
      this.newMarker!.getGeometry()!.setCoordinates(lonLat);
      this.newMarker!.setStyle(updateBearingStyle(node.image.compassAngle));
      map.setView(new View({ center: lonLat, zoom: 18 }));
    });

    map.setTarget('mapi');

    window.addEventListener('resize', () => {
      this.mly?.remove();
    });
  }
}
