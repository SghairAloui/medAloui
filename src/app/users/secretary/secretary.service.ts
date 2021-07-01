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

  public getSecretaryInfoById(userId:number) {
    return this.http.post<SecretaryInfo>(SECRETARY_API + "getSecretaryInfoById", {userId}, httpOptions);
  }
  
  public updateSecretaryInfoById(firstName: string,lastName: string,birthday: string,city: string,gender: string,userId: number) {
    return this.http.post<boolean>(SECRETARY_API + "updateSecretaryInfoById", {firstName,lastName,birthday,city,gender,userId}, httpOptions);
  }

  public updatePasswordById(password:string,userId:number) {
    return this.http.post<boolean>(SECRETARY_API + "updatePasswordById", {password,userId}, httpOptions);
  }

  public getSecretaryWorkById(id:number) {
    return this.http.get<SecretaryWork []>(SECRETARY_API + "getSecretaryWorkById/"+id, httpOptions);
  }

  public acceptDoctorAddRequest(doctorId:number,notificationId:number,secretaryId:number) {
    return this.http.post<boolean>(SECRETARY_API + "acceptDoctorAddRequest",{doctorId,notificationId,secretaryId}, httpOptions);
  }

  public refuseDoctorAddRequest(notificationId:number,doctorId:number,secretaryId:number) {
    return this.http.post<boolean>(SECRETARY_API + "refuseDoctorAddRequest",{notificationId,doctorId,secretaryId}, httpOptions);
  }

  public getUncofirmedApp(secretaryId:number,page:number,size:number) {
    return this.http.post<AppointmentForSecWithPag>(SECRETARY_API + "getUncofirmedApp",{secretaryId,page,size}, httpOptions);
  }

  public getAppointmentInfoById(secretaryId:number,appointmentId:number) {
    return this.http.post<AppointmentForSec>(SECRETARY_API + "getAppointmentInfoById",{secretaryId,appointmentId}, httpOptions);
  }

  public confirmAppointmentById(secretaryId:number,appointmentId:number,patientId:number,doctorId:number,appointmentStatus:string) {
    return this.http.post<boolean>(SECRETARY_API + "confirmAppointmentById",{secretaryId,appointmentId,patientId,doctorId,appointmentStatus}, httpOptions);
  }
  
  public refuseAppointmentById(secretaryId:number,appointmentId:number,patientId:number,doctorId:number,appointmentStatus:string) {
    return this.http.post<boolean>(SECRETARY_API + "refuseAppointmentById",{secretaryId,appointmentId,patientId,doctorId,appointmentStatus}, httpOptions);
  }

  public getNextRequestByAppId(secretaryId:number,appointmentId:number) {
    return this.http.post<AppointmentForSec>(SECRETARY_API + "getNextRequestByAppId",{secretaryId,appointmentId}, httpOptions);
  }

  public getDoctorCurrentPatient(doctorId:number,date:string) {
    return this.http.post<AppointmentInfoForSec>(SECRETARY_API + "getDoctorCurrentPatient",{doctorId,date}, httpOptions);
  }
}
