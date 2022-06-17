import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfigInterface } from '../../interfaces/config-interface';
import { Couche, Thematique, ThematiqueInterface } from '../../interfaces/thematique-interface';
import { ApiService } from '../api/api.service';
import { GeoJSON } from '../../modules/openlayers';
import { Carte, GroupeCarteInterface, GroupesCarte } from '../../interfaces/carte-interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(public apiService: ApiService) {}

  states: BehaviorSubject<{ loadProjectData: boolean }> = new BehaviorSubject<{
    loadProjectData: boolean;
  }>({ loadProjectData: false });

  public thematiques: BehaviorSubject<ThematiqueInterface> = new BehaviorSubject<ThematiqueInterface>({} as ThematiqueInterface);

  public groupecartes: BehaviorSubject<GroupeCarteInterface> = new BehaviorSubject<GroupeCarteInterface>({} as GroupeCarteInterface);

  public config: BehaviorSubject<ConfigInterface> = new BehaviorSubject<ConfigInterface>({} as ConfigInterface);

  loadProjectData(): Promise<{ error: boolean; msg?: string }> {
    return new Promise((resolve, reject) => {
      forkJoin([
        from(this.apiService.getRequest('/api/thematiques/instance/' + environment.instance_id)),
        from(this.apiService.getRequest('/api/groupecartes/instance/' + environment.instance_id)),
        from(this.apiService.getRequest('/api/instances/' + environment.instance_id)),
        from(this.apiService.getRequestFromOtherHost('/assets/limites/principal.geojson'))
      ]).subscribe(([thematiques, groupecartes, config, limites]) => {
        this.thematiques.next(thematiques);
        this.groupecartes.next(groupecartes);
        this.config.next({
          data: config['data'],
          success: config['success'],
          message: config['message'],
          roiGeojson: limites['features'][0]['geometry']
        });

        this.states.getValue().loadProjectData = true;
        this.states.next(this.states.getValue());
        resolve({
          msg: 'Success',
          error: false
        });
      });
    });
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

  getThematiques(): Thematique[] {
    return this.thematiques.getValue().data.thematiques;
  }

  getAllGroupesCarte(): GroupesCarte[] {
    return this.groupecartes.getValue().data.groupes_cartes;
  }

  getPrincipalCarte(): {
    groupecarte: GroupesCarte;
    carte: Carte;
  } | null {
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
