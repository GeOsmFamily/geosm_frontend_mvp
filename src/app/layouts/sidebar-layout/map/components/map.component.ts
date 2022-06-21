import { Component, OnInit, QueryList, ViewChild } from '@angular/core';
import { Map, View, LayerGroup } from 'src/app/core/modules/openlayers';
import { MapHelper } from './../helpers/maphelper';
import { MatDrawer, MatSidenavContainer } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import {  Store } from '@ngrx/store';
import { MapState } from '../states/map.reducer';
import { selectIsLoading, selectProject } from '../states/map.selector';
import { addPrincipalMap, INITMAP } from '../states/map.actions';
import { ProjectInterface } from 'src/app/core/interfaces/project-interface';
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

  @ViewChild(MatSidenavContainer, { static: true })
  sidenavContainer: MatSidenavContainer | undefined;

  constructor(private store: Store<MapState>) {
    this.isLoading$ = this.store.select((selectIsLoading));
    this.project$ = this.store.select((selectProject));
  }

  ngOnInit(): void {
    this.initializeMap();
    this.store.dispatch({ type: INITMAP });
  }

  initializeMap() {
    map.setTarget('map');
    map.updateSize();
    map.addControl(MapHelper.scaleControl('scaleline', 'scale-map'));
    map.addControl(MapHelper.mousePositionControl('mouse-position-map'));
    this.tooglePrincipalMapLayer();

    var drawers: QueryList<MatDrawer> = this.sidenavContainer?._drawers!;
    if (drawers) {
      drawers.forEach(drawer => {
        drawer.openedChange.subscribe(() => {
          map.updateSize();
        });
      });
    }
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
}
