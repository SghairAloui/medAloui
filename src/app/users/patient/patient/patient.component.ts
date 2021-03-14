import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PatientGet } from 'src/model/PatientGet';
import { PatientPostWithSecureLogin } from 'src/model/PatientPostWithSecureLogin';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { StringAndTwoDoublePost } from 'src/model/stringAndTwoDoublePost';
import { PatientService } from './patient.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  constructor(private patientService: PatientService, private translate: TranslateService, private http: HttpClient, private toastr: ToastrService) { }
  patientPostWithSecureLogin: PatientPostWithSecureLogin;
  stringAndTwoDoublePost: StringAndTwoDoublePost;
  re = /^[A-Za-z]+$/;
  nb = /^\d+$/;
  er = new RegExp('^[0-9]+(\.[0-9]+)*$');
  secureLoginString: SecureLoginString;
  patientGet: PatientGet;
  generalInfo: string = 'show';
  maleCheckBox: boolean; femaleCheckBox: boolean;
  container: string = 'profile'; medicalProfileInfo: string = 'noData'; medicalProfile: string = 'showData'; medicalProfileDiseaseInfo: string = 'info'; prescriptionInfo: string = 'info';
  height: string; weight: string; firstName: string; lastName: string; mail: string; day: string; month: string; year: string; adress: string; password: string; passwordRepeat: string;
  heightInformation: string; weightInformation: string; passwordRepeatInfromation: string; passwordInfromation: string; firstNameInformation: string; lastNameInformation: string; mailInformation: string; dayInformation: string; monthInformation: string; yearInformation: string; adressInformation: string;
  invalidFirstNameVariable: boolean; invalidLastNameVariable: boolean; invalidMailVariable: boolean; invalidDayVariable: boolean; invalidMonthVariable: boolean; invalidYearVariable: boolean; invalidAdressVariable: boolean; invalidPasswordVariable: boolean; invalidPasswordRepeatVariable: boolean; invalidHeightVariable: boolean = false; invalidWeightVariable: boolean = false;
  disableSaveBtn: boolean = true;
  disableSaveMedicalProfileBtn: boolean = true;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  retrieveResonse: any;
  message: string;

  ngOnInit(): void {
    this.getUserInfo();
  }

  checkForm() {
    this.checkMail();
    this.checkFirstName();
    this.checkLastName();
    this.checkAdress();
    this.checkBirthday();
    this.checkPassword();
    if (this.invalidAdressVariable == false && this.invalidFirstNameVariable == false && this.invalidLastNameVariable == false && this.invalidDayVariable == false && this.invalidMonthVariable == false && this.invalidYearVariable == false && this.invalidPasswordVariable == false && this.invalidPasswordRepeatVariable == false) {
      let birthday: string = this.day + '/' + this.month + '/' + this.year;
      let gender: string;
      if (this.maleCheckBox == true)
        gender = 'male';
      else
        gender = 'female';
      this.patientPostWithSecureLogin = new PatientPostWithSecureLogin(this.mail.toLowerCase(), this.firstName.toLowerCase(), this.lastName.toLowerCase(), this.adress.toLowerCase(), this.passwordRepeat, birthday, gender.toLowerCase(), localStorage.getItem("secureLogin"));
      this.patientService.updatePatientInfoBySecureLogin(this.patientPostWithSecureLogin).subscribe(
        res => {
          console.log(res);
          if (res == 'usernameExist') {
            this.invalidMailVariable = true;
            this.mailInformation = this.translate.instant('mailExist');
          } else if (res == 'updated') {
            this.getUserInfo();
            this.invalidMailVariable = false;
            this.generalInfo = 'show';
            this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('update'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
          }
        },
        err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    }
  }
  public getUserInfo() {
    this.secureLoginString = new SecureLoginString(localStorage.getItem("secureLogin"));
    this.patientService.getPatientInfo(this.secureLoginString).subscribe(
      res => {
        this.patientGet = res;
        this.intializeEdit();
        this.getImage();
        localStorage.setItem('id', this.patientGet.patientId + '')
      },
      err => {
        this.toastr.info(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
  checkLastName() {
    if (this.lastName.length < 3) {
      this.invalidLastNameVariable = true;
      this.lastNameInformation = this.translate.instant('firstSurname');
    } else {
      if (this.re.test(this.lastName)) {
        this.invalidLastNameVariable = false;
        this.lastNameInformation = this.translate.instant('surname');
      }
      else {
        this.invalidLastNameVariable = true;
        this.lastNameInformation = this.translate.instant('surnameApha');
      }
    }
  }
  checkFirstName() {
    if (this.firstName.length < 3) {
      this.invalidFirstNameVariable = true;
      this.firstNameInformation = this.translate.instant('nameFirst');
    } else {
      if (this.re.test(this.firstName)) {
        this.invalidFirstNameVariable = false;
        this.firstNameInformation = this.translate.instant('firstName');
      }
      else {
        this.invalidFirstNameVariable = true;
        this.firstNameInformation = this.translate.instant('nameApha');
      }
    }
  }
  checkMail() {
    if (this.mail.length < 6) {
      this.invalidMailVariable = true;
      this.mailInformation = this.translate.instant('mailApha');
    } else {
      if (this.mail.indexOf(' ') !== -1) {
        this.invalidMailVariable = true;
        this.mailInformation = this.translate.instant('enterValidMail');
      }
      else {
        this.invalidMailVariable = false;
        this.mailInformation = this.translate.instant('mail');
      }
    }
  }
  intializeEdit() {
    this.firstName = this.patientGet.patientFirstName;
    this.lastName = this.patientGet.patientLastName;
    this.mail = this.patientGet.patientUserName;
    this.password = this.patientGet.patientPassword;
    this.passwordRepeat = this.patientGet.patientPassword;
    this.adress = this.patientGet.patientCity;
    this.day = this.patientGet.patientBirthDay.substr(0, 2);
    this.month = this.patientGet.patientBirthDay.substr(3, 2);
    this.year = this.patientGet.patientBirthDay.substr(6, 4);
    if (this.patientGet.patientGender == 'male')
      this.maleCheckBox = true;
    else
      this.femaleCheckBox = true;
  }
  initializeEditLabel() {
    this.firstNameInformation = this.translate.instant('firstName');
    this.passwordRepeatInfromation = this.translate.instant('repeatPassword');
    this.passwordInfromation = this.translate.instant('password');
    this.lastNameInformation = this.translate.instant('surname');
    this.mailInformation = this.translate.instant('mail');
    this.dayInformation = this.translate.instant('day');
    this.monthInformation = this.translate.instant('month');
    this.yearInformation = this.translate.instant('year');
    this.adressInformation = this.translate.instant('city');
  }
  checkAdress() {
    let upperCaseAdress: string = this.adress.toUpperCase();
    if (upperCaseAdress == "Ariana".toUpperCase() || upperCaseAdress == "Béja".toUpperCase() || upperCaseAdress == "Ben Arous".toUpperCase() || upperCaseAdress == "Bizerte".toUpperCase() || upperCaseAdress == "Gabès".toUpperCase() || upperCaseAdress == "Gafsa".toUpperCase() || upperCaseAdress == "Jendouba".toUpperCase() || upperCaseAdress == "Kairouan".toUpperCase() || upperCaseAdress == "Kasserine".toUpperCase() || upperCaseAdress == "Kébili".toUpperCase() || upperCaseAdress == "Kef".toUpperCase() || upperCaseAdress == "Mahdia".toUpperCase() || upperCaseAdress == "Manouba".toUpperCase() || upperCaseAdress == "Médenine".toUpperCase() || upperCaseAdress == "Monastir".toUpperCase() || upperCaseAdress == "Nabeul".toUpperCase() || upperCaseAdress == "Sfax".toUpperCase() || upperCaseAdress == "Sidi Bouzid".toUpperCase() || upperCaseAdress == "Siliana".toUpperCase() || upperCaseAdress == "Sousse".toUpperCase() || upperCaseAdress == "Tataouine".toUpperCase() || upperCaseAdress == "Tozeur".toUpperCase() || upperCaseAdress == "Tunis".toUpperCase() || upperCaseAdress == "Zaghouan".toUpperCase()) {
      this.invalidAdressVariable = false;
      this.adressInformation = this.translate.instant('city');
    }
    else {
      this.invalidAdressVariable = true;
      this.adressInformation = this.translate.instant('enterValidCity');
    }
  }
  checkPassword() {
    if (this.password.length > 5) {
      this.invalidPasswordVariable = false;
      this.passwordInfromation = this.translate.instant('password');
    }
    else {
      this.invalidPasswordVariable = true;
      this.passwordInfromation = this.translate.instant('passwordUnder6');
    }
    if (this.passwordRepeat == this.password || this.password.length < 6) {
      this.invalidPasswordRepeatVariable = false;
      this.passwordRepeatInfromation = this.translate.instant('repeatPassword');
    }
    else {
      this.invalidPasswordRepeatVariable = true;
      this.passwordRepeatInfromation = this.translate.instant('repeatPasswordErr');
    }
  }
  checkDisabledBtnFromMale() {
    if (this.patientGet.patientGender == 'female')
      this.disableSaveBtn = false;
    else
      this.disableSaveBtn = true;
  }
  checkDisabledBtnFromFemale() {
    if (this.patientGet.patientGender == 'male')
      this.disableSaveBtn = false;
    else
      this.disableSaveBtn = true;
  }
  checkBirthday() {
    if ((parseInt(this.day) <= 31 && parseInt(this.day) > 0) && (this.nb.test(this.day) && this.day.length == 2)) {
      this.invalidDayVariable = false;
      this.dayInformation = this.translate.instant('day');
    }
    else {
      this.invalidDayVariable = true;
      this.dayInformation = this.translate.instant('dayErr');
    }
    if ((parseInt(this.month) <= 12 && parseInt(this.month) > 0) && (this.nb.test(this.month) && this.month.length == 2)) {
      this.invalidMonthVariable = false;
      this.monthInformation = this.translate.instant('month');
    }
    else {
      this.invalidMonthVariable = true;
      this.monthInformation = this.translate.instant('monthErr');
    }
    if ((parseInt(this.year) <= 2021 && parseInt(this.year) > 1900) && (this.nb.test(this.year) && this.year.length == 4)) {
      this.invalidYearVariable = false;
      this.yearInformation = this.translate.instant('year');
    }
    else {
      this.invalidYearVariable = true;
      this.yearInformation = this.translate.instant('yearErr');
    }
  }
  compareFirstName() {
    if (this.firstName.toLowerCase() === this.patientGet.patientFirstName)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareLastName() {
    if (this.lastName.toLowerCase() === this.patientGet.patientLastName)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareUserName() {
    if (this.mail.toLowerCase() === this.patientGet.patientUserName)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareDay() {
    if (this.day === this.patientGet.patientBirthDay.substr(0, 2))
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareMonth() {
    if (this.month === this.patientGet.patientBirthDay.substr(3, 2))
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareYear() {
    if (this.year === this.patientGet.patientBirthDay.substr(6, 4))
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareCity() {
    if (this.adress.toLowerCase() === this.patientGet.patientCity)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  comparePassword() {
    if (this.password === this.patientGet.patientPassword)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareHeight() {
    if (parseFloat(this.height) == this.patientGet.medicalProfile.height || this.height == "")
      this.disableSaveMedicalProfileBtn = true;
    else
      this.disableSaveMedicalProfileBtn = false;
    this.height = this.height.replace(',', '.');

  }
  compareWeight() {
    if (parseFloat(this.weight) == this.patientGet.medicalProfile.weight || this.weight == "")
      this.disableSaveMedicalProfileBtn = true;
    else
      this.disableSaveMedicalProfileBtn = false;
    this.weight = this.weight.replace(',', '.');
  }
  initializeMedicalProfileLabel() {
    this.heightInformation = this.translate.instant('height');
    this.weightInformation = this.translate.instant('weight');
  }
  checkMedicalProfileForm() {
    if (parseFloat(this.height) > 0 && parseFloat(this.height) < 3 && this.er.test(this.height)) {
      if (this.height.length < 5) {
        this.invalidHeightVariable = false;
      } else {
        this.invalidHeightVariable = true;
        this.heightInformation = this.translate.instant('heightMax5');
      }
    } else {
      this.invalidHeightVariable = true;
      this.heightInformation = this.translate.instant('invalidHeight');
    }
    if (parseFloat(this.weight) > 0 && parseFloat(this.weight) < 500 && this.er.test(this.weight)) {
      if (this.weight.length < 6) {
        this.invalidWeightVariable = false;
      } else {
        this.invalidWeightVariable = true;
        this.weightInformation = this.translate.instant('weightMax6');
      }
    } else {
      this.invalidWeightVariable = true;
      this.weightInformation = this.translate.instant('invalidWeight');
    }
    this.weight = this.weight + '.';
    if (this.weight.match(/[.]/g).length > 2) {
      this.invalidWeightVariable = true;
      this.weightInformation = this.translate.instant('weightDot');
    }
    this.weight = this.weight.slice(0, -1);
    if (this.invalidWeightVariable == false && this.invalidHeightVariable == false)
      this.updateMedicalProfileData();
  }
  updateMedicalProfileData() {
    this.stringAndTwoDoublePost = new StringAndTwoDoublePost(localStorage.getItem('secureLogin'), parseFloat(this.height), parseFloat(this.weight));
    this.patientService.updateMedicalProfileBySecureLogin(this.stringAndTwoDoublePost).subscribe(
      res => {
        if (res == 'updated') {
          this.medicalProfile = 'showData';
          this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('update'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.getUserInfo();
          this.medicalProfileInfo = 'showData';
        }
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
  initilizeMedicalProfile() {
    this.height = this.patientGet.medicalProfile.height.toString();
    this.weight = this.patientGet.medicalProfile.weight.toString();
  }
  public onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload();
    this.getImage();
  }
  onUpload() {
    if (this.patientGet.patientId == parseInt(localStorage.getItem('id'))) {
      const uploadImageData = new FormData();
      uploadImageData.append('imageFile', this.selectedFile, localStorage.getItem('id') + "patientProfilePic");
      this.patientService.updatePatientProfilePhoto(uploadImageData).subscribe(
        res => {
          if (res == 'imageUpdated')
            this.getImage();
        },
        err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    } else {
      this.toastr.info(this.translate.instant('applicationDataChanged'), this.translate.instant('Data'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    }
  }
  getImage() {
    if (this.patientGet.patientId == parseInt(localStorage.getItem('id'))) {
      this.patientService.getPatientPofilePhoto().subscribe(
        res => {
          this.retrieveResonse = res;
          this.base64Data = this.retrieveResonse.picByte;
          this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
        },
        err => {
          if (this.retrievedImage) {
            this.toastr.info(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
          }
        }
      );
    } else {
      this.toastr.info(this.translate.instant('applicationDataChanged'), this.translate.instant('Data'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    }
  }
}
