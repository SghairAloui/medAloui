import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SecretaryPublicInfo } from 'src/model/SecretaryPublicInfo';
import { DoctorComponent } from '../doctor/doctor.component';
import { DoctorService } from '../doctor/doctor.service';

@Component({
  selector: 'app-doctor-secretary',
  templateUrl: './doctor-secretary.component.html',
  styleUrls: ['./doctor-secretary.component.css']
})
export class DoctorSecretaryComponent implements OnInit {

  constructor(private translate: TranslateService,
    private doctorService: DoctorService,
    private toastr: ToastrService,
    private doctorComp: DoctorComponent) { }

  newSecretary: string = 'container';
  invalidGenderInformation: string = 'false';
  maleCheckBox: boolean = false; femaleCheckBox: boolean = false;
  loading: boolean = false;
  days: number[] = [];
  months: number[] = [];
  years: number[] = [];
  immmmm: any;

  ngOnInit(): void {
    this.getMySecretaries();
    for (let i = 1; i <= 31; i++)
      this.days.push(i);
    for (let i = 1; i <= 12; i++)
      this.months.push(i);
    for (let i = 2021; i >= 1900; i--)
      this.years.push(i);
  }

  invalidEmailInformation: string = 'false';
  email: string = '';
  checkEmail(createAccount: boolean) {
    if (this.loading == false && this.showSecurityCode == false) {
      this.loading = true;
      let validMail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (this.email.length == 0) {
        this.invalidEmailInformation = this.translate.instant('mailApha');
        this.loading = false;
      } else {
        if (validMail.test(this.email)) {
          if (createAccount == false) {
            this.sendSeeSecretaryWorkRequest();
          }
          else
            this.createSecretaryAccount();
          this.invalidEmailInformation = 'false';
        }
        else {
          this.invalidEmailInformation = this.translate.instant('enterValidMail');
          this.loading = false;
        }
      }
    } else if (this.showSecurityCode == true && !this.searchedSecretary) {
      this.checkSecretaryVerificationCode();
    } else if (this.searchedSecretary) {
      this.addSecretary();
    }
  }

  showSecurityCode: boolean = false;
  isVerificationCode: boolean;
  sendSeeSecretaryWorkRequest() {
    this.loading = true;
    this.doctorService.sendSeeSecretaryWorkRequest(this.email, this.doctorComp.doctorGet.userId).subscribe(
      res => {
        if (res == 'notFound')
          this.invalidEmailInformation = this.translate.instant('thereIsNoSecretary');
        else if (res == 'alreadyWithYou')
          this.invalidEmailInformation = this.translate.instant('thisSecAlreadyWithYou');
        else if (res == 'found')
          this.showSecurityCode = true;

        this.loading = false;
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
        this.loading = false;
      }
    );
  }

  @ViewChild('1') field1Input: ElementRef;
  @ViewChild('2') field2Input: ElementRef;
  @ViewChild('3') field3Input: ElementRef;
  @ViewChild('4') field4Input: ElementRef;
  field1Code: string; field2Code: string; field3Code: string; field4Code: string;
  searchedSecretary: SecretaryPublicInfo;
  field1Keyup() {
    if (this.field1Code.length == 1)
      this.field2Input.nativeElement.focus();
  }
  field2Keyup() {
    if (this.field2Code.length == 1)
      this.field3Input.nativeElement.focus();
    else
      this.field1Input.nativeElement.focus();
  }
  field3Keyup() {
    if (this.field3Code.length == 1)
      this.field4Input.nativeElement.focus();
    else
      this.field2Input.nativeElement.focus();
  }
  field4Keyup() {
    if (this.field4Code.length != 1)
      this.field3Input.nativeElement.focus();
  }
  checkSecretaryVerificationCode() {
    this.doctorService.checkSecretaryCode(this.doctorComp.doctorGet.userId, this.email, parseInt(this.field1Code + this.field2Code + this.field3Code + this.field4Code)).subscribe(
      res => {
        if (res != null) {
          this.searchedSecretary = res;
          this.isVerificationCode = true;
          this.getImage(this.searchedSecretary.userId + 'profilePic').then((value) => { this.searchedSecretary.profilePic = value; });
          for (let work of this.searchedSecretary.secretaryWork) {
            this.getImage(work.doctorId + 'profilePic').then((value) => { work.doctorImg = value; });
          }
          console.log(this.searchedSecretary);
          this.loading = false;
        } else
          this.isVerificationCode = false;
        this.loading = false;
      }
    );
  }

