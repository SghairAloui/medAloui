import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdminGet } from 'src/model/adminGet';
import { SecureLoginString } from 'src/model/SecureLoginString';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http:HttpClient) { }

  public getAdminInfoFromSecureLogin(secureLogin:SecureLoginString){
    return this.http.post<AdminGet>("http://localhost:8080/admin/getAdminInfoFromSecureLogin",secureLogin);
  }
}
