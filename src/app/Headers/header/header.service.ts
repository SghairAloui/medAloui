import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  
  constructor() { }

  private header: Subject<string>= new BehaviorSubject<any>("");
  header$ = this.header.asObservable();
  setHeader(data:any){
    this.header.next(data);
  }

  private notification = new BehaviorSubject<any>({});
  notification$ = this.notification.asObservable();
  addNotification(data:{}){
    this.notification.next(data);
  }
}
