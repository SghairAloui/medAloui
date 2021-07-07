import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { dignoses } from 'src/model/dignoses';
import { FirstAndLastNameGet } from 'src/model/FirstAndLastNameGet';
import { HeightValues } from 'src/model/HeightValues';
import { medicalProfileDiseaseGet } from 'src/model/medicalProfileDiseaseGet';
import { medicalProfileGet } from 'src/model/medicalProfileGet';
import { MyUserWithPag } from 'src/model/MyUserWithPag';
import { PatientGet } from 'src/model/PatientGet';
import { PatientPostWithSecureLogin } from 'src/model/PatientPostWithSecureLogin';
import { UpdateMedicalProfilePost } from 'src/model/UpdateMedicalProfilePost';
import { WeightValues } from 'src/model/WeightValues';

const PATIENT_API = environment.apiUrl+'api/patient/';
const IMAGE_API = environment.apiUrl+'api/image/';
const MEDICALPROFILE_API = environment.apiUrl+'api/medicalProfile/';
const MEDICALPROFILEDISEASE_API = environment.apiUrl+'api/medicalProfileDisease/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient) { }

  public getPatientInfo(userId:number) {
    return this.http.post<PatientGet>(PATIENT_API + "getPatientInfoById", {userId}, httpOptions);
  }

  public getPatientMedicalProfileByMedicalProfileId(id: number) {
    return this.http.get<medicalProfileGet>(MEDICALPROFILE_API + "getPatientMedicalProfileByMedicalProfileId/" + id, httpOptions);
  }

  public getPatientMedicalProfileDeseasesByMedicalProfileId(id: number, page: number, size: number) {
    return this.http.post<medicalProfileDiseaseGet[]>(MEDICALPROFILEDISEASE_API + "getPateintMedicalProfileDiseasesByMedicalProfileId", { id, page, size }, httpOptions);
  }

  public getPatientMedicalProfileDeseasesNumberByMedicalProfileId(id: number) {
    return this.http.get<number>(MEDICALPROFILEDISEASE_API + "getPateintMedicalProfileDiseasesNumberByMedicalProfileId/" + id, httpOptions);
  }

  public updatePatientInfoById(patientPostWithSecureLogin: PatientPostWithSecureLogin) {
    return this.http.post<boolean>(PATIENT_API + "updatePatientInfoById", patientPostWithSecureLogin, httpOptions);
  }

  public updateMedicalProfileByMedicalProfileId(updateMedicalProfilePost: UpdateMedicalProfilePost) {
    return this.http.post<boolean>(PATIENT_API + "updateMedicalProfileByMedicalProfileId", updateMedicalProfilePost, { responseType: 'text' as 'json' })
  }
  public updatePatientProfilePhoto(uploadImageData: FormData) {
    return this.http.post<string>(IMAGE_API + 'upload', uploadImageData, { responseType: 'text' as 'json' });
  }

  public getPatientPofilePhoto(id:number) {
    return this.http.get<string>(IMAGE_API + 'get/' + id + "profilePic", httpOptions)
  }

  public getDoctorPofilePhoto(imageName: string) {
    return this.http.get<string>(IMAGE_API + 'get/' + imageName, httpOptions)
  }

  public addDiagnoseToMedicalProfileById(doctorId: number, medicalProfileId: number, medicalProfileDiseaseName: string, medicalProfileDiseaseDiagnose: string) {
    return this.http.post<boolean>(MEDICALPROFILEDISEASE_API + 'add', { doctorId, medicalProfileId, medicalProfileDiseaseName, medicalProfileDiseaseDiagnose }, httpOptions);
  }

  public getDiagnoseByMedicalProfileIdDoctorIdAndDate(medicalProfileId: number,doctorId:number, date: string) {
    return this.http.post<dignoses[]>(MEDICALPROFILEDISEASE_API + 'getDiagnoseByMedicalProfileIdDoctorIdAndDate', { medicalProfileId,doctorId, date }, httpOptions);
  }

  public deleteDiagnoseByMedicalProfileIdDoctorIdAndDate(medicalProfileId: number, doctorId: number, date: string) {
    return this.http.request('DELETE', MEDICALPROFILEDISEASE_API + 'deleteDiagnoseByMedicalProfileIdDoctorIdAndDate', {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: { medicalProfileId: medicalProfileId, doctorId: doctorId, date: date }
    });
  }

  public getUserFullNameById(patientId:number) {
    return this.http.get<FirstAndLastNameGet>(PATIENT_API + 'getUserFullNameById/'+patientId, httpOptions);
  }

  public getMyDoctors(userId: number, page: number,size:number) {
    return this.http.post<MyUserWithPag>(PATIENT_API + 'getMyDoctors', { userId,page, size }, httpOptions);
  } 

  public getMySecretaries(userId: number, page: number,size:number) {
    return this.http.post<MyUserWithPag>(PATIENT_API + 'getMySecretaries', { userId,page, size }, httpOptions);
  } 

  public getMyPharmacies(userId: number, page: number,size:number) {
    return this.http.post<MyUserWithPag>(PATIENT_API + 'getMyPharmacies', { userId,page, size }, httpOptions);
  } 

  public getHeightValues(userId: number) {
    return this.http.post<HeightValues []>(PATIENT_API + 'getHeightValues', { userId}, httpOptions);
  } 

  public getWeightValues(userId: number) {
    return this.http.post<WeightValues []>(PATIENT_API + 'getWeightValues', { userId}, httpOptions);
  } 

  private quesstionId: Subject<number>= new BehaviorSubject<any>("");
  quesstionId$ = this.quesstionId.asObservable();
  openQuestion(data:number){
    this.quesstionId.next(data);
  }
}
