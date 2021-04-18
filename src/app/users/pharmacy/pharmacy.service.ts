import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PharmacyGet } from 'src/model/PharmacyGet';
import { PharmacyPostWithSecureLogin } from 'src/model/PharmacyPostWithSecureLogin';
import { SecureLoginString } from 'src/model/SecureLoginString';

const PHARMACY_API = 'http://localhost:8080/api/pharmacy/';
const IMAGE_API = 'http://localhost:8080/api/image/';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class PharmacyService {

  constructor(private http: HttpClient) { }

  public getPharmacyInfo(secureLogin: SecureLoginString) {
    return this.http.post<PharmacyGet>(PHARMACY_API + "getPharmacyInfoFromSecureLogin", secureLogin, httpOptions);
  }

  public updatePharmacyInfoBySecureLogin(pharmacyPostWithSecureLogin: PharmacyPostWithSecureLogin) {
    return this.http.post<boolean>(PHARMACY_API + "updatePharmacyInfoBySecureLogin", pharmacyPostWithSecureLogin, httpOptions);
  }

  public updatePharmacyProfilePhoto(uploadImageData: FormData) {
    return this.http.post<string>(IMAGE_API + 'upload', uploadImageData, { responseType: 'text' as 'json' });
  }

  public getPharmacyPofilePhoto(name:string) {
    return this.http.get<string>(IMAGE_API + 'get/' + name, httpOptions)
  }

}
