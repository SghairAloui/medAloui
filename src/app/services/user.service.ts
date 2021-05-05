import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirstAndLastNameGet } from 'src/model/FirstAndLastNameGet';
import { TwoStringsPost } from 'src/model/TwoStringsPost';
import { UpdatePasswordPost } from 'src/model/UpdatePasswordPost';

const USER_API = 'http://localhost:8080/api/user/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(private http: HttpClient) { }

  checkIfUsernameExists(username:string):Observable<any>{
    return this.http.get<boolean>(USER_API+'existsByUsername/'+username,httpOptions);
  }

  updateUserPasswordBySecurelogin(updatePasswordPost:UpdatePasswordPost){
    return this.http.post<boolean>(USER_API+'updateUserPasswordBySecurelogin',updatePasswordPost,httpOptions);
  }

  updateUsernameBySecureLogin(twoStringsPost:TwoStringsPost){
    return this.http.post<boolean>(USER_API + 'updateUsernameBySecureLogin',twoStringsPost,httpOptions);
  }

  public getUserFullNameById(docId:number) {
    return this.http.get<FirstAndLastNameGet>(USER_API + 'getUserFullNameById/'+docId, httpOptions);
  }

  checkVerifacationCode(userEmail:string,verificationCode:number){
    return this.http.post<boolean>(USER_API + 'checkVerifacationCode',{userEmail,verificationCode},httpOptions);
  }

  updateUserStatusByEmail(email:string,status:string){
    return this.http.post<boolean>(USER_API + 'updateUserStatusByEmail',{email,status},httpOptions);
  }
}
