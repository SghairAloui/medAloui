import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

const RATE_API = environment.apiUrl+'api/rate/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class RateService {

  constructor(private http:HttpClient) { }

  public addRate(ratedBy:number,rateTo:number,rate:number){
    return this.http.post<number>(RATE_API + 'add',{ratedBy,rateTo,rate},httpOptions);
  }
}
