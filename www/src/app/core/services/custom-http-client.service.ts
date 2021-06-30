import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";

export class CustomHttpClient {

  constructor(
      private http: HttpClient,
      private baseUrl: string
  ) {
  }

  /**
   * POST request
   * @param {string} url end point of the api
   * @param {any | null} body body of the request.
   * @param {Object} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  post<T>(url: string, body: any | null, options?: {
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
      [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.post<T>(this.baseUrl + url, body, options);
  }

  /**
   * GET request
   * @param {string} url end point of the api
   * @param {Object} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  get<T>(url: string, options?: {
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
      [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.get<T>(this.baseUrl + url, options);
  }

  /**
   * PUT request
   * @param {string} url end point of the api
   * @param {any | null} body body of the request.
   * @param {Object} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  put<T>(url: string, body: any | null, options?: {
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
      [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.put<T>(this.baseUrl + url, body, options);
  }

  /**
   * DELETE request
   * @param {string} url end point of the api
   * @param {Object} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  delete<T>(url: string, options?: {
    headers?: HttpHeaders | {
      [header: string]: string | string[];
    };
    observe?: 'body';
    params?: HttpParams | {
      [param: string]: string | string[];
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.delete<T>(this.baseUrl + url, options);
  }

}
