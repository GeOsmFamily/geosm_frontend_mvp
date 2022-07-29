import { createAction, props } from '@ngrx/store';
import { SearchInterface } from '../interfaces/search';

export const SEARCH_QUERY = '[Search] Search Query';
export const SEARCH_SUCCESS = '[Search] Search Success';
export const SEARCH_FAILURE = '[Search] Search Failure';

export const searchQuery = createAction(SEARCH_QUERY, props<{ query: string }>());
export const searchSuccess = createAction(SEARCH_SUCCESS, props<{ results: SearchInterface[] }>());
export const searchFailure = createAction(SEARCH_FAILURE, props<{ message: string }>());
