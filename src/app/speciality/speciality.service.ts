import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { SpecialityGet } from 'src/model/SpecialityGet';
import { SpecialityPost } from 'src/model/SpecialityPost';

const SPECIALITY_API = environment.apiUrl+'api/speciality/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SpecialityService {

  constructor(private http:HttpClient) { }

  public addSpeciality(specialityPost:SpecialityPost){
    return this.http.post<string>("http://localhost:8080/speciality/add",specialityPost,{responseType:'text' as 'json'});
  }

  public getSpecialities(){
    return this.http.get<SpecialityGet []>(SPECIALITY_API+"all",httpOptions);
  }

  public deleteByDoctorId(docId:number){
    return this.http.delete<boolean>(SPECIALITY_API + "deleteByDoctorId/"+docId,httpOptions);
  }
}
