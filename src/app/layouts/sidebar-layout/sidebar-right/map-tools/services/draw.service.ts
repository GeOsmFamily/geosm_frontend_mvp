import { Injectable } from '@angular/core';
import { catchError, from, map, Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api/api.service';
import { Draw, DrawInterface } from '../interfaces/draw';
import { Draws } from '../interfaces/draws';

@Injectable({
  providedIn: 'root'
})
export class DrawService {
  constructor(public apiService: ApiService) {}

  saveDraw(draws: Draw[]): Observable<DrawInterface> {
    return from(this.apiService.postRequest('/api/draws', { draws: draws })).pipe(
      map((response: DrawInterface) => {
        return response;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  getAllDrawByCode(code: string): Observable<Draws> {
    return from(this.apiService.getRequest(`/api/draws/code/${code}`)).pipe(
      map((response: Draws) => {
        return response;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }
}
