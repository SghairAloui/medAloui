import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MedicalProfileService } from 'src/app/medical profile/medical-profile.service';
import { SpecialityService } from 'src/app/speciality/speciality.service';
import { AppointmentPatientInfo } from 'src/model/AppointmentPatientInfo';
import { DoctorGet } from 'src/model/Doctorget';
import { DoctorPostWithSecureLogin } from 'src/model/DoctorPostWithSecureLogin';
import { FiveStringsPost } from 'src/model/FiveStringsPost';
import { IntegerAndStringPost } from 'src/model/IntegerAndStringPost';
import { medicalProfileGet } from 'src/model/medicalProfileGet';
import { OneStringPost } from 'src/model/OneStringPost';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { SpecialityGet } from 'src/model/SpecialityGet';
import { TwoStringsPost } from 'src/model/TwoStringsPost';
import { PatientService } from '../../patient/patient/patient.service';
import { DoctorService } from './doctor.service';

@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css']
})
export class DoctorComponent implements OnInit {

  currentDate: string;
  specialityCode: string;
  testSpeciality: boolean;
  specialityName: string;
  fiveStringsPost: FiveStringsPost; oneStringPost: OneStringPost; twoStringsPost: TwoStringsPost; integerAndStringPost: IntegerAndStringPost;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  retrieveResonse: any;
  re = /^[A-Za-z]+$/;
  nb = /^\d+$/;
  er = new RegExp('^[0-9]+(\.[0-9]+)*$');
  cinPic: boolean = false; medicalSpecialtyPic: boolean = false; medicalClinicPic: boolean = false;
  doctorGet: DoctorGet;
  disabledUpdateBtn: boolean = true;
  doctorSettings: boolean = true; notApproved: string = 'info'; container: string = 'profile'; generalInfo: string = 'show';
  disableSaveBtn: boolean = true;
  specialityInformation: string; speciality: string; specialityGet: SpecialityGet[] = [];
  invalidSpecialityVariable: boolean;
  maleCheckBox: boolean; femaleCheckBox: boolean;
  doctorPostWithSecureLogin: DoctorPostWithSecureLogin;
  secureLogin: SecureLoginString = new SecureLoginString(localStorage.getItem('secureLogin'));
  Mon: boolean; Tue: boolean; Wed: boolean; Thu: boolean; Fri: boolean; Sat: boolean; Sun: boolean; selectDay: boolean = false;

  constructor(private doctorService: DoctorService, private toastr: ToastrService, private translate: TranslateService, private router: Router, private specialityService: SpecialityService, private patientService: PatientService, private medicalProfileService: MedicalProfileService) { }
  invalidExactAdress: boolean; invalidStartTime: boolean; invalidMaxPatientPerDay: boolean; invalidFirstNameVariable: boolean; invalidLastNameVariable: boolean; invalidMailVariable: boolean; invalidDayVariable: boolean; invalidMonthVariable: boolean; invalidYearVariable: boolean; invalidAdressVariable: boolean; invalidPasswordVariable: boolean; invalidPasswordRepeatVariable: boolean;
  exactAdressInformation: string; startTimeInformation: string; maxPatientPerDayInformation: string; passwordRepeatInfromation: string; passwordInfromation: string; firstNameInformation: string; lastNameInformation: string; mailInformation: string; dayInformation: string; monthInformation: string; yearInformation: string; adressInformation: string;
  exactAdress: string; startTime: string; maxPatientPerDay: string; firstName: string; lastName: string; mail: string; day: string; month: string; year: string; adress: string; password: string; passwordRepeat: string;
  docInfo: boolean;
  toadyAppointmentPatientInfo: AppointmentPatientInfo[];
  tomorrowAppointmentPatientInfo: AppointmentPatientInfo[];
  completedAppointmentPatientInfo: AppointmentPatientInfo[];
  nextAppointmentPatientInfo: AppointmentPatientInfo[];
  patientTodayProfilePicRes: any[];patientTomorrowProfilePicRes: any[];
  patientTodayProfilePic: any[];patientTomorrowProfilePic: any[];
  patientStart: number = 0;patientTomorrowStart:number=0;
  patientFinish: number = 6;patientTomorrowFinish:number=6;
  showpatientNavigationRight: boolean;showTomorrowpatientNavigationRight:boolean;
  showpatientNavigationLeft: boolean;showTomorrowpatientNavigationLeft:boolean;
  lengthTested: boolean;tommorowLengthTested:boolean;
  patientInfo: boolean = false;tomorrowPatientInfo:boolean = false;
  patientKey: number;tomorrowPatientKey:number;
  todayPatientMedicalProfileGet: medicalProfileGet[] = [];tomorrowPatientMedicalProfileGet: medicalProfileGet[] = [];

