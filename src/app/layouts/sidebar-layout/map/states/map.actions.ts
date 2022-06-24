import { Point } from '../../../../core/modules/openlayers';
import { createAction, props } from '@ngrx/store';
import { PrincipalMapInterface } from 'src/app/core/interfaces/principal-map-interface';
import { ProjectInterface } from 'src/app/core/interfaces/project-interface';
import { HistoryMap } from '../models/historymap';

export const INITMAP = '[Map] Init Map';
export const INITMAP_SUCCESS = '[Map] Init Map Success';
export const INITMAP_FAILURE = '[Map] Init Map Failure';
export const PRINCIPAL_MAP = '[Map] Principal Map';
export const PRINCIPAL_MAP_SUCCESS = '[Map] Principal Map Success';
export const PRINCIPAL_MAP_FAILURE = '[Map] Principal Map Failure';
export const ADD_PRINCIPAL_MAP = '[Map] Add Principal Map';
export const REMOVE_PRINCIPAL_MAP = '[Map] Remove Principal Map';
export const ZOOM_PLUS = '[Map] Zoom Plus';
export const ZOOM_MINUS = '[Map] Zoom Minus';
export const GLOBAL_VIEW = '[Map] Global View';
export const ZOOM_TO_POINT = '[Map] Zoom To Point';


export const initMap = createAction(INITMAP);
export const initMapSuccess = createAction(INITMAP_SUCCESS, props<{ project: ProjectInterface }>());
export const initMapFailure = createAction(INITMAP_FAILURE, props<{ message: string }>());
export const principalCarte = createAction(PRINCIPAL_MAP);
export const principalCarteSuccess = createAction(PRINCIPAL_MAP_SUCCESS, props<{ principalMap: PrincipalMapInterface }>());
export const principalCarteFailure = createAction(PRINCIPAL_MAP_FAILURE, props<{ message: string }>());
export const addPrincipalMap = createAction(ADD_PRINCIPAL_MAP, props<{ principalMap: PrincipalMapInterface }>());
export const removePrincipalMap = createAction(REMOVE_PRINCIPAL_MAP, props<{ principalMap: PrincipalMapInterface }>());
export const zoomPlus = createAction(ZOOM_PLUS);
export const zoomMinus = createAction(ZOOM_MINUS);
export const globalView = createAction(GLOBAL_VIEW, props<{ project: ProjectInterface }>());
export const zoomToPoint = createAction(ZOOM_TO_POINT, props<{ point: Point, zoom:number }>());

