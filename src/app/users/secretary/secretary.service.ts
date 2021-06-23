import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { AppointmentForSec } from 'src/model/AppointmentForSec';
import { AppointmentForSecWithPag } from 'src/model/AppointmentForSecWithPag';
import { AppointmentInfoForSec } from 'src/model/AppointmentInfoForSec';
import { SecretaryInfo } from 'src/model/SecretaryInfo';
import { SecretaryWork } from 'src/model/SecretaryWork';

const SECRETARY_API = environment.apiUrl+'api/secretary/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SecretaryService {

  constructor(private http:HttpClient) { }

  public getSecretaryInfoBySecureLogin(secureLogin: string) {
    return this.http.post<SecretaryInfo>(SECRETARY_API + "getSecretaryInfoBySecureLogin", {secureLogin}, httpOptions);
  }
  
  public updateSecretaryInfoBySecureLogin(firstName: string,lastName: string,birthday: string,city: string,gender: string,secureLogin: string) {
    return this.http.post<boolean>(SECRETARY_API + "updateSecretaryInfoBySecureLogin", {firstName,lastName,birthday,city,gender,secureLogin}, httpOptions);
  }

  public updatePasswordBySecureLogin(password:string,secureLogin: string) {
    return this.http.post<boolean>(SECRETARY_API + "updatePasswordBySecureLogin", {password,secureLogin}, httpOptions);
  }

  public getSecretaryWorkById(id:number) {
    return this.http.get<SecretaryWork []>(SECRETARY_API + "getSecretaryWorkById/"+id, httpOptions);
  }

  public acceptDoctorAddRequest(doctorId:number,notificationId:number,secretaryId:number,secureLogin:string) {
    return this.http.post<boolean>(SECRETARY_API + "acceptDoctorAddRequest",{doctorId,notificationId,secretaryId,secureLogin}, httpOptions);
  }

  public refuseDoctorAddRequest(notificationId:number,secureLogin:string,doctorId:number,secretaryId:number) {
    return this.http.post<boolean>(SECRETARY_API + "refuseDoctorAddRequest",{notificationId,secureLogin,doctorId,secretaryId}, httpOptions);
  }

  public getUncofirmedApp(secretaryId:number,secureLogin:string,page:number,size:number) {
    return this.http.post<AppointmentForSecWithPag>(SECRETARY_API + "getUncofirmedApp",{secretaryId,secureLogin,page,size}, httpOptions);
  }

  public getAppointmentInfoById(secretaryId:number,secureLogin:string,appointmentId:number) {
    return this.http.post<AppointmentForSec>(SECRETARY_API + "getAppointmentInfoById",{secretaryId,secureLogin,appointmentId}, httpOptions);
  }

  public confirmAppointmentById(secretaryId:number,secureLogin:string,appointmentId:number,patientId:number,doctorId:number,appointmentStatus:string) {
    return this.http.post<boolean>(SECRETARY_API + "confirmAppointmentById",{secretaryId,secureLogin,appointmentId,patientId,doctorId,appointmentStatus}, httpOptions);
  }
  
  public refuseAppointmentById(secretaryId:number,secureLogin:string,appointmentId:number,patientId:number,doctorId:number,appointmentStatus:string) {
    return this.http.post<boolean>(SECRETARY_API + "refuseAppointmentById",{secretaryId,secureLogin,appointmentId,patientId,doctorId,appointmentStatus}, httpOptions);
  }

  public getNextRequestByAppId(secretaryId:number,secureLogin:string,appointmentId:number) {
    return this.http.post<AppointmentForSec>(SECRETARY_API + "getNextRequestByAppId",{secretaryId,secureLogin,appointmentId}, httpOptions);
  }

  public getDoctorCurrentPatient(doctorId:number,date:string) {
    return this.http.post<AppointmentInfoForSec>(SECRETARY_API + "getDoctorCurrentPatient",{doctorId,date}, httpOptions);
  }
}
