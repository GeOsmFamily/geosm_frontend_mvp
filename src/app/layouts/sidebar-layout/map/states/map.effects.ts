import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, map, switchMap } from 'rxjs';
import { CarteService } from 'src/app/core/services/geosm/carte/carte.service';
import { ConfigService } from 'src/app/core/services/geosm/config/config.service';
import { ThematiqueService } from 'src/app/core/services/geosm/thematique/thematique.service';
import * as mapAction from './map.actions';

@Injectable()
export class MapEffects {
  constructor(
    private actions$: Actions,
    private thematiqueService: ThematiqueService,
    private carteService: CarteService,
    private configService: ConfigService
  ) {}

  loadProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(mapAction.initMap),
      switchMap(() => {
        return forkJoin({
          thematiqueInterface: this.thematiqueService.getThematiques(),
          groupecarteInterface: this.carteService.getGroupeCarte(),
          configInterface: this.configService.getConfigInstance(),
          roi: this.configService.getRoiInstance()
        }).pipe(
          map(({ thematiqueInterface, groupecarteInterface, configInterface, roi }) => {
            configInterface.roiGeojson = roi;
            return mapAction.initMapSuccess({
              project: {
                thematiques: thematiqueInterface.data.thematiques,
                groupecartes: groupecarteInterface.data.groupes_cartes,
                config: configInterface,
                principalMap: this.carteService.getPrincipalCarte()
              }
            });
          })
        );
      })
    );
  });
}
