import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdminGet } from 'src/model/adminGet';
import { DoctorPendingGet } from 'src/model/DoctorPendingGet';
import { SecureLoginString } from 'src/model/SecureLoginString';

const ADMIN_API = 'http://localhost:8080/api/admin/';
const DOCTOR_API = 'http://localhost:8080/api/doctor/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  public getAdminInfoFromSecureLogin(secureLogin: SecureLoginString) {
    return this.http.post<AdminGet>(ADMIN_API + "getAdminInfoFromSecureLogin", secureLogin, httpOptions);
  }
  public getPendingDoctors(page: number, size: number) {
    return this.http.get<DoctorPendingGet[]>(DOCTOR_API + "getPendingDoctors/" + page + "/" + size, httpOptions);
  }
}
