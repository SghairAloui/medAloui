import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  login(username: string, userPassword: string): Observable<any> {
    return this.http.post(AUTH_API + 'signin', {
      username,
      userPassword
    }, httpOptions);
  }

  register(username: string, userPassword: string,userRole: string,userFirstName: string,userLastName: string,userFullName: string,userCity: string, userGender: string, userBirthday:string): Observable<any> {
    return this.http.post(AUTH_API + 'signup', {
      username,
      userPassword,
      userRole,
      userFirstName,
      userLastName,
      userFullName,
      userCity,
      userGender,
      userBirthday
    }, httpOptions);
  }
}
