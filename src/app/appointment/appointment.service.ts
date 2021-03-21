import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppointmentPost } from 'src/model/AppointmentPost';
import { IntegerAndStringPost } from 'src/model/IntegerAndStringPost';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http:HttpClient) { }

  public add(appointmentPost:AppointmentPost){
    return this.http.post<string>("http://localhost:8080/appointment/add",appointmentPost,{responseType: 'text' as 'json'});
  }

  public appointmentsCountByDoctorIdAndDate(integerAndStringPost:IntegerAndStringPost){
    return this.http.post<number>("http://localhost:8080/appointment/appointmentsCountByDoctorIdAndDate",integerAndStringPost);
  }

  public deleteAppointmentById(id:number){
    return this.http.delete<string>("http://localhost:8080/appointment/deleteAppointmentById/"+id,{responseType:'text' as 'json'})
  }

  public updateAppointmentDateById(integerAndStringPost:IntegerAndStringPost){
    return this.http.post<string>("http://localhost:8080/appointment/updateAppointmentDateById",integerAndStringPost,{responseType: 'text' as 'json'});
  }
}
