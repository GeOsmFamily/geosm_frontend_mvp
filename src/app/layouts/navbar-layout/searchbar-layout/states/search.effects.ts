import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, map, of, switchMap } from 'rxjs';
import { SearchInterface } from '../interfaces/search';
import * as searchAction from './search.actions';
import { SearchService } from '../service/search.service';

@Injectable()
export class SearchEffects {
  results: SearchInterface[] = [];
  constructor(private actions$: Actions, private searchService: SearchService) {}

  searchQuery$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(searchAction.SEARCH_QUERY),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(({ query }) => {
        return forkJoin({
          nominatim: this.searchService.searchNominatim(query)
        }).pipe(
          map(({ nominatim }) => {
            return searchAction.searchSuccess({
              results: [...nominatim]
            });
          }),
          catchError(error => of(searchAction.searchFailure({ message: error })))
        );
      })
    );
  });
}
