import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PatientGet } from 'src/model/PatientGet';
import { PatientPostWithSecureLogin } from 'src/model/PatientPostWithSecureLogin';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { StringAndTwoDoublePost } from 'src/model/stringAndTwoDoublePost';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http:HttpClient) { }

  public getPatientInfo(secureLogin:SecureLoginString){
    return this.http.post<PatientGet>("http://localhost:8080/patient/getPatientInfoFromSecureLogin",secureLogin);
  }
  public updatePatientInfoBySecureLogin(patientPostWithSecureLogin:PatientPostWithSecureLogin){
    return this.http.post<string>("http://localhost:8080/patient/updatePatientInfoBySecureLogin",patientPostWithSecureLogin,{responseType:'text' as 'json'});
  }
  public updateMedicalProfileBySecureLogin(stringAndTwoDoublePost:StringAndTwoDoublePost){
    return this.http.post<string>("http://localhost:8080/patient/updateMedicalProfileBySecureLogin",stringAndTwoDoublePost,{responseType:'text' as 'json'})
  }
}
