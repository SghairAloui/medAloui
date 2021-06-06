import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { prescriptionGet } from 'src/model/prescriptionGet';
import { PrescriptionMedicament } from 'src/model/PrescriptionMedicament';

const PRES_API = environment.apiUrl+'api/prescription/';
const PRESMED_API = environment.apiUrl+'api/prescriptionMedicament/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  constructor(private http:HttpClient) { }

  public addPres (patientId:number,doctorId:number){
    return this.http.post<number>(PRES_API + 'add',{patientId,doctorId},httpOptions);
  }

  public addMedicamentToPresById(medicamentName:string,treatmentPeriode:string,prescriptionId:number){
    return this.http.post<boolean>(PRESMED_API+'add',{medicamentName,prescriptionId,treatmentPeriode},httpOptions);
  }

  public deleteById(id:number,patientId:number,doctorId:number){
    return this.http.post<boolean>(PRES_API+'deleteById',{id,patientId,doctorId},httpOptions);
  }

  public getPrescriptionByDoctorIdPatientIdAndDate(doctorId:number,patientId:number,prescriptionDate:string){
    return this.http.post<prescriptionGet>(PRES_API+'getPrescriptionByDoctorIdPatientIdAndDate',{doctorId,patientId,prescriptionDate},httpOptions);
  }

  public getPrescriptionsByPatientIdAndPrescriptionStatus(patientId:number,prescriptionStatus:string,page:number,size:number){
    return this.http.post<prescriptionGet []>(PRES_API+'getPrescriptionsByPatientIdAndPrescriptionStatus',{patientId,prescriptionStatus,page,size},httpOptions)
  }

  public getMedicamentsByPrescriptionId(presId:number){
    return this.http.get<PrescriptionMedicament []>(PRESMED_API + 'getMedicamentsByPrescriptionId/'+presId,httpOptions);
  }

  confirmPrescriptionById(id:number,code:number){
    return this.http.post<boolean>(PRES_API + 'confirmPrescriptionById',{id,code},httpOptions);
  }
}
