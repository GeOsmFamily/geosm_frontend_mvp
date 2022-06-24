import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromMap from './map.reducer';

export const selectMapState = createFeatureSelector<fromMap.MapState>(fromMap.mapFeatureKey);
export const selectProject = createSelector(selectMapState, (state: fromMap.MapState) => state.project);
export const selectIsLoading = createSelector(selectMapState, (state: fromMap.MapState) => state.isLoading);
export const selectConfig = createSelector(selectMapState, (state: fromMap.MapState) => state.project.config);
export const selectGroupecartes = createSelector(selectMapState, (state: fromMap.MapState) => state.project.groupecartes);
export const selectThematiques = createSelector(selectMapState, (state: fromMap.MapState) => state.project.thematiques);
export const selectPrincipalMap = createSelector(selectMapState, (state: fromMap.MapState) => state.project.principalMap);
