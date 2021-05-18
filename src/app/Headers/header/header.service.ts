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

  private parentHeader: Subject<string>= new BehaviorSubject<any>("");
  parentHeader$ = this.parentHeader.asObservable();
  setParentHeader(data:any){
    this.parentHeader.next(data);
  }

  private notification = new BehaviorSubject<any>({});
  notification$ = this.notification.asObservable();
  addNotification(data:{}){
    this.notification.next(data);
  }

  private conversation = new BehaviorSubject<any>({});
  conversation$ = this.conversation.asObservable();
  addConversation(data:{}){
    this.conversation.next(data);
  }

  private loadMoreConversation: Subject<boolean>= new BehaviorSubject<any>("");
  loadMoreConversation$ = this.loadMoreConversation.asObservable();
  setLoadMoreConversation(data:any){
    this.loadMoreConversation.next(data);
  }

  private message = new BehaviorSubject<any>({});
  message$ = this.message.asObservable();
  newMessage(data:{}){
    this.message.next(data);
  }

  private firstConversation: Subject<number>= new BehaviorSubject<any>("");
  firstConversation$ = this.firstConversation.asObservable();
  setFirstConversation(data:any){
    this.firstConversation.next(data);
  }
}
