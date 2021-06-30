import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { AdminGet } from 'src/model/adminGet';
import { DoctorPendingGet } from 'src/model/DoctorPendingGet';
import { SecureLoginString } from 'src/model/SecureLoginString';

const ADMIN_API = environment.apiUrl+'api/admin/';
const DOCTOR_API = environment.apiUrl+'api/doctor/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  public getAdminInfoById(userId:number) {
    return this.http.post<AdminGet>(ADMIN_API + "getAdminInfoById",{userId}, httpOptions);
  }
  public getPendingDoctors(page: number, size: number) {
    return this.http.get<DoctorPendingGet[]>(DOCTOR_API + "getPendingDoctors/" + page + "/" + size, httpOptions);
  }
}
