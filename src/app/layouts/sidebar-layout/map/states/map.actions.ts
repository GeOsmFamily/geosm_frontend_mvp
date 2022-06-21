import { createAction, props } from '@ngrx/store';
import { PrincipalMapInterface } from 'src/app/core/interfaces/principal-map-interface';
import { ProjectInterface } from 'src/app/core/interfaces/project-interface';

export const INITMAP = '[Map] Init Map';
export const INITMAP_SUCCESS = '[Map] Init Map Success';
export const INITMAP_FAILURE = '[Map] Init Map Failure';
export const PRINCIPAL_MAP = '[Map] Principal Map';
export const PRINCIPAL_MAP_SUCCESS = '[Map] Principal Map Success';
export const PRINCIPAL_MAP_FAILURE = '[Map] Principal Map Failure';
export const ADD_PRINCIPAL_MAP = '[Map] Add Principal Map';
export const REMOVE_PRINCIPAL_MAP = '[Map] Remove Principal Map';

export const initMap = createAction(INITMAP);
export const initMapSuccess = createAction(INITMAP_SUCCESS, props<{ project: ProjectInterface }>());
export const initMapFailure = createAction(INITMAP_FAILURE, props<{ message: string }>());
export const principalCarte = createAction(PRINCIPAL_MAP);
export const principalCarteSuccess = createAction(PRINCIPAL_MAP_SUCCESS, props<{ principalMap: PrincipalMapInterface }>());
export const principalCarteFailure = createAction(PRINCIPAL_MAP_FAILURE, props<{ message: string }>());
export const addPrincipalMap = createAction(ADD_PRINCIPAL_MAP, props<{ principalMap: PrincipalMapInterface }>());
export const removePrincipalMap = createAction(REMOVE_PRINCIPAL_MAP, props<{ principalMap: PrincipalMapInterface }>());
