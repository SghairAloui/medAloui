import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SpecialityGet } from 'src/model/SpecialityGet';
import { SpecialityPost } from 'src/model/SpecialityPost';

@Injectable({
  providedIn: 'root'
})
export class SpecialityService {

  constructor(private http:HttpClient) { }

  public addSpeciality(specialityPost:SpecialityPost){
    return this.http.post<string>("http://localhost:8080/speciality/add",specialityPost,{responseType:'text' as 'json'});
  }

  public getSpecialities(){
    return this.http.get<SpecialityGet []>("http://localhost:8080/speciality/all");
  }

  public deleteByDoctorId(docId:number){
    return this.http.delete<string>("http://localhost:8080/speciality/deleteByDoctorId/"+docId,{responseType:'text' as 'json'});
  }
}
