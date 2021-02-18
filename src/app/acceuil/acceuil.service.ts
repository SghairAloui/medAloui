import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AcceuilService {

  private displayForm: Subject<boolean>= new BehaviorSubject<any>("");
  displayForm$ = this.displayForm.asObservable();

  setFormVisible(data:any){
    this.displayForm.next(data);
  }
  constructor() { }
}