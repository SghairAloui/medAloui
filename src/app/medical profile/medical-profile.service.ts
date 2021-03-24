import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { medicalProfileGet } from 'src/model/medicalProfileGet';

@Injectable({
  providedIn: 'root'
})
export class MedicalProfileService {

  constructor(private http:HttpClient) { }

  public getMedicalProfileByPatientId(id:number){
    return this.http.get<medicalProfileGet>("http://localhost:8080/MedicalProfile/getMedicalProfileByPatientId/"+id)
  }
}
