import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DoctorGet } from 'src/model/Doctorget';
import { DoctorPostWithSecureLogin } from 'src/model/DoctorPostWithSecureLogin';
import { OneStringPost } from 'src/model/OneStringPost';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { TwoStringsPost } from 'src/model/TwoStringsPost';
import { DoctorService } from './doctor.service';

@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css']
})
export class DoctorComponent implements OnInit {

  oneStringPost: OneStringPost;
  twoStringsPost: TwoStringsPost;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  retrieveResonse: any;
  message: string;
  re = /^[A-Za-z]+$/;
  nb = /^\d+$/;
  er = new RegExp('^[0-9]+(\.[0-9]+)*$');
  cinPic: boolean = false; medicalSpecialtyPic : boolean = false; medicalClinicPic: boolean = false;
  doctorGet: DoctorGet;
  notApproved: string = 'info'; container: string = 'profile'; generalInfo: string = 'show';
  disableSaveBtn: boolean = true;
  maleCheckBox: boolean; femaleCheckBox: boolean;
  doctorPostWithSecureLogin: DoctorPostWithSecureLogin;
  secureLogin: SecureLoginString = new SecureLoginString(localStorage.getItem('secureLogin'));
  constructor(private doctorService: DoctorService, private toastr: ToastrService, private translate: TranslateService) { }
  invalidFirstNameVariable: boolean; invalidLastNameVariable: boolean; invalidMailVariable: boolean; invalidDayVariable: boolean; invalidMonthVariable: boolean; invalidYearVariable: boolean; invalidAdressVariable: boolean; invalidPasswordVariable: boolean; invalidPasswordRepeatVariable: boolean;
  passwordRepeatInfromation: string; passwordInfromation: string; firstNameInformation: string; lastNameInformation: string; mailInformation: string; dayInformation: string; monthInformation: string; yearInformation: string; adressInformation: string;
  firstName: string; lastName: string; mail: string; day: string; month: string; year: string; adress: string; password: string; passwordRepeat: string;

  ngOnInit(): void {
    this.getDoctorInfo();
    this.checkDocDocument(localStorage.getItem('id') + "doctorCinPic");
    this.checkDocDocument(localStorage.getItem('id') + "doctorMedicalClinicPic");
    this.checkDocDocument(localStorage.getItem('id') + "doctorMedicalSpecialty");
  }

