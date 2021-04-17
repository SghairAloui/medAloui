import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private header: Subject<string>= new BehaviorSubject<any>("");
  header$ = this.header.asObservable();

  setHeader(data:any){
    this.header.next(data);
  }
  
  constructor() { }
}
