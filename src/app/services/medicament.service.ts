import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

const MED_API = 'http://localhost:8080/api/medicament/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MedicamentService {

  constructor( private http:HttpClient) { }

  public getMedicamentsByFirstLetters (letters:string){
    return this.http.get<string []>(MED_API + 'getMedicamentsByFirstLetters/'+letters,httpOptions);
  }
}
