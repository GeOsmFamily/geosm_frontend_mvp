import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable } from 'rxjs';
import { Couche, Thematique, ThematiqueInterface } from 'src/app/core/interfaces/thematique-interface';
import { environment } from 'src/environments/environment';
import { ApiService } from '../../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ThematiqueService {
  constructor(public apiService: ApiService) {}

  public thematiques: BehaviorSubject<ThematiqueInterface> = new BehaviorSubject<ThematiqueInterface>({} as ThematiqueInterface);

  getThematiques(): Observable<ThematiqueInterface> {
    return from(this.apiService.getRequest('/api/thematiques/instance/' + environment.instance_id)).pipe(
      map((thematiques: ThematiqueInterface) => {
        this.thematiques.next(thematiques);
        return thematiques;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  getAllThematiques(): Thematique[] {
    return this.thematiques.getValue().data.thematiques;
  }

  getThematiqueFromIdCouche(idCouche: number): Thematique | null {
    for (let index = 0; index < this.thematiques.getValue().data.thematiques.length; index++) {
      const thematique = this.thematiques.getValue().data.thematiques[index];
      for (let index2 = 0; index2 < thematique.sous_thematiques.length; index2++) {
        const sousThematique = thematique.sous_thematiques[index2];
        for (let index3 = 0; index3 < sousThematique.couches.length; index3++) {
          const couche = sousThematique.couches[index3];
          if (couche.id === idCouche) {
            return thematique;
          }
        }
      }
    }
    return null;
  }

  getThematiqueFromId(id: number): Thematique | null {
    for (let index = 0; index < this.thematiques.getValue().data.thematiques.length; index++) {
      const thematique = this.thematiques.getValue().data.thematiques[index];
      if (thematique.id === id) {
        return thematique;
      }
    }
    return null;
  }

  getCoucheFromIdCoucheAndThematiqueId(idCouche: number, idThematique: number): Couche | null {
    for (let index = 0; index < this.thematiques.getValue().data.thematiques.length; index++) {
      const thematique = this.thematiques.getValue().data.thematiques[index];
      if (thematique.id === idThematique) {
        for (let index2 = 0; index2 < thematique.sous_thematiques.length; index2++) {
          const sousThematique = thematique.sous_thematiques[index2];
          for (let index3 = 0; index3 < sousThematique.couches.length; index3++) {
            const couche = sousThematique.couches[index3];
            if (couche.id === idCouche) {
              return couche;
            }
          }
        }
      }
    }
    return null;
  }

  getCoucheFromId(id: number): Couche | null {
    for (let index = 0; index < this.thematiques.getValue().data.thematiques.length; index++) {
      const thematique = this.thematiques.getValue().data.thematiques[index];
      for (let index2 = 0; index2 < thematique.sous_thematiques.length; index2++) {
        const sousThematique = thematique.sous_thematiques[index2];
        for (let index3 = 0; index3 < sousThematique.couches.length; index3++) {
          const couche = sousThematique.couches[index3];
          if (couche.id === id) {
            return couche;
          }
        }
      }
    }
    return null;
  }
}
