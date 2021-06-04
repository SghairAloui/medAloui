import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
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
    return this.http.post<string>(environment.apiUrl+"doctor/getDoctorSecureLoginFromUsernameAndPass",usernameAndPassPost,{responseType:'text' as 'json'});
  }
  public openPatientAccount(usernameAndPassPost:UsernameAndPassPost){
    return this.http.post<string>(environment.apiUrl+"patient/getPatientSecureLoginFromUsernameAndPass",usernameAndPassPost,{responseType:'text' as 'json'});
  }
  public openPharmacyAccount(usernameAndPassPost:UsernameAndPassPost){
    return this.http.post<string>(environment.apiUrl+"pharmacy/getPharmacySecureLoginFromUsernameAndPass",usernameAndPassPost,{responseType:'text' as 'json'});
  }
  public openAdminAccount(usernameAndPassPost:UsernameAndPassPost){
    return this.http.post<string>(environment.apiUrl+"admin/getAdminSecureLoginFromUsernameAndPass",usernameAndPassPost,{responseType:'text' as 'json'});
  }
}
