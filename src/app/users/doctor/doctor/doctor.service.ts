import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DoctorGet } from 'src/model/Doctorget';
import { DoctorPostWithSecureLogin } from 'src/model/DoctorPostWithSecureLogin';
import { OneStringPost } from 'src/model/OneStringPost';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { TwoStringsPost } from 'src/model/TwoStringsPost';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(private http:HttpClient) { }

  public getDoctorInfo(secureLogin:SecureLoginString){
    return this.http.post<DoctorGet>("http://localhost:8080/doctor/getDoctorInfoFromSecureLogin",secureLogin);
  }

  public updateDoctorInfoBySecureLogin(doctorPostWithSecureLogin:DoctorPostWithSecureLogin){
    return this.http.post<string>("http://localhost:8080/doctor/updateDoctorInfoBySecureLogin",doctorPostWithSecureLogin,{responseType:'text' as 'json'});
  }

  public updateDoctorProfilePhoto(uploadImageData:FormData){
    return this.http.post<string>('http://localhost:8080/image/upload', uploadImageData, {responseType: 'text' as 'json'});
  }
  public getDoctorPofilePhoto(imageName:string){
    return this.http.get<string>('http://localhost:8080/image/get/' + imageName)
  }

  public changeDoctorStatusBySecureId(twoStringsPost:TwoStringsPost){
    return this.http.post<string>('http://localhost:8080/doctor/changeDoctorStatusBySecureId', twoStringsPost, {responseType: 'text' as 'json'})
  }

  public checkIfDocumentExist(oneStringPost:OneStringPost){
    return this.http.post<boolean>('http://localhost:8080/image/checkIfDocumentExist', oneStringPost)
  }
}
