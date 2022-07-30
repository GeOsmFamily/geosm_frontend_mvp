import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromSearch from './search.reducer';

export const selectSearchState = createFeatureSelector<fromSearch.SearchState>(fromSearch.searchFeatureKey);
export const selectSearch = createSelector(
  selectSearchState,

  (state: fromSearch.SearchState) => state.searchResult
);

export const selectIsLoading = createSelector(
  selectSearchState,

  (state: fromSearch.SearchState) => state.isLoading
);

export const selectIsLoadingSuccess = createSelector(
  selectSearchState,

  (state: fromSearch.SearchState) => state.isLoadingSuccess
);
