import { Injectable } from '@angular/core';
import { catchError, from, map, Observable } from 'rxjs';
import { PradecInterface } from 'src/app/core/interfaces/pradec';
import { ApiService } from '../../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class PradecService {
  constructor(public apiService: ApiService) {}

  searchOuvrages(nomsyndicat?: string,nomcommune?:string,typeeau?:string,question?:number): Observable<PradecInterface> {
    return from(this.apiService.postRequest('/api/ouvragesglobalsearch', {"nomsyndicat":nomsyndicat,"nomcommune":nomcommune,"typeeau":typeeau,"question":question})).pipe(
      map((pradec: PradecInterface) => {
        return pradec;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }
}