  ngOnInit(): void {
    this.lengthTested = false;this.tommorowLengthTested=false;
    this.toadyAppointmentPatientInfo = []; this.tomorrowAppointmentPatientInfo = []; this.completedAppointmentPatientInfo = []; this.nextAppointmentPatientInfo = []; this.patientTodayProfilePicRes = []; this.patientTodayProfilePic = [];this.patientTomorrowProfilePicRes=[];this.patientTomorrowProfilePic=[];
    this.currentDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');
    this.docInfo = false;
    this.getDoctorInfo();
    this.getAllSpecialities();
  }
  getDoctorInfo() {
    this.doctorService.getDoctorInfo(this.secureLogin).subscribe(
      res => {
        if (res) {
          this.doctorGet = res;
          this.getAppPatientInfo();
          this.docInfo = true;
          localStorage.setItem('id', this.doctorGet.doctorId.toString());
          if (this.doctorGet.doctorStatus == 'notApproved' || this.doctorGet.doctorStatus == 'disapprovedByAdmin') {
            this.checkDocDocument(this.doctorGet.doctorId + "doctorCinPic");
            this.checkDocDocument(this.doctorGet.doctorId + "doctorMedicalClinicPic");
            this.checkDocDocument(this.doctorGet.doctorId + "doctorMedicalSpecialty");
          }
          this.getImage(this.doctorGet.doctorId + "doctorProfilePic");
          this.intializeEdit();
          this.initializeAccountSettings();
          this.initializeEditAccountSettigns();
        } else
          this.router.navigate(['/acceuil']);
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
  ckeckFormAndUpdate() {
    if (parseInt(this.maxPatientPerDay) > 0 && parseInt(this.maxPatientPerDay) < 100 && this.maxPatientPerDay.length != 0) {
      this.invalidMaxPatientPerDay = false;
    } else {
      this.invalidMaxPatientPerDay = true;
      this.maxPatientPerDayInformation = this.translate.instant('maxPatientPerDayInvalid');
    }
    if (this.startTime == null) {
      this.invalidStartTime = true;
      this.startTimeInformation = this.translate.instant('startTimeInvalid');
    } else {
      if (this.startTime.charAt(1) == ':') {
        if (parseInt(this.startTime.slice(0, 1)) >= 7 && parseInt(this.startTime.slice(0, 1)) < 10 && parseInt(this.startTime.slice(2, 4)) >= 0 && parseInt(this.startTime.slice(2, 4)) < 60) {
          this.invalidStartTime = false;
        } else {
          this.invalidStartTime = true;
          this.startTimeInformation = this.translate.instant('startTimeInvalid');
        }
      } else if (this.startTime.charAt(2) == ':') {
        if (parseInt(this.startTime.slice(0, 2)) >= 10 && parseInt(this.startTime.slice(0, 2)) < 13 && parseInt(this.startTime.slice(3, 5)) >= 0 && parseInt(this.startTime.slice(3, 5)) < 60) {
          this.invalidStartTime = false;
        } else {
          this.invalidStartTime = true;
          this.startTimeInformation = this.translate.instant('startTimeInvalid');
        }
      } else {
        this.invalidStartTime = true;
        this.startTimeInformation = this.translate.instant('startTimeInvalid');
      }
    }
    if (this.invalidStartTime == false && this.invalidMaxPatientPerDay == false && this.exactAdress != null) {
      if (this.exactAdress.length >= 10) {
        if (this.Mon == true || this.Tue == true || this.Wed == true || this.Thu == true || this.Fri == true || this.Sat == true || this.Sun == true) {
          this.selectDay = false;
          let workDays: string = '';
          if (this.Mon == true)
            workDays = workDays + 'Mon ';
          if (this.Tue == true)
            workDays = workDays + 'Tue ';
          if (this.Wed == true)
            workDays = workDays + 'Wed ';
          if (this.Thu == true)
            workDays = workDays + 'Thu ';
          if (this.Fri == true)
            workDays = workDays + 'Fri ';
          if (this.Sat == true)
            workDays = workDays + 'Sat ';
          if (this.Sun == true)
            workDays = workDays + 'Sun ';
          this.fiveStringsPost = new FiveStringsPost(localStorage.getItem('secureLogin'), this.maxPatientPerDay, this.startTime, this.exactAdress, workDays);
          this.doctorService.updateDoctorSettingsBySecurelogin(this.fiveStringsPost).subscribe(
            res => {
              if (res == 'updated') {
                this.twoStringsPost = new TwoStringsPost(localStorage.getItem('secureLogin'), 'approved');
                this.doctorService.changeDoctorStatusBySecureId(this.twoStringsPost).subscribe(
                  res => {
                    if (res == 'doctorStatusUpdated') {
                      this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('update'), {
                        timeOut: 5000,
                        positionClass: 'toast-bottom-left'
                      });
                      this.ngOnInit();
                    }
                  }
                );
              }
            },
            err => {
              this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
                timeOut: 5000,
                positionClass: 'toast-bottom-left'
              });
            }
          );
        } else
          this.selectDay = true;
      } else {
        this.invalidExactAdress = true;
        this.exactAdressInformation = this.translate.instant('exactAdressInvalid');
      }
    } else {
      this.invalidExactAdress = true;
      this.exactAdressInformation = this.translate.instant('exactAdressInvalid');
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
    this.onUpload(this.doctorGet.doctorId + "doctorProfilePic");
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
      if (imageName == this.doctorGet.doctorId + "doctorProfilePic") {
        this.doctorService.getDoctorPofilePhoto(imageName).subscribe(
          res => {
            if (res != null) {
              this.retrieveResonse = res;
              this.base64Data = this.retrieveResonse.picByte;
              this.retrievedImage = 'data:image/jpeg;base64,' + this.base64Data;
            } else
              this.retrieveResonse = null;
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
      } else if (imageName == this.doctorGet.doctorId + "doctorCinPic")
        this.cinPic = true;
      else if (imageName == this.doctorGet.doctorId + "doctorMedicalClinicPic")
        this.medicalClinicPic = true;
      else if (imageName == this.doctorGet.doctorId + "doctorMedicalSpecialty")
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
    this.onUpload(this.doctorGet.doctorId + "doctorCinPic");
  }
  public onFileChangedMedicalClinic(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.doctorGet.doctorId + "doctorMedicalClinicPic");
  }
  public onFileChangedMedicalSpecialty(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.doctorGet.doctorId + "doctorMedicalSpecialty");
  }
  submitDoctorDocuments() {
    this.testSpeciality = true;
    for (let spec of this.specialityGet) {
      if (this.translate.instant(spec.specialityCode).toLowerCase() == this.specialityName.toLowerCase() && this.specialityName != null) {
        this.testSpeciality = false;
        this.specialityCode = spec.specialityCode;
        break;
      }
    }
    if (this.testSpeciality) {
      this.invalidSpecialityVariable = true;
      this.specialityInformation = this.translate.instant('invalidSpeciality');
    } else {
      this.invalidSpecialityVariable = false;
      this.specialityInformation = this.translate.instant('speciality');
      this.twoStringsPost = new TwoStringsPost(localStorage.getItem('secureLogin'), 'pending');
      this.doctorService.changeDoctorStatusBySecureId(this.twoStringsPost).subscribe(
        res => {
          if (res == 'doctorStatusUpdated') {
            this.integerAndStringPost = new IntegerAndStringPost(this.doctorGet.doctorId, this.specialityCode)
            this.doctorService.addspecialityTodoctor(this.integerAndStringPost).subscribe(
              res => {
                if (res == 'specialityAdded') {
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
        },
        err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    }
  }
  checkDocDocument(imageName: string) {
    this.oneStringPost = new OneStringPost(imageName);
    this.doctorService.checkIfDocumentExist(this.oneStringPost).subscribe(
      res => {
        if (res == true) {
          if (imageName == this.doctorGet.doctorId + "doctorCinPic")
            this.cinPic = true;
          else if (imageName == this.doctorGet.doctorId + "doctorMedicalClinicPic")
            this.medicalClinicPic = true;
          else if (imageName == this.doctorGet.doctorId + "doctorMedicalSpecialty")
            this.medicalSpecialtyPic = true;
        }
      }
    );
  }
  toNotApprovedSection() {
    document.getElementById("notApprovedSection").scrollIntoView({ behavior: "smooth" });
  }
  toapprovedByAdminSection() {
    document.getElementById("approvedByAdminSection").scrollIntoView({ behavior: "smooth" });
  }
  initializeAccountSettings() {
    this.maxPatientPerDayInformation = this.translate.instant('maxPatientPerDay');
    this.startTimeInformation = this.translate.instant('startTime');
    this.exactAdressInformation = this.translate.instant('exactAdress');
    this.specialityInformation = this.translate.instant('speciality');
  }
  ckeckForm() {
    if (parseInt(this.maxPatientPerDay) > 0 && parseInt(this.maxPatientPerDay) < 100 && this.maxPatientPerDay.length != 0) {
      this.invalidMaxPatientPerDay = false;
    } else {
      this.invalidMaxPatientPerDay = true;
      this.maxPatientPerDayInformation = this.translate.instant('maxPatientPerDayInvalid');
    }
    if (this.startTime == null) {
      this.invalidStartTime = true;
      this.startTimeInformation = this.translate.instant('startTimeInvalid');
    } else {
      if (this.startTime.charAt(1) == ':') {
        if (parseInt(this.startTime.slice(0, 1)) >= 7 && parseInt(this.startTime.slice(0, 1)) < 10 && parseInt(this.startTime.slice(2, 4)) >= 0 && parseInt(this.startTime.slice(2, 4)) < 60) {
          this.invalidStartTime = false;
        } else {
          this.invalidStartTime = true;
          this.startTimeInformation = this.translate.instant('startTimeInvalid');
        }
      } else if (this.startTime.charAt(2) == ':') {
        if (parseInt(this.startTime.slice(0, 2)) >= 10 && parseInt(this.startTime.slice(0, 2)) < 13 && parseInt(this.startTime.slice(3, 5)) >= 0 && parseInt(this.startTime.slice(3, 5)) < 60) {
          this.invalidStartTime = false;
        } else {
          this.invalidStartTime = true;
          this.startTimeInformation = this.translate.instant('startTimeInvalid');
        }
      } else {
        this.invalidStartTime = true;
        this.startTimeInformation = this.translate.instant('startTimeInvalid');
      }
    }
    if (this.invalidStartTime == false && this.invalidMaxPatientPerDay == false && this.exactAdress != null) {
      if (this.exactAdress.length >= 10) {
        if (this.Mon == true || this.Tue == true || this.Wed == true || this.Thu == true || this.Fri == true || this.Sat == true || this.Sun == true) {
          this.selectDay = false;
          let workDays: string = '';
          if (this.Mon == true)
            workDays = workDays + 'Mon ';
          if (this.Tue == true)
            workDays = workDays + 'Tue ';
          if (this.Wed == true)
            workDays = workDays + 'Wed ';
          if (this.Thu == true)
            workDays = workDays + 'Thu ';
          if (this.Fri == true)
            workDays = workDays + 'Fri ';
          if (this.Sat == true)
            workDays = workDays + 'Sat ';
          if (this.Sun == true)
            workDays = workDays + 'Sun ';
          this.fiveStringsPost = new FiveStringsPost(localStorage.getItem('secureLogin'), this.maxPatientPerDay, this.startTime, this.exactAdress, workDays);
          this.doctorService.updateDoctorSettingsBySecurelogin(this.fiveStringsPost).subscribe(
            res => {
              if (res == 'updated') {
                this.twoStringsPost = new TwoStringsPost(localStorage.getItem('secureLogin'), 'approved');
                this.doctorService.changeDoctorStatusBySecureId(this.twoStringsPost).subscribe(
                  res => {
                    if (res == 'doctorStatusUpdated') {
                      this.toastr.success(this.translate.instant('approvedText'), this.translate.instant('approved'), {
                        timeOut: 5000,
                        positionClass: 'toast-bottom-left'
                      });
                      this.ngOnInit();
                    }
                  }
                );
              }
            },
            err => {
              this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
                timeOut: 5000,
                positionClass: 'toast-bottom-left'
              });
            }
          );
        } else
          this.selectDay = true;
      } else {
        this.invalidExactAdress = true;
        this.exactAdressInformation = this.translate.instant('exactAdressInvalid');
      }
    } else {
      this.invalidExactAdress = true;
      this.exactAdressInformation = this.translate.instant('exactAdressInvalid');
    }
  }
  initializeEditAccountSettigns() {
    this.startTime = this.doctorGet.startTime;
    this.exactAdress = this.doctorGet.exactAdress;
    this.maxPatientPerDay = this.doctorGet.maxPatientPerDay;
    if (this.doctorGet.workDays != null) {
      if (this.doctorGet.workDays.indexOf('Mon') != -1)
        this.Mon = true;
      if (this.doctorGet.workDays.indexOf('Tue') != -1)
        this.Tue = true;
      if (this.doctorGet.workDays.indexOf('Wed') != -1)
        this.Wed = true;
      if (this.doctorGet.workDays.indexOf('Thu') != -1)
        this.Thu = true;
      if (this.doctorGet.workDays.indexOf('Fri') != -1)
        this.Fri = true;
      if (this.doctorGet.workDays.indexOf('Sat') != -1)
        this.Sat = true;
      if (this.doctorGet.workDays.indexOf('Sun') != -1)
        this.Sun = true;
    }
  }
  compareMaxPateintPerDay() {
    if (this.doctorGet.maxPatientPerDay != this.maxPatientPerDay)
      this.disabledUpdateBtn = false;
    else
      this.disabledUpdateBtn = true;
  }
  compareStartTime() {
    if (this.doctorGet.startTime != this.startTime)
      this.disabledUpdateBtn = false;
    else
      this.disabledUpdateBtn = true;
  }
  compareExactAdress() {
    if (this.doctorGet.exactAdress != this.exactAdress)
      this.disabledUpdateBtn = false;
    else
      this.disabledUpdateBtn = true;
  }
  compareMon() {
    if (this.Mon == true) {
      if (this.doctorGet.workDays.indexOf('Mon') == -1)
        this.disabledUpdateBtn = false;
      else
        this.disabledUpdateBtn = true;
    } else {
      if (this.doctorGet.workDays.indexOf('Mon') == -1)
        this.disabledUpdateBtn = true;
      else
        this.disabledUpdateBtn = false;
    }
  }
  compareTue() {
    if (this.Tue == true) {
      if (this.doctorGet.workDays.indexOf('Tue') == -1)
        this.disabledUpdateBtn = false;
      else
        this.disabledUpdateBtn = true;
    } else {
      if (this.doctorGet.workDays.indexOf('Tue') == -1)
        this.disabledUpdateBtn = true;
      else
        this.disabledUpdateBtn = false;
    }
  }
  compareWed() {
    if (this.Wed == true) {
      if (this.doctorGet.workDays.indexOf('Wed') == -1)
        this.disabledUpdateBtn = false;
      else
        this.disabledUpdateBtn = true;
    } else {
      if (this.doctorGet.workDays.indexOf('Wed') == -1)
        this.disabledUpdateBtn = true;
      else
        this.disabledUpdateBtn = false;
    }
  }
  compareThu() {
    if (this.Thu == true) {
      if (this.doctorGet.workDays.indexOf('Thu') == -1)
        this.disabledUpdateBtn = false;
      else
        this.disabledUpdateBtn = true;
    } else {
      if (this.doctorGet.workDays.indexOf('Thu') == -1)
        this.disabledUpdateBtn = true;
      else
        this.disabledUpdateBtn = false;
    }
  }
  compareFri() {
    if (this.Fri == true) {
      if (this.doctorGet.workDays.indexOf('Fri') == -1)
        this.disabledUpdateBtn = false;
      else
        this.disabledUpdateBtn = true;
    } else {
      if (this.doctorGet.workDays.indexOf('Fri') == -1)
        this.disabledUpdateBtn = true;
      else
        this.disabledUpdateBtn = false;
    }
  }
  compareSat() {
    if (this.Mon == true) {
      if (this.doctorGet.workDays.indexOf('Sat') == -1)
        this.disabledUpdateBtn = false;
      else
        this.disabledUpdateBtn = true;
    } else {
      if (this.doctorGet.workDays.indexOf('Sat') == -1)
        this.disabledUpdateBtn = true;
      else
        this.disabledUpdateBtn = false;
    }
  }
  compareSun() {
    if (this.Sun == true) {
      if (this.doctorGet.workDays.indexOf('Sun') == -1)
        this.disabledUpdateBtn = false;
      else
        this.disabledUpdateBtn = true;
    } else {
      if (this.doctorGet.workDays.indexOf('Sun') == -1)
        this.disabledUpdateBtn = true;
      else
        this.disabledUpdateBtn = false;
    }
  }
  toreVerifySection() {
    document.getElementById("reVerifySection").scrollIntoView({ behavior: "smooth" });
  }
  reVerifyDoctorDocuments() {
    this.twoStringsPost = new TwoStringsPost(localStorage.getItem('secureLogin'), 'reVerify');
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
  deleteAccount() {
    this.doctorService.deteleDoctorById(this.doctorGet.doctorId).subscribe(
      res => {
        if (res == 1) {
          this.toastr.warning(this.translate.instant('accountDeleted'), this.translate.instant('delete'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
        }
      }
    );
  }
  getAllSpecialities() {
    this.specialityService.getSpecialities().subscribe(
      res => {
        this.specialityGet = res;
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
  getAppPatientInfo() {
    let today = new Date();
    let tomorrow = formatDate(new Date(today.setDate(today.getDate() + 1)), 'yyyy/MM/dd', 'en');
    for (let app of this.doctorGet.appointment) {
      if (app.appointmentDate == this.currentDate) {
        this.patientService.getAppPatientInfoById(app.patientId).subscribe(
          res => {
            if (res) {
              this.toadyAppointmentPatientInfo[app.patientTurn - 1] = res;
              this.getPatientTodayProfileImage(app.patientId, app.patientTurn);
              if (this.toadyAppointmentPatientInfo.length <= 6 && !this.lengthTested) {
                this.showpatientNavigationRight = false;
                this.showpatientNavigationLeft = false;
              } else if (this.toadyAppointmentPatientInfo.length > 6 && !this.lengthTested) {
                this.showpatientNavigationRight = true;
                this.showpatientNavigationLeft = false;
                this.lengthTested = true;
              }
            }
          }
        );
      } else if (app.appointmentDate == tomorrow) {
        this.patientService.getAppPatientInfoById(app.patientId).subscribe(
          res => {
            if (res) {
              this.tomorrowAppointmentPatientInfo[app.patientTurn - 1]=res;
              this.getPatientTomorrowProfileImage(app.patientId, app.patientTurn);
              if (this.tomorrowAppointmentPatientInfo.length <= 6 && !this.tommorowLengthTested) {
                this.showTomorrowpatientNavigationRight = false;
                this.showTomorrowpatientNavigationLeft = false;
              } else if (this.tomorrowAppointmentPatientInfo.length > 6 && !this.tommorowLengthTested) {
                this.showTomorrowpatientNavigationRight = true;
                this.showTomorrowpatientNavigationLeft = false;
                this.tommorowLengthTested = true;
              }
            }
          }
        );
      } else if (app.appointmentStatus == 'completed') {
        this.patientService.getAppPatientInfoById(app.patientId).subscribe(
          res => {
            if (res) {
              this.completedAppointmentPatientInfo.push(res);
            }
          }
        );
      } else {
        this.patientService.getAppPatientInfoById(app.patientId).subscribe(
          res => {
            if (res) {
              this.nextAppointmentPatientInfo.push(res);
            }
          }
        );
      }
    }
  }
  getPatientTodayProfileImage(id: number, turn: number) {
    let retrieveResonse: any;
    let base64Data: any;
    let retrievedImage: any;
    this.doctorService.getDoctorPofilePhoto(id + 'patientProfilePic').subscribe(
      res => {
        if (res != null) {
          retrieveResonse = res;
          this.patientTodayProfilePicRes[turn - 1] = retrieveResonse;
          base64Data = retrieveResonse.picByte;
          retrievedImage = 'data:image/jpeg;base64,' + base64Data;
          this.patientTodayProfilePic[turn - 1] = retrievedImage;
        } else {
          this.patientTodayProfilePicRes[turn - 1] = null;
          this.patientTodayProfilePic[turn - 1] = null;
        }
      }
    );
  }
  getPatientTomorrowProfileImage(id: number, turn: number) {
    let retrieveResonse: any;
    let base64Data: any;
    let retrievedImage: any;
    this.doctorService.getDoctorPofilePhoto(id + 'patientProfilePic').subscribe(
      res => {
        if (res != null) {
          retrieveResonse = res;
          this.patientTomorrowProfilePicRes[turn - 1] = retrieveResonse;
          base64Data = retrieveResonse.picByte;
          retrievedImage = 'data:image/jpeg;base64,' + base64Data;
          this.patientTomorrowProfilePic[turn - 1] = retrievedImage;
        } else {
          this.patientTomorrowProfilePicRes[turn - 1] = null;
          this.patientTomorrowProfilePic[turn - 1] = null;
        }
      }
    );
  }
  patientNavigationRightClick() {
    if (this.toadyAppointmentPatientInfo.length >= (this.patientFinish + 3)) {
      this.patientStart += 3;
      this.patientFinish += 3;
      this.showpatientNavigationLeft = true;
      this.showpatientNavigationRight = true;
    } else {
      this.patientStart += (this.toadyAppointmentPatientInfo.length % 3);
      this.patientFinish += (this.toadyAppointmentPatientInfo.length % 3);
      this.showpatientNavigationRight = false;
      this.showpatientNavigationLeft = true;
    }
  }
  patientNavigationLeftClick() {
    if (this.toadyAppointmentPatientInfo.length >= (this.patientFinish + 3)) {
      this.patientStart -= 3;
      this.patientFinish -= 3;
      this.showpatientNavigationLeft = true;
      this.showpatientNavigationRight = true;
    } else {
      this.patientStart -= (this.toadyAppointmentPatientInfo.length % 3);
      this.patientFinish -= (this.toadyAppointmentPatientInfo.length % 3);
      this.showpatientNavigationRight = true;
      this.showpatientNavigationLeft = false;
    }
  }
  patientTomorrowNavigationRightClick() {
    if (this.tomorrowAppointmentPatientInfo.length >= (this.patientTomorrowFinish + 3)) {
      this.patientTomorrowStart += 3;
      this.patientTomorrowFinish += 3;
      this.showTomorrowpatientNavigationLeft = true;
      this.showTomorrowpatientNavigationRight = true;
    } else {
      this.patientTomorrowStart += (this.tomorrowAppointmentPatientInfo.length % 3);
      this.patientTomorrowFinish += (this.tomorrowAppointmentPatientInfo.length % 3);
      this.showTomorrowpatientNavigationRight = false;
      this.showTomorrowpatientNavigationLeft = true;
    }
  }
  patientTomorrowNavigationLeftClick() {
    if (this.tomorrowAppointmentPatientInfo.length >= (this.patientTomorrowFinish + 3)) {
      this.patientTomorrowStart -= 3;
      this.patientTomorrowFinish -= 3;
      this.showTomorrowpatientNavigationLeft = true;
      this.showTomorrowpatientNavigationRight = true;
    } else {
      this.patientTomorrowStart -= (this.tomorrowAppointmentPatientInfo.length % 3);
      this.patientTomorrowFinish -= (this.tomorrowAppointmentPatientInfo.length % 3);
      this.showTomorrowpatientNavigationRight = true;
      this.showTomorrowpatientNavigationLeft = false;
    }
  }
  showFullPatientInfo(medicalProfileId: number, patientKey: number) {
    this.patientKey = patientKey;
    if (this.todayPatientMedicalProfileGet[patientKey] == null) {
      this.medicalProfileService.getMedicalProfileByPatientId(medicalProfileId).subscribe(
        res => {
          if (res) {
            this.todayPatientMedicalProfileGet[patientKey] = res;
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
    this.patientInfo = true;
  }
  icreasePatientTurn(key:string):string{
    return parseInt(key)+1+'';
  }
  showFullPatientTomorrowInfo(medicalProfileId: number, patientKey: number){
    this.tomorrowPatientKey = patientKey;
    if (this.tomorrowPatientMedicalProfileGet[patientKey] == null) {
      this.medicalProfileService.getMedicalProfileByPatientId(medicalProfileId).subscribe(
        res => {
          if (res) {
            this.tomorrowPatientMedicalProfileGet[patientKey] = res;
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
    this.tomorrowPatientInfo = true;
  }
}
