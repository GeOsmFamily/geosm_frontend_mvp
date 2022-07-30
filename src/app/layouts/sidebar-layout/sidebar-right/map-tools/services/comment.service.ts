import { Injectable } from '@angular/core';
import { catchError, from, map, Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api/api.service';
import { CommentInterface } from '../interfaces/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(private apiService: ApiService) {}

  getAllComments(): Observable<CommentInterface> {
    return from(this.apiService.getRequest('/api/commentaires')).pipe(
      map((response: CommentInterface) => {
        return response;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }
}
