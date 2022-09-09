import { Injectable } from '@angular/core';
import { User } from '../../auth/interfaces/auth';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  /**
   * Store token
   * @param token string
   */
  storeToken(token: string) {
    localStorage.setItem('token', token);
  }

  storeUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string {
    return localStorage.getItem('token')!;
  }

  getUser(): User {
    return JSON.parse(localStorage.getItem('user')!);
  }

  clear(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
//localStorage.clear();
  }
}
