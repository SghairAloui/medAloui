import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { ValidationPost } from 'src/model/ValidationPost';

const VALIDATION_API = environment.apiUrl+'api/validation/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(private http:HttpClient) { }

  public addValidation(validationPost:ValidationPost){
    return this.http.post<boolean>(VALIDATION_API + 'add', validationPost,httpOptions);
  }

  public checkIfUserValidated(email:string){
    return this.http.get<boolean>(VALIDATION_API + 'checkIfUserValidated/'+email,httpOptions);
  }
}
