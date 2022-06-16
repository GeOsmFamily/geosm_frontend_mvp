import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CarteInterface } from '../../interfaces/carte-interface';
import { ThematiqueInterface } from '../../interfaces/thematique-interface';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(public apiService: ApiService) {}

  states: BehaviorSubject<{ loadProjectData: boolean }> = new BehaviorSubject<{
    loadProjectData: boolean;
  }>({ loadProjectData: false });

  public thematiques: BehaviorSubject<ThematiqueInterface> = new BehaviorSubject<ThematiqueInterface>({} as ThematiqueInterface);

  public cartes: BehaviorSubject<CarteInterface> = new BehaviorSubject<CarteInterface>({} as CarteInterface);

}
