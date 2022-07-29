import { Injectable } from '@angular/core';
import { catchError, from, map, Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api/api.service';
import { environment } from 'src/environments/environment';
import { Couche, CoucheInterface } from '../interfaces/couche';
import { Feature, Nominatim } from '../interfaces/nominatim';
import { SearchInterface } from '../interfaces/search';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(public apiService: ApiService) {}

  searchNominatim(query: string): Observable<SearchInterface[]> {
    return from(
      this.apiService.getRequestFromOtherHost(
        'https://nominatim.openstreetmap.org/search?q=' +
          query +
          '&format=geojson&polygon_geojson=1&addressdetails=1&countrycodes=' +
          environment.country_code
      )
    ).pipe(
      map((data: Nominatim) => {
        const results: SearchInterface[] = [];
        data.features.forEach((element: Feature) => {
          results.push({
            name: element.properties.display_name,
            id: element.properties.osm_id,
            lat: element.geometry.coordinates[1],
            lng: element.geometry.coordinates[0],
            logo_src: element.properties.icon ?? 'assets/images/svg/icon-position-pin.svg',
            details: element.properties.type,
            ...element
          });
        });
        return results;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  searchCouches(query: string): Observable<SearchInterface[]> {
    return from(this.apiService.getRequest('/api/search/couches?q=' + query)).pipe(
      map((data: CoucheInterface) => {
        const results: SearchInterface[] = [];
        data.data.couches.forEach((element: Couche) => {
          results.push({
            type: 'couche',
            name: element.nom,
            logo_src: environment.url_services + element.logo,
            details: element.sousThematique[0].thematique[0].nom,
            couche: element,
            ...element
          });
        });
        return results;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }
}
