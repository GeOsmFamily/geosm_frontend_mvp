import { Component, Input, OnInit, QueryList, ViewChild } from '@angular/core';
import { Map, View, LayerGroup, Point, Overlay } from 'src/app/core/modules/openlayers';
import { MapHelper } from './../helpers/maphelper';
import { MatDrawer, MatSidenavContainer } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MapState } from '../states/map.reducer';
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
  faMapMarker,
  faMinus,
  faPlus,
  faRoute,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { HistoryMap } from '../interfaces/historymap';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { TranslateService } from '@ngx-translate/core';
import { transform } from 'ol/proj';
import { bboxPolygon, booleanContains, point } from '@turf/turf';
import * as jQuery from 'jquery';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LayersInMap } from '../interfaces/layerinmap';
import { RightMenuInterface } from '../../sidebar-right/interfaces/rightMenuInterface';
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
  isLoading$: Observable<boolean>;
  project$: Observable<ProjectInterface>;

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

  @Input() sidenavContainer: MatSidenavContainer | undefined;

  layersInToc$: Observable<LayersInMap[]>;

  @Input() ritghtMenus: Array<RightMenuInterface> | undefined;

  constructor(
    private store: Store<MapState>,
    public dialog: MatDialog,
    public translate: TranslateService,
    private _snackBar: MatSnackBar
  ) {
    this.isLoading$ = this.store.select(selectIsLoading);
    this.project$ = this.store.select(selectProject);
    this.layersInToc$ = this.store.select(selectAllLayersInToc);
  }

  ngOnInit(): void {
    this.initializeMap();
    this.store.dispatch({ type: INITMAP });

    this.project$.subscribe(project => {
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

      var drawers: QueryList<MatDrawer> = this.sidenavContainer?._drawers!;
      drawers.forEach(drawer => {
        drawer.openedChange.subscribe(() => {
          map.updateSize();
        });
      });

      map.getLayers().on('propertychange', ObjectEvent => {
        this.store.dispatch({ type: ALL_LAYERS_IN_TOC });

        this.layersInToc$.subscribe(layersInToc => {
          if (layersInToc.length == 2 && !this.getRightMenu('toc')!.active) {
            this.openRightMenu('toc');
          }
        });
      });
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
      var principalMap = project.principalMap;
      if (principalMap) {
        this.store.dispatch(addPrincipalMap({ principalMap }));
      }
    });
  }

  toogleLeftSidenav() {
    if (this.sidenavContainer?.start?.opened) {
      this.sidenavContainer.start.close();
    } else {
      this.sidenavContainer?.start?.open();
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
          var result = modal_result['data'];
          if (result.projection == 'WGS84') {
            this.project$.subscribe(project => {
              var coord_wgs84 = Array();
              coord_wgs84[0] = parseFloat(result.longitude);
              coord_wgs84[1] = parseFloat(result.latitude);
              var coord = transform([coord_wgs84[0], coord_wgs84[1]], 'EPSG:4326', 'EPSG:3857');

              var point_geojson = point(coord);
              var bbox_cam = bboxPolygon(
                // @ts-ignore
                project.config.data.instance.bbox
              );

              var bool = booleanContains(bbox_cam, point_geojson);

              if (bool) {
                this.store.dispatch(zoomToPoint({ point: new Point(coord), zoom: 17 }));

                jQuery('#setCoordOverlay').show();
                var setCoordOverlay = new Overlay({
                  position: coord,
                  element: document.getElementById('setCoordOverlay')!
                });

                map?.addOverlay(setCoordOverlay);

                jQuery('#setCoordOverlay').on('mousemove', evt => {
                  jQuery('#setCoordOverlay fa-icon').show();
                });

                jQuery('#setCoordOverlay').on('mouseout', evt => {
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
    var menu = this.getRightMenu(name);
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
    var count = 0;
    this.layersInToc$.subscribe(layersInToc => {
      count = layersInToc.length;
    });
    return count;
  }
}
