import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DoctorPost } from 'src/model/DoctorPost';
import { PatientPost } from 'src/model/PatientPost';
import { PharmacyPost } from 'src/model/PharmacyPost';

@Injectable({
  providedIn: 'root'
})
export class SaveNewUserService {

  constructor(private http:HttpClient) { }

  public savePatient(patient:PatientPost){
    return this.http.post("http://localhost:8080/patient/add",patient,{responseType:'text' as 'json'});
  }
  public savePharmacy(pharmacy:PharmacyPost){
    return this.http.post("http://localhost:8080/pharmacy/add",pharmacy,{responseType:'text' as 'json'});
  }
  public saveDoctor(doctor:DoctorPost){
    return this.http.post("http://localhost:8080/doctor/add",doctor,{responseType:'text' as 'json'});
  }
}
