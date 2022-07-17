import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable } from 'rxjs';
import { Carte, GroupeCarteInterface, GroupesCarte } from 'src/app/core/interfaces/carte-interface';
import { PrincipalMapInterface } from 'src/app/core/interfaces/principal-map-interface';
import { ApiService } from '../../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class CarteService {
  constructor(public apiService: ApiService) {}

  public groupecartes: BehaviorSubject<GroupeCarteInterface> = new BehaviorSubject<GroupeCarteInterface>({} as GroupeCarteInterface);

  getGroupeCarte(): Observable<GroupeCarteInterface> {
    return from(this.apiService.getRequest('/api/groupecartes')).pipe(
      map((groupecartes: GroupeCarteInterface) => {
        this.groupecartes.next(groupecartes);
        return groupecartes;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  getAllGroupesCarte(): GroupesCarte[] {
    return this.groupecartes.getValue().data.groupes_cartes;
  }

  getPrincipalCarte(): PrincipalMapInterface | null {
    for (let index = 0; index < this.groupecartes.getValue().data.groupes_cartes.length; index++) {
      const groupecarte = this.groupecartes.getValue().data.groupes_cartes[index];
      for (let index2 = 0; index2 < groupecarte.cartes.length; index2++) {
        const carte = groupecarte.cartes[index2];
        if (carte.principal) {
          return {
            groupecarte: groupecarte,
            carte: carte
          };
        }
      }
    }
    return null;
  }

  getGroupeCarteByCarteId(id: number): GroupesCarte | null {
    for (let index = 0; index < this.groupecartes.getValue().data.groupes_cartes.length; index++) {
      const groupecarte = this.groupecartes.getValue().data.groupes_cartes[index];
      for (let index2 = 0; index2 < groupecarte.cartes.length; index2++) {
        const carte = groupecarte.cartes[index2];
        if (carte.id === id) {
          return groupecarte;
        }
      }
    }
    return null;
  }

  getCarteById(id: number): Carte | null {
    for (let index = 0; index < this.groupecartes.getValue().data.groupes_cartes.length; index++) {
      const groupecarte = this.groupecartes.getValue().data.groupes_cartes[index];
      for (let index2 = 0; index2 < groupecarte.cartes.length; index2++) {
        const carte = groupecarte.cartes[index2];
        if (carte.id === id) {
          return carte;
        }
      }
    }
    return null;
  }

  getGroupeCarteFromId(id: number): GroupesCarte | null {
    for (let index = 0; index < this.groupecartes.getValue().data.groupes_cartes.length; index++) {
      const groupecarte = this.groupecartes.getValue().data.groupes_cartes[index];
      if (groupecarte.id === id) {
        return groupecarte;
      }
    }
    return null;
  }

  getCarteFromIdAndGroupeCarteId(id: number, idGroupeCarte: number): Carte | null {
    for (let index = 0; index < this.groupecartes.getValue().data.groupes_cartes.length; index++) {
      const groupecarte = this.groupecartes.getValue().data.groupes_cartes[index];
      if (groupecarte.id === idGroupeCarte) {
        for (let index2 = 0; index2 < groupecarte.cartes.length; index2++) {
          const carte = groupecarte.cartes[index2];
          if (carte.id === id) {
            return carte;
          }
        }
      }
    }
    return null;
  }
}
