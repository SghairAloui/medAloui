import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

const MED_API = environment.apiUrl+'api/medicament/';

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
