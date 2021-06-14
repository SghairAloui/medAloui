import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { SecretaryInfo } from 'src/model/SecretaryInfo';
import { SecretaryWork } from 'src/model/SecretaryWork';

const SECRETARY_API = environment.apiUrl+'api/secretary/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SecretaryService {

  constructor(private http:HttpClient) { }

  public getSecretaryInfoBySecureLogin(secureLogin: string) {
    return this.http.post<SecretaryInfo>(SECRETARY_API + "getSecretaryInfoBySecureLogin", {secureLogin}, httpOptions);
  }
  
  public updateSecretaryInfoBySecureLogin(firstName: string,lastName: string,birthday: string,city: string,gender: string,secureLogin: string) {
    return this.http.post<boolean>(SECRETARY_API + "updateSecretaryInfoBySecureLogin", {firstName,lastName,birthday,city,gender,secureLogin}, httpOptions);
  }

  public updatePasswordBySecureLogin(password:string,secureLogin: string) {
    return this.http.post<boolean>(SECRETARY_API + "updatePasswordBySecureLogin", {password,secureLogin}, httpOptions);
  }

  public getSecretaryWorkById(id:number) {
    return this.http.get<SecretaryWork []>(SECRETARY_API + "getSecretaryWorkById/"+id, httpOptions);
  }
}
