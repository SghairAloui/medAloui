import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetPendingPharmacy } from 'src/model/GetPendingPharmacy';
import { MedicamentStockGet } from 'src/model/MedicamentStockGet';
import { PharmacyGet } from 'src/model/PharmacyGet';
import { PharmacyPostWithSecureLogin } from 'src/model/PharmacyPostWithSecureLogin';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { TwoStringsPost } from 'src/model/TwoStringsPost';

const PHARMACY_API = 'http://localhost:8080/api/pharmacy/';
const IMAGE_API = 'http://localhost:8080/api/image/';
const UPLOADEXCELFILE_API = 'http://localhost:8080/api/uploadExcelFile/';
const MEDSTOCK_API = 'http://localhost:8080/api/medicamentstock/';


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

  public getPharmacyPofilePhoto(name: string) {
    return this.http.get<string>(IMAGE_API + 'get/' + name, httpOptions)
  }

  public changePharamcyStatusAndSettingsBySecureLogin(secureLogin: string, status: string, exactAddress: string, accountType: string) {
    return this.http.post<boolean>(PHARMACY_API + 'changePharamcyStatusAndSettingsBySecureLogin', { secureLogin, status, exactAddress, accountType }, httpOptions);
  }

  public getPendingPharmacies(page: number, size: number) {
    return this.http.post<GetPendingPharmacy[]>(PHARMACY_API + 'getPendingPharmacies', { page, size }, httpOptions);
  }

  public deleteByImageName(imageName: string) {
    return this.http.delete<number>(IMAGE_API + 'deleteByImageName/' + imageName, httpOptions);
  }

  public getImageByName(imageName: string) {
    return this.http.get<string>(IMAGE_API + 'get/' + imageName, httpOptions)
  }

  public changePharmacyStatusById(string: string, integer: number) {
    return this.http.post<boolean>(PHARMACY_API + 'changePharmacyStatusById', { string, integer }, httpOptions);
  }

  public deleteByUserId(pharmacyId: number) {
    return this.http.get<boolean>(PHARMACY_API + 'deleteByUserId/' + pharmacyId, httpOptions);
  }

  public getStockNumberByPharmacyId(pharmacyId: number) {
    return this.http.get<number>(MEDSTOCK_API + 'getStockNumberByPharmacyId/' + pharmacyId, httpOptions);
  }

  public importExcelFile(pharmacyId: number,uploadFileData: FormData) {
    return this.http.post<number>(UPLOADEXCELFILE_API + 'import/' + pharmacyId,uploadFileData);
  }

  public deleteByPharmacyId(pharmacyId: number) {
    return this.http.delete<boolean>(MEDSTOCK_API + 'deleteByPharmacyId/' + pharmacyId, httpOptions);
  }

  public searchMedByNameAndPharmacyId(pharmacyId: number,medicamentName:string) {
    return this.http.post<MedicamentStockGet []>(MEDSTOCK_API + 'searchMedByNameAndPharmacyId', {pharmacyId,medicamentName}, httpOptions);
  }
}
