import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidationPost } from 'src/model/ValidationPost';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(private http:HttpClient) { }

  public addValidation(validationPost:ValidationPost){
    return this.http.post<string>('http://localhost:8080/validation/add', validationPost, {responseType: 'text' as 'json'});
  }
}
