import { Action, createReducer, on } from '@ngrx/store';
import { PrincipalMapInterface } from 'src/app/core/interfaces/principal-map-interface';
import { ProjectInterface } from 'src/app/core/interfaces/project-interface';
import { MapHelper } from '../helpers/maphelper';
import {
  addPrincipalMap,
  initMap,
  initMapFailure,
  initMapSuccess,
  principalCarte,
  principalCarteFailure,
  principalCarteSuccess,
  removePrincipalMap
} from './map.actions';

export const mapFeatureKey = 'map';

export interface MapState {
  project: ProjectInterface;
  principalMap?: PrincipalMapInterface;
  isLoading: boolean;
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
          bbox: []
        }
      },
      roiGeojson: {}
    },
    groupecartes: []
  },
  isLoading: false,
  principalMap: undefined
};

export const mapReducer = createReducer(
  initialState,
  on(initMap, state => ({ ...state, isLoading: true })),
  on(initMapSuccess, (state, { project }) => {
    var mapHelper = new MapHelper();
    mapHelper.initMapProject(project);

    return { ...state, project, isLoading: false };
  }),
  on(initMapFailure, (state, { message }) => ({ ...state, isLoading: false, config: { ...state.project, message } })),
  on(principalCarte, state => ({ ...state, isLoading: true })),
  on(principalCarteSuccess, (state, { principalMap }) => ({ ...state, principalMap: principalMap, isLoading: false })),
  on(principalCarteFailure, (state, { message }) => ({ ...state, isLoading: false, config: { ...state.project, message } })),
  on(addPrincipalMap, (state, { principalMap }) => {
    var mapHelper = new MapHelper();
    mapHelper.addPrincipalMap(principalMap);
    return { ...state, principalMap: principalMap };
  }),
  on(removePrincipalMap, (state, { principalMap }) => {
    var mapHelper = new MapHelper();
    mapHelper.removePrincipalMap(principalMap);
    return { ...state, principalMap: principalMap };
  })
);

export function mapreducer(state: MapState | undefined, action: Action): any {
  return mapReducer(state, action);
}