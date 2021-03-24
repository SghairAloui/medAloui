import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { UsernameAndPassPost } from 'src/model/UsernameAndPassPost';

@Injectable({
  providedIn: 'root'
})
export class SignInService {
  private displaySignInfo: Subject<boolean>= new BehaviorSubject<any>("");
  displaySignInfo$ = this.displaySignInfo.asObservable();

  setDisplaySignInfo(data:any){
    this.displaySignInfo.next(data);
  }
  constructor(private http:HttpClient) { }

  public openDoctorAccount(usernameAndPassPost:UsernameAndPassPost){
    return this.http.post<string>("http://localhost:8080/doctor/getDoctorSecureLoginFromUsernameAndPass",usernameAndPassPost,{responseType:'text' as 'json'});
  }
  public openPatientAccount(usernameAndPassPost:UsernameAndPassPost){
    return this.http.post<string>("http://localhost:8080/patient/getPatientSecureLoginFromUsernameAndPass",usernameAndPassPost,{responseType:'text' as 'json'});
  }
  public openPharmacyAccount(usernameAndPassPost:UsernameAndPassPost){
    return this.http.post<string>("http://localhost:8080/pharmacy/getPharmacySecureLoginFromUsernameAndPass",usernameAndPassPost,{responseType:'text' as 'json'});
  }
  public openAdminAccount(usernameAndPassPost:UsernameAndPassPost){
    return this.http.post<string>("http://localhost:8080/admin/getAdminSecureLoginFromUsernameAndPass",usernameAndPassPost,{responseType:'text' as 'json'});
  }
}
