import { Injectable } from '@angular/core';
import { catchError, from, map, Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api/api.service';
import { environment } from 'src/environments/environment';
import { LimitesInterface, Feature } from '../interfaces/limite';
import { QgisInterface } from '../interfaces/qgis';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  constructor(private apiService: ApiService) {}

  searchLimitesAdministrative(query: string): Observable<LimitesInterface> {
    let limitesFilter: Feature[] = [];
    return from(
      this.apiService.getRequestFromOtherHost(
        'https://nominatim.openstreetmap.org/search?q=' +
          query +
          '&format=geojson&polygon=0&addressdetails=1&countrycodes=' +
          environment.country_code
      )
    ).pipe(
      map((limites: LimitesInterface) => {
        limites.features.forEach(feature => {
          if (feature.type === 'administrative') {
            limitesFilter.push(feature);
          }
        });
        limites.features = limitesFilter;
        return limites;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  searchDataInLimit(pathProjectQgis: string, layerName: string, bbox: string): Observable<QgisInterface> {
    return from(
      this.apiService.getRequestFromOtherHost(
        environment.url_qgis +
          '/ows?map=' +
          pathProjectQgis +
          '&SERVICE=WFS&VERSION=1.1.0&REQUEST=GETFEATURE&outputFormat=GeoJSON&TypeName=' +
          layerName +
          '&bbox=' +
          bbox
      )
    ).pipe(
      map((qgis: QgisInterface) => {
        return qgis;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }
}
