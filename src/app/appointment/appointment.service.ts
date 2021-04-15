import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppointmentGet } from 'src/model/AppointmentGet';
import { AppointmentPost } from 'src/model/AppointmentPost';
import { IntegerAndStringPost } from 'src/model/IntegerAndStringPost';

const APPOINTMENT_API = 'http://localhost:8080/api/appointment/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http:HttpClient) { }

  public add(appointmentPost:AppointmentPost){
    return this.http.post<boolean>(APPOINTMENT_API + "add",appointmentPost,httpOptions);
  }

  public appointmentsCountByDoctorIdAndDate(integerAndStringPost:IntegerAndStringPost){
    return this.http.post<number>(APPOINTMENT_API + "appointmentsCountByDoctorIdAndDate",integerAndStringPost,httpOptions);
  }

  public getPatientAppointmentByPatientId(id:number,page:number,size:number){
    return this.http.post<AppointmentGet []>(APPOINTMENT_API + 'getPatientAppointmentByPatientId',{id,page,size},httpOptions)
  }

  public getAppointmentByDoctorIdAndDate(id:number,page:number,size:number,date:string){
    return this.http.post<AppointmentGet []>(APPOINTMENT_API + 'getAppointmentByDoctorIdAndDate',{id,page,date,size},httpOptions)
  }

  public getAppointmentNumberByDoctorIdAndDate(id:number,date:string){
    return this.http.post<number>(APPOINTMENT_API + 'getAppointmentNumberByDoctorIdAndDate',{id,date},httpOptions);
  }

  public deleteAppointmentById(id:number){
    return this.http.delete<boolean>(APPOINTMENT_API + "deleteAppointmentById/"+id,httpOptions)
  }

  public updateAppointmentDateById(integerAndStringPost:IntegerAndStringPost){
    return this.http.post<boolean>(APPOINTMENT_API + "updateAppointmentDateById",integerAndStringPost,httpOptions);
  }

  public changeAppointmentStatusById(integer:number,string:string){
    return this.http.post<boolean>(APPOINTMENT_API + "changeAppointmentStatusById",{integer,string},httpOptions);
  }
}
