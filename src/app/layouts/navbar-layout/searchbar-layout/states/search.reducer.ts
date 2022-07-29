import { Action, createReducer, on } from '@ngrx/store';
import { SearchInterface } from '../interfaces/search';
import { searchFailure, searchQuery, searchSuccess } from './search.actions';

export const searchFeatureKey = 'search';

export interface SearchState {
  searchResult: SearchInterface[];
  isLoading: boolean;
  isLoadingSuccess: boolean;
  isLoadingFailure: boolean;
}

export const initialState: SearchState = {
  searchResult: [],
  isLoading: false,
  isLoadingSuccess: false,
  isLoadingFailure: false
};

export const searchReducer = createReducer(
  initialState,
  on(searchQuery, (state, { query }) => ({
    searchResult: [],
    isLoading: true,
    isLoadingSuccess: false,
    isLoadingFailure: false
  })),
  on(searchSuccess, (state, { results }) => ({
    searchResult: results,
    isLoading: false,
    isLoadingSuccess: true,
    isLoadingFailure: false
  })),
  on(searchFailure, (state, { message }) => ({
    searchResult: [],
    isLoading: false,
    isLoadingSuccess: false,
    isLoadingFailure: true
  }))
);

export function searchreducer(state: SearchState | undefined, action: Action): any {
  return searchReducer(state, action);
}
