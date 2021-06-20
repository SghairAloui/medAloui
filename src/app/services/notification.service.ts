import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { NotificationGet } from 'src/model/NotificationGet';

const NOTIFICATION_API = environment.apiUrl+'api/notification/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http:HttpClient) { }

  public getAllNotificationByUserId(id:number,page:number,size:number){
    return this.http.post<NotificationGet []>(NOTIFICATION_API+'getAll',{id,page,size},httpOptions);
  }

  public changeUnreadNotification(id:number,unread:boolean){
    return this.http.post<boolean>(NOTIFICATION_API+'changeUnreadNotification',{id,unread},httpOptions);
  }

  public deleteNotificationById(id:number,secureLogin:string){
    return this.http.post<boolean>(NOTIFICATION_API+'deleteNotificationById',{id,secureLogin},httpOptions);
  }

  public sendNotificationWithSocket(senderId:number,recipientId:number,notificationParameter:string,notificationType:string,force:boolean){
    return this.http.post<number>(NOTIFICATION_API+'sendNotificationWithSocket',{senderId,recipientId,notificationParameter,notificationType,force},httpOptions);
  }
}