  async getImage(imageName: string): Promise<any> {
    let res: any = await this.doctorService.getDoctorPofilePhoto(imageName).toPromise();
    if (res != null) {
      let retrieveResonse: any = res;
      let base64Data: any = retrieveResonse.picByte;
      return 'data:image/jpeg;base64,' + base64Data;
    } else
      return false;
  }

  addSecretary() {
    this.loading = true;
    this.doctorService.addSecretary(this.email, this.doctorComp.doctorGet.userId).subscribe(
      res => {
        this.searchedSecretary = null;
        this.newSecretary = 'secretaryAdded';
        this.loading = false;
        this.email = '';
        this.field1Code = '';
        this.field2Code = '';
        this.field3Code = '';
        this.field4Code = '';
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
        this.loading = false;
      }
    );
  }

  createSecretaryAccount() {
    let birthday: string = (this.day.length == 1 ? '0' + this.day : this.day) + '/' + (this.month.length == 1 ? '0' + this.month : this.month) + '/' + this.year;
    let gender: string;
    if (this.maleCheckBox == true)
      gender = 'male';
    else
      gender = 'female';
    this.doctorService.createSecretaryAccount(this.email, this.password, this.city, this.firstName, this.lastName,
      birthday, gender, this.doctorComp.doctorGet.userId).subscribe(
        res => {
          if (res == false)
            this.invalidEmailInformation = this.translate.instant('emailAlreadyTaken');
          else {
            this.newSecretary = 'accountCreated';
            this.email = '';
            this.firstName = '';
            this.lastName = '';
            this.day = '';
            this.month = '';
            this.year = '';
            this.password = '';
            this.passwordRepeat = '';
            this.maleCheckBox = false;
            this.femaleCheckBox = false;
            this.loading = false;
          }
        },
        err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
          this.loading = false;
        }
      );
  }

  invalidFirstNameInformation: string = 'false'; invalidLastNameInformation: string = 'false';
  firstName: string = ''; lastName: string = '';
  checkSecretaryForm() {
    this.loading = true;
    let re = /^[A-Za-z]+\s+[A-Za-z]+$/;
    let re1 = /^[A-Za-z]+$/;

    if (this.firstName.length >= 3) {
      if (re.test(this.firstName) || re1.test(this.firstName)) {
        if (this.lastName.length >= 3) {
          if (re.test(this.lastName) || re1.test(this.lastName)) {
            this.invalidFirstNameInformation = 'false';
            this.invalidLastNameInformation = 'false';
            this.checkBirthDay();
          }
          else {
            this.loading = false;
            this.invalidLastNameInformation = this.translate.instant('nameApha');
          }
        } else {
          this.loading = false;
          this.invalidLastNameInformation = this.translate.instant('nameFirst');
        }
      } else {
        this.loading = false;
        this.invalidFirstNameInformation = this.translate.instant('nameApha');
      }
    } else {
      this.loading = false;
      this.invalidFirstNameInformation = this.translate.instant('nameFirst');
    }
  }

  invalidDayInformation: string = 'false'; invalidMonthInformation: string = 'false'; invalidYearInformation: string = 'false';
  day: string = ''; month: string = ''; year: string = '';
  checkBirthDay() {
    if (this.day != '' && parseInt(this.day) > 0 && parseInt(this.day) <= 31) {
      this.invalidDayInformation = 'false';
      if (this.month != '' && parseInt(this.month) > 0 && parseInt(this.month) <= 12) {
        this.invalidMonthInformation = 'false';
        if (this.year != '' && parseInt(this.year) >= 1900 && parseInt(this.year) <= 2021) {
          this.invalidYearInformation = 'false';
          this.checkCity();
        }
        else {
          this.loading = false;
          this.invalidYearInformation = this.translate.instant('yearErr');
        }
      } else {
        this.loading = false;
        this.invalidMonthInformation = this.translate.instant('monthErr');
      }
    } else {
      this.loading = false;
      this.invalidDayInformation = this.translate.instant('dayErr');
    }
  }

  cities: string[] = ["Ariana", this.translate.instant('Beja'), "Ben Arous", "Bizerte", this.translate.instant('Gabes'), "Gafsa", "Jendouba", "Kairouan", "Kasserine", this.translate.instant('Kebili'), "Kef", "Mahdia", "Manouba", this.translate.instant('Medenine'), "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];
  invalidCityInformation: string = 'false';
  city: string = '';
  checkCity() {
    let lowerCaseAdress: string = this.city.toLowerCase();
    this.city = this.city.replace('é', 'e');
    this.city = this.city.replace('è', 'e');
    for (let city of this.cities) {
      if (city.toLowerCase() == lowerCaseAdress) {
        this.invalidCityInformation = 'false';
        this.checkGender();
        break;
      }
      else {
        this.loading = false;
        this.invalidCityInformation = this.translate.instant('enterValidCity');
      }
    }
  }

  checkGender() {
    if (this.maleCheckBox == false && this.femaleCheckBox == false) {
      this.loading = false;
      this.invalidGenderInformation = this.translate.instant('selectGender');
    }
    else {
      this.invalidGenderInformation = 'false';
      this.checkPassword();
    }
  }

  invalidPasswordInformation: string = 'false'; invalidPasswordRepeatInformation: string = 'false';
  password: string = ''; passwordRepeat: string = '';
  checkPassword() {
    if (this.password.length >= 6) {
      if (this.passwordRepeat == this.password) {
        this.invalidPasswordInformation = 'false';
        this.invalidPasswordRepeatInformation = 'false';
        this.checkEmail(true);
      }
      else {
        this.loading = false;
        this.invalidPasswordRepeatInformation = this.translate.instant('repeatPasswordErr');
      }
    } else {
      this.loading = false;
      this.invalidPasswordInformation = this.translate.instant('passwordUnder6');
    }
  }

  mySecretaries: SecretaryPublicInfo[] = [];
  loadingSecretaries: boolean = true;
  getMySecretaries() {
    this.doctorService.getMySecretaries(this.doctorComp.doctorGet.userId, this.doctorComp.doctorGet.userId).subscribe(
      res => {
        this.mySecretaries = res;
        for (let secretary of this.mySecretaries) {
          this.doctorService.getDoctorPofilePhoto(secretary.userId + 'profilePic').subscribe(
            res => {
              if (res != null) {
                let retrieveResonse: any = res;
                let base64Data: any = retrieveResonse.picByte;
                secretary.profilePic = 'data:image/jpeg;base64,' + base64Data;
              } else
                secretary.profilePic = false;
            }
          );
        }
        this.loadingSecretaries = false;
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
        this.loadingSecretaries = false;
      }
    );
  }

  loadingSecretaryWork: boolean;
  selectedSecretaryKey: number = -1;
  getSecretaryWork(secretaryKey: number) {
    if (this.mySecretaries[secretaryKey].secretaryWork != null)
      this.selectedSecretaryKey = secretaryKey;
    else {
      this.loadingSecretaryWork = true;
      this.doctorService.getSecretaryWork(this.mySecretaries[secretaryKey].userId).subscribe(
        res => {
          this.mySecretaries[secretaryKey].secretaryWork = res;
          for (let work of this.mySecretaries[secretaryKey].secretaryWork) {
            this.doctorService.getDoctorPofilePhoto(work.doctorId + 'profilePic').subscribe(
              res => {
                if (res != null) {
                  let retrieveResonse: any = res;
                  let base64Data: any = retrieveResonse.picByte;
                  work.doctorImg = 'data:image/jpeg;base64,' + base64Data;
                } else
                  work.doctorImg = false;
              }
            );
          }
          this.loadingSecretaryWork = false;
          this.selectedSecretaryKey = secretaryKey;
        }
      );
    }
  }
}