import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

const MAIL_API = environment.apiUrl+'api/mail/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private http:HttpClient) { }

  public sendMail (subject:string,body:string,to:string){
    return this.http.post<boolean>(MAIL_API + 'send',{subject,body,to},httpOptions);
  }
}
