import { register } from './../states/auth.actions';
import { Injectable } from '@angular/core';
import { catchError, from, map, Observable } from 'rxjs';
import { ApiService } from '../../services/api/api.service';
import { StorageService } from '../../../core/services/api/storage.service';
import { AuthInterface, User } from '../interfaces/auth';
import { ApiInterface } from '../../services/api/interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService, private storageService: StorageService) {}

  isAuthenticated(): boolean {
    return this.storageService.getToken() !== null;
  }
  /**
   * get user who is connect
   */
  getUserConnect(): Observable<AuthInterface> {
    return from(this.apiService.getRequest('/api/user/me')).pipe(
      map((user: AuthInterface) => {
        return user;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  /**
   * Login a user and store his tokens
   * @param identifiant
   * @param pwd
   * @returns boolean
   */

  login(identifiant: string, password: string): Observable<User> {
    if (identifiant.includes('@')) {
      var data = {
        email: identifiant,
        password: password
      };
    } else {
      data = {
        password: password,
        //@ts-ignore
        phone: identifiant
      };
    }
    return from(this.apiService.postRequest('/api/auth/login', data)).pipe(
      map((login: AuthInterface) => {
        this.storageService.storeToken(login.data.token);
        this.storageService.storeUser(login.data.user);
        return login.data.user;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  /**
   * Register a user and store his tokens
   * @param email
   * @param pwd
   * @param phone
   * @param file
   * @returns boolean
   */

  register(last_name: string,first_name:string, email: string, pwd: string, phone: number, file?: File,titre?:string): Observable<User> {
    return from(
      this.apiService.postRequest('/api/auth/register', {
        last_name: last_name,
        first_name:first_name,
        titre:titre,
        email: email,
        password: pwd,
        phone: phone,
        file: file
      })
    ).pipe(
      map((register: AuthInterface) => {
        this.storageService.storeToken(register.data.token);
        this.storageService.storeUser(register.data.user);
        return register.data.user;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  /**
   * Register a user and store his tokens
   * @param token
   * @returns boolean
   */

  registerFacebook(token: string): Observable<User> {
    return from(
      this.apiService.postRequest('/api/auth/register/facebook', {
        token: token
      })
    ).pipe(
      map((register: AuthInterface) => {
        this.storageService.storeToken(register.data.token);
        this.storageService.storeUser(register.data.user);
        return register.data.user;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  /**
   * Register a user and store his tokens
   * @param token
   * @returns boolean
   */

  registerGoogle(token: string): Observable<User> {
    return from(
      this.apiService.postRequest('/api/auth/login/google', {
        token: token
      })
    ).pipe(
      map((register: AuthInterface) => {
        this.storageService.storeToken(register.data.token);
        this.storageService.storeUser(register.data.user);
        return register.data.user;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  /**
   *
   *
   * @returns boolean
   * @memberof AuthService
   */

  logout(): Observable<ApiInterface> {
    return from(this.apiService.getRequest('/api/auth/logout')).pipe(
      map((response: ApiInterface) => {
        this.storageService.clear();
        return response;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  /**
   * Reset a user
   * @param email
   * @returns boolean
   */

  forgot(email: string): Observable<ApiInterface> {
    return from(
      this.apiService.postRequest('/api/auth/password/forgot', {
        email: email
      })
    ).pipe(
      map((response: ApiInterface) => {
        return response;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }

  /**
   * Reset a user
   * @param email
   * @param token
   * @param password
   * @returns boolean
   */

  reset(email: string, token: string, password: string): Observable<ApiInterface> {
    return from(
      this.apiService.postRequest('/api/auth/password/reset', {
        email: email,
        token: token,
        password: password,
        password_confirmation: password
      })
    ).pipe(
      map((response: ApiInterface) => {
        return response;
      }),
      catchError(err => {
        throw new Error(err);
      })
    );
  }
}
