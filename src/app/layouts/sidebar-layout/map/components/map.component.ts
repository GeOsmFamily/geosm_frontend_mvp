import { Component, Input, OnInit, QueryList, ViewChild } from '@angular/core';
import { Map, View, LayerGroup, Point } from 'src/app/core/modules/openlayers';
import { MapHelper } from './../helpers/maphelper';
import { MatDrawer, MatSidenavContainer } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MapState } from '../states/map.reducer';
import { selectIsLoading, selectProject } from '../states/map.selector';
import { addPrincipalMap, globalView, INITMAP, zoomToPoint, ZOOM_MINUS, ZOOM_PLUS } from '../states/map.actions';
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
  faRoute
} from '@fortawesome/free-solid-svg-icons';
import { HistoryMap } from '../models/historymap';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { TranslateService } from '@ngx-translate/core';
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

  userMovedMap: boolean = false;

  historyMapPosition: Array<HistoryMap> = [];

  indexHistoryMapPosition = 0;

  @Input() sidenavContainer: MatSidenavContainer | undefined;

  constructor(private store: Store<MapState>, public dialog: MatDialog, public translate: TranslateService) {
    this.isLoading$ = this.store.select(selectIsLoading);
    this.project$ = this.store.select(selectProject);
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
        // console.log(ObjectEvent);
      });

      map.on('movestart', () => {
        if (!this.userMovedMap) {
          this.historyMapPosition = [
            {
              coordinates: [map.getView().getCenter()![0]!, map.getView().getCenter()![1]!],
              zoom: map.getView().getZoom()!
            }
          ];
          this.indexHistoryMapPosition = 0;
        }
      });

      map.on('moveend', () => {
        if (!this.userMovedMap) {
          this.historyMapPosition[1] = {
            coordinates: [map.getView().getCenter()![0]!, map.getView().getCenter()![1]!],
            zoom: map.getView().getZoom()!
          };
          this.indexHistoryMapPosition = 0;
        }
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

  next_view() {
    if (this.historyMapPosition.length > 0 && this.indexHistoryMapPosition == 1) {
      this.userMovedMap = true;
      this.indexHistoryMapPosition = 0;
      this.store.dispatch(zoomToPoint({ point: new Point(this.historyMapPosition[1].coordinates), zoom: this.historyMapPosition[1].zoom }));
      setTimeout(() => {
        this.userMovedMap = false;
      }, 2000);
    }
  }

  previous_view() {
    if (this.historyMapPosition.length > 0 && this.indexHistoryMapPosition == 0) {
      this.userMovedMap = true;
      this.indexHistoryMapPosition = 1;

      this.store.dispatch(zoomToPoint({ point: new Point(this.historyMapPosition[0].coordinates), zoom: this.historyMapPosition[0].zoom }));

      setTimeout(() => {
        this.userMovedMap = false;
      }, 2000);
    }
  }

  zoomTo() {
    this.translate.get('modal').subscribe((res: any) => {
        const dialogRef = this.dialog?.open(ModalComponent, {
          width: '400px',
          data: { icon: faInfoCircle, title: res.zoomto, type: 'zoomto' }
        });

      dialogRef.afterClosed().subscribe(result => {

      })
    });

  }
}
