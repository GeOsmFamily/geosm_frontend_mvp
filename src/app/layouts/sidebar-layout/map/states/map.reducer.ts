import { Action, createReducer, on } from '@ngrx/store';
import { PrincipalMapInterface } from 'src/app/core/interfaces/principal-map-interface';
import { ProjectInterface } from 'src/app/core/interfaces/project-interface';
import { MapHelper } from '../helpers/maphelper';
import { LayersInMap } from '../interfaces/layerinmap';
import {
  addPrincipalMap,
  allLayersInToc,
  globalView,
  initMap,
  initMapFailure,
  initMapSuccess,
  principalCarte,
  principalCarteFailure,
  principalCarteSuccess,
  removePrincipalMap,
  zoomMinus,
  zoomPlus,
  zoomToPoint
} from './map.actions';

export const mapFeatureKey = 'map';

export interface MapState {
  project: ProjectInterface;
  principalMap?: PrincipalMapInterface;
  isLoading: boolean;
  layersintoc: LayersInMap[];
}

export const initialState: MapState = {
  project: {
    thematiques: [],
    principalMap: null,
    config: {
      success: false,
      message: '',
      data: {
        instance: {
          id: 0,
          nom: '',
          mapillary: false,
          comparator: false,
          altimetrie: false,
          download: false,
          routing: false,
          app_version: '',
          app_github_url: '',
          app_email: '',
          app_whatsapp: '',
          app_facebook: '',
          app_twitter: '',
          bbox: [],
          mapillary_api_key: ''
        }
      },
      roiGeojson: {}
    },
    groupecartes: []
  },
  isLoading: false,
  principalMap: undefined,
  layersintoc: []
};

export const mapReducer = createReducer(
  initialState,
  on(initMap, state => ({ ...state, isLoading: true })),
  on(initMapSuccess, (state, { project }) => {
    let mapHelper = new MapHelper();
    mapHelper.initMapProject(project);

    return { ...state, project, isLoading: false };
  }),
  on(initMapFailure, (state, { message }) => ({ ...state, isLoading: false, config: { ...state.project, message } })),
  on(principalCarte, state => ({ ...state, isLoading: true })),
  on(principalCarteSuccess, (state, { principalMap }) => ({ ...state, principalMap: principalMap, isLoading: false })),
  on(principalCarteFailure, (state, { message }) => ({ ...state, isLoading: false, config: { ...state.project, message } })),
  on(addPrincipalMap, (state, { principalMap }) => {
    let mapHelper = new MapHelper();
    mapHelper.addPrincipalMap(principalMap);
    return { ...state, principalMap: principalMap };
  }),
  on(removePrincipalMap, (state, { principalMap }) => {
    let mapHelper = new MapHelper();
    mapHelper.removePrincipalMap(principalMap);
    return { ...state, principalMap: principalMap };
  }),
  on(zoomPlus, state => {
    let mapHelper = new MapHelper();
    mapHelper.addMapZoomAnimation(mapHelper.map?.getView().getZoom()! + 1);
    return { ...state };
  }),
  on(zoomMinus, state => {
    let mapHelper = new MapHelper();
    mapHelper.addMapZoomAnimation(mapHelper.map?.getView().getZoom()! - 1);
    return { ...state };
  }),
  on(globalView, (state, { project }) => {
    let mapHelper = new MapHelper();
    mapHelper.map?.getView().fit(project.config.data.instance.bbox, {
      size: mapHelper.map.getSize(),
      duration: 1000
    });
    return { ...state };
  }),
  on(zoomToPoint, (state, { point, zoom }) => {
    let mapHelper = new MapHelper();

    mapHelper.fit_view(point, zoom);

    return { ...state };
  }),
  on(allLayersInToc, state => {
    let mapHelper = new MapHelper();
    let layersinToc = mapHelper.getAllLayersInToc();
    return { ...state, layersintoc: layersinToc };
  })
);

export function mapreducer(state: MapState | undefined, action: Action): any {
  return mapReducer(state, action);
}
