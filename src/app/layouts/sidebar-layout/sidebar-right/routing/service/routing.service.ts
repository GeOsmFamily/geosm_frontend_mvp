import { Injectable } from '@angular/core';
import { catchError, from, map, Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api/api.service';
import { NominatimReverse } from '../interfaces/nominatim';
import { Route } from '../interfaces/route';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  constructor(public apiService: ApiService) {}

  nominatimReverse(lat: string, lon: string): Observable<NominatimReverse> {
    return from(
      this.apiService.getRequestFromOtherHost(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon + '&zoom=18&addressdetails=1'
      )
    ).pipe(
      map((response: NominatimReverse) => {
        return response;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  getRoute(depart: number[], arrivee: number[], passage?: number[]): Observable<Route> {
    let param: string;
    if (passage) {
       param = depart[0] + ',' + depart[1] + ';' + passage![0] + ',' + passage![1] + ';' + arrivee[0] + ',' + arrivee[1];
    } else {
      param = depart[0] + ',' + depart[1] + ';' + arrivee[0] + ',' + arrivee[1];
    }
    return from(
      this.apiService.getRequestFromOtherHost(
        'https://router.project-osrm.org/route/v1/driving/' + param + '?overview=full'
      )
    ).pipe(
      map((route: Route) => {
        return route;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }
}
