import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  headers: HttpHeaders = new HttpHeaders({});
  url_prefix = environment.url_services;

  constructor(private http: HttpClient) {
    this.headers.append('Content-Type', 'application/x-www-form-urlencoded');
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Access-Control-Allow-Origin', '*');
    this.headers.append('X-Authorization', environment.apiKey);
  }

  /**
   * Get header
   */
  get_header() {
    this.headers = this.headers.set('Authorization', 'Bearer  ' + localStorage.getItem('token')).set('X-Authorization', environment.apiKey);
    return this.headers;
  }

  getRequestFromOtherHostObserver(path: string): Observable<any> {
    return this.http.get(path, { headers: this.headers });
  }

  getRequestFromOtherHost(path: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(path)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => {
            // Error
            reject(msg);
          }
        );
    });

    return promise;
  }

  getRequest(path: string): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.http
        .get(this.url_prefix + path, { headers: this.get_header() })
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => {
            // Error
            reject(msg);
          }
        );
    });

    return promise;
  }

  postRequest(url: string, data: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.url_prefix + url, data, { headers: this.get_header() })
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => {
            // Error

            reject(msg.error);
          }
        );
    });
  }

  postRequestFromOtherHost(url: string, data: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(url, data)
        .toPromise()
        .then(
          res => {
            resolve(res);
          },
          msg => {
            // Error
            reject(msg.error);
          }
        )
        .catch(err => {
          reject(err);
        });
    });
  }
}