  getDoctorInfo() {
    this.doctorService.getDoctorInfo(this.secureLogin).subscribe(
      res => {
        this.doctorGet = res;
        this.getImage(localStorage.getItem('id') + "doctorProfilePic");
        localStorage.setItem('id', this.doctorGet.doctorId + '');
        this.intializeEdit();
      },
      err => {
        this.toastr.info(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
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
      this.doctorPostWithSecureLogin = new DoctorPostWithSecureLogin(this.mail.toLowerCase(), this.firstName.toLowerCase(), this.lastName.toLowerCase(), this.adress.toLowerCase(), this.passwordRepeat, birthday, gender.toLowerCase(), localStorage.getItem("secureLogin"));
      this.doctorService.updateDoctorInfoBySecureLogin(this.doctorPostWithSecureLogin).subscribe(
        res => {
          console.log(res);
          if (res == 'usernameExist') {
            this.invalidMailVariable = true;
            this.mailInformation = this.translate.instant('mailExist');
          } else if (res == 'updated') {
            this.getDoctorInfo();
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
    this.firstName = this.doctorGet.doctorFirstName;
    this.lastName = this.doctorGet.doctorLastName;
    this.mail = this.doctorGet.doctorUserName;
    this.password = this.doctorGet.doctorPassword;
    this.passwordRepeat = this.doctorGet.doctorPassword;
    this.adress = this.doctorGet.doctorCity;
    this.day = this.doctorGet.doctorBirthDay.substr(0, 2);
    this.month = this.doctorGet.doctorBirthDay.substr(3, 2);
    this.year = this.doctorGet.doctorBirthDay.substr(6, 4);
    if (this.doctorGet.doctorGender == 'male')
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
    if (this.doctorGet.doctorGender == 'female')
      this.disableSaveBtn = false;
    else
      this.disableSaveBtn = true;
  }
  checkDisabledBtnFromFemale() {
    if (this.doctorGet.doctorGender == 'male')
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
    if (this.firstName.toLowerCase() === this.doctorGet.doctorFirstName)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareLastName() {
    if (this.lastName.toLowerCase() === this.doctorGet.doctorLastName)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareUserName() {
    if (this.mail.toLowerCase() === this.doctorGet.doctorUserName)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareDay() {
    if (this.day === this.doctorGet.doctorBirthDay.substr(0, 2))
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareMonth() {
    if (this.month === this.doctorGet.doctorBirthDay.substr(3, 2))
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareYear() {
    if (this.year === this.doctorGet.doctorBirthDay.substr(6, 4))
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareCity() {
    if (this.adress.toLowerCase() === this.doctorGet.doctorCity)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  comparePassword() {
    if (this.password === this.doctorGet.doctorPassword)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  public onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(localStorage.getItem('id') + "doctorProfilePic");
  }
  onUpload(imageName: string) {
    if (this.doctorGet.doctorId == parseInt(localStorage.getItem('id'))) {
      const uploadImageData = new FormData();
      uploadImageData.append('imageFile', this.selectedFile, imageName);
      this.doctorService.updateDoctorProfilePhoto(uploadImageData).subscribe(
        res => {
          if (res == 'imageUpdated')
            this.getImage(imageName);
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
  getImage(imageName: string) {
    if (this.doctorGet.doctorId == parseInt(localStorage.getItem('id'))) {
      if (imageName == localStorage.getItem('id') + "doctorProfilePic") {
        this.doctorService.getDoctorPofilePhoto(imageName).subscribe(
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
      } else if (imageName == localStorage.getItem('id') + "doctorCinPic")
        this.cinPic = true;
      else if (imageName == localStorage.getItem('id') + "doctorMedicalClinicPic")
        this.medicalClinicPic = true;
      else if (imageName == localStorage.getItem('id') + "doctorMedicalSpecialty")
        this.medicalSpecialtyPic = true;
    } else {
      this.toastr.info(this.translate.instant('applicationDataChanged'), this.translate.instant('Data'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    }
  }
  public onFileChangedCin(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(localStorage.getItem('id') + "doctorCinPic");
  }
  public onFileChangedMedicalClinic(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(localStorage.getItem('id') + "doctorMedicalClinicPic");
  }
  public onFileChangedMedicalSpecialty(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(localStorage.getItem('id') + "doctorMedicalSpecialty");
  }
  submitDoctorDocuments() {
    this.twoStringsPost = new TwoStringsPost(localStorage.getItem('secureLogin'), 'pending');
    this.doctorService.changeDoctorStatusBySecureId(this.twoStringsPost).subscribe(
      res => {
        if (res == 'doctorStatusUpdated') {
          this.getDoctorInfo();
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
  checkDocDocument(imageName: string) {
    this.oneStringPost = new OneStringPost(imageName);
    this.doctorService.checkIfDocumentExist(this.oneStringPost).subscribe(
      res => {
        if (res == true) {
          if (imageName == localStorage.getItem('id') + "doctorCinPic")
            this.cinPic = true;
          else if (imageName == localStorage.getItem('id') + "doctorMedicalClinicPic")
            this.medicalClinicPic = true;
          else if (imageName == localStorage.getItem('id') + "doctorMedicalSpecialty")
            this.medicalSpecialtyPic = true;
        }
      }
    );
  }
  toNotApprovedSection(){
    document.getElementById("notApprovedSection").scrollIntoView({behavior:"smooth"});
  }
}
