import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable } from 'rxjs';
import { ConfigInterface } from 'src/app/core/interfaces/config-interface';
import { environment } from 'src/environments/environment';
import { ApiService } from '../../api/api.service';
import { GeoJSON } from '../../../modules/openlayers';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(public apiService: ApiService) {}

  public config: BehaviorSubject<ConfigInterface> = new BehaviorSubject<ConfigInterface>({} as ConfigInterface);

  getConfigInstance(): Observable<ConfigInterface> {
    return from(this.apiService.getRequest('/api/instances/' + environment.instance_id)).pipe(
      map((config: ConfigInterface) => {
        this.config.next(config);
        return config;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  getRoiInstance() {
    return from(this.apiService.getRequestFromOtherHost('/assets/limites/principal.geojson')).pipe(
      map(roi => {
        return roi['features'][0]['geometry'];
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  getExtentOfProject(projection = false): [number, number, number, number] {
    var feature;

    let paramsFeature = {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    };
    if (!projection) {
      paramsFeature = {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326'
      };
    }

    if (!feature) {
      var features = new GeoJSON().readFeatures(this.config.value.roiGeojson, paramsFeature);
      if (features.length > 0) {
        feature = features[0];
      }
    }

    if (feature) {
      //@ts-ignore
      return feature.getGeometry().getExtent();
    } else {
      return null!;
    }
  }

  getConfigProjet(): ConfigInterface {
    return this.config.getValue();
  }
}
