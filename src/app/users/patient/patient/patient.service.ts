import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { dignoses } from 'src/model/dignoses';
import { medicalProfileDiseaseGet } from 'src/model/medicalProfileDiseaseGet';
import { medicalProfileGet } from 'src/model/medicalProfileGet';
import { PatientGet } from 'src/model/PatientGet';
import { PatientPostWithSecureLogin } from 'src/model/PatientPostWithSecureLogin';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { UpdateMedicalProfilePost } from 'src/model/UpdateMedicalProfilePost';

const PATIENT_API = 'http://localhost:8080/api/patient/';
const IMAGE_API = 'http://localhost:8080/api/image/';
const MEDICALPROFILE_API = 'http://localhost:8080/api/medicalProfile/';
const MEDICALPROFILEDISEASE_API = 'http://localhost:8080/api/medicalProfileDisease/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient) { }

  public getPatientInfo(secureLogin: SecureLoginString) {
    return this.http.post<PatientGet>(PATIENT_API + "getPatientInfoFromSecureLogin", secureLogin, httpOptions);
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

  public updatePatientInfoBySecureLogin(patientPostWithSecureLogin: PatientPostWithSecureLogin) {
    return this.http.post<boolean>(PATIENT_API + "updatePatientInfoBySecureLogin", patientPostWithSecureLogin, httpOptions);
  }

  public updateMedicalProfileByMedicalProfileId(updateMedicalProfilePost: UpdateMedicalProfilePost) {
    return this.http.post<boolean>(PATIENT_API + "updateMedicalProfileByMedicalProfileId", updateMedicalProfilePost, { responseType: 'text' as 'json' })
  }
  public updatePatientProfilePhoto(uploadImageData: FormData) {
    return this.http.post<string>(IMAGE_API + 'upload', uploadImageData, { responseType: 'text' as 'json' });
  }

  public getPatientPofilePhoto() {
    return this.http.get<string>(IMAGE_API + 'get/' + localStorage.getItem('id') + "patientProfilePic", httpOptions)
  }

  public getDoctorPofilePhoto(imageName: string) {
    return this.http.get<string>(IMAGE_API + 'get/' + imageName, httpOptions)
  }

  public addDiagnoseToMedicalProfileById(doctorId: number, medicalProfileId: number, medicalProfileDiseaseName: string, medicalProfileDiseaseDiagnose: string) {
    return this.http.post<boolean>(MEDICALPROFILEDISEASE_API + 'add', { doctorId, medicalProfileId, medicalProfileDiseaseName, medicalProfileDiseaseDiagnose }, httpOptions);
  }

  public getDiagnoseByMedicalProfileIdAndDate(medicalProfileId: number, date: string) {
    return this.http.post<dignoses[]>(MEDICALPROFILEDISEASE_API + 'getDiagnoseByMedicalProfileIdAndDate', { medicalProfileId, date }, httpOptions);
  }

  public deleteDiagnoseByMedicalProfileIdDoctorIdAndDate(medicalProfileId: number, doctorId: number, date: string) {
    return this.http.request('DELETE', MEDICALPROFILEDISEASE_API + 'deleteDiagnoseByMedicalProfileIdDoctorIdAndDate', {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: { medicalProfileId: medicalProfileId, doctorId: doctorId, date: date }
    });
  }

}
