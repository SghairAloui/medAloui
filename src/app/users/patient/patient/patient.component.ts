import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppointmentService } from 'src/app/appointment/appointment.service';
import { UserService } from 'src/app/services/user.service';
import { AppointmentDocInfoGet } from 'src/model/AppointmentDocInfoGet';
import { AppointmentGet } from 'src/model/AppointmentGet';
import { DoctorInfoForPatient } from 'src/model/DoctorInfoForPatient';
import { IntegerAndStringPost } from 'src/model/IntegerAndStringPost';
import { medicalProfileGet } from 'src/model/medicalProfileGet';
import { PatientGet } from 'src/model/PatientGet';
import { PatientPostWithSecureLogin } from 'src/model/PatientPostWithSecureLogin';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { StringAndTwoDoublePost } from 'src/model/stringAndTwoDoublePost';
import { TwoStringsPost } from 'src/model/TwoStringsPost';
import { UpdateMedicalProfilePost } from 'src/model/UpdateMedicalProfilePost';
import { UpdatePasswordPost } from 'src/model/UpdatePasswordPost';
import { DoctorService } from '../../doctor/doctor/doctor.service';
import { PatientService } from './patient.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  slectedDay: boolean = true;
  monthDays: any[] = [];
  monthDaysDis: boolean[] = [];
  daysNameEn: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysName: string[] = [];
  daysNameDouble: string[] = [];
  date: Date = new Date();
  today: number = /*28;*/this.date.getUTCDate();
  todayName: string;
  todayNumber: number;
  utcYear: number = this.date.getUTCFullYear();
  utcMonth: number = this.date.getUTCMonth() + 1;
  lastMonthDay: number;
  integerAndStringPost: IntegerAndStringPost;
  appointmentMonth: number;
  appointmentYear: number;
  appointmentDay: number;
  appointmentDate: string;
  appointmentPage: number = 0;

  constructor(private patientService: PatientService, private translate: TranslateService, private http: HttpClient, private toastr: ToastrService, private router: Router, private doctorService: DoctorService, private appointmentService: AppointmentService, private userService: UserService) { }
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
  doctorProfileImg: any[] = [];
  appointmentDocInfoGet: AppointmentDocInfoGet[] = [];
  docInfoForPatient: DoctorInfoForPatient[] = [];
  patientInfo: boolean;
  showUpdateCalendar: boolean[];
  editeSecureInfo: boolean = false;
  editPassword: boolean;
  twoStringsPost: TwoStringsPost;
  disableChnageUsernameBtn: boolean = true;
  updatePasswordPost: UpdatePasswordPost;
  disableUpdateUsernamePassBtn: boolean = false;
  patientMedicalProfile: medicalProfileGet;
  diseaseNumber: number = 0;
  updateMedicalProfilePost: UpdateMedicalProfilePost;
  cities: string[] = ["Ariana", this.translate.instant('Beja'), "Ben Arous", "Bizerte", this.translate.instant('Gabes'), "Gafsa", "Jendouba", "Kairouan", "Kasserine", this.translate.instant('Kebili'), "Kef", "Mahdia", "Manouba", this.translate.instant('Medenine'), "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];
  appointment: AppointmentGet[] = [];
  deletedApp: boolean[] = [];
  showLoadMoreApp: boolean;
  appointmentLoading: boolean = false;
  docProfileImages: boolean;
  docInfos: boolean;

  ngOnInit(): void {
    this.deletedApp = [false];
    this.showUpdateCalendar = [false];
    this.patientInfo = false;
    this.getUserInfo();
  }

  checkForm() {
    this.checkFirstName();
    this.checkLastName();
    this.checkAdress();
    this.checkBirthday();
    if (!this.invalidAdressVariable && !this.invalidFirstNameVariable && !this.invalidLastNameVariable && !this.invalidDayVariable && !this.invalidMonthVariable && !this.invalidYearVariable) {
      let birthday: string = this.day + '/' + this.month + '/' + this.year;
      let gender: string;
      if (this.maleCheckBox == true)
        gender = 'male';
      else
        gender = 'female';
      this.patientPostWithSecureLogin = new PatientPostWithSecureLogin(this.firstName.toLowerCase(), this.lastName.toLowerCase(), this.adress.toLowerCase(), birthday, gender.toLowerCase(), localStorage.getItem("secureLogin"));
      this.updateDoctorInfo();
    }
  }
  updateDoctorInfo() {
    this.patientService.updatePatientInfoBySecureLogin(this.patientPostWithSecureLogin).subscribe(
      res => {
        this.getUserInfo();
        this.invalidMailVariable = false;
        this.generalInfo = 'show';
        this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('update'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
  getUserInfo() {
    this.secureLoginString = new SecureLoginString(localStorage.getItem("secureLogin"));
    this.patientService.getPatientInfo(this.secureLoginString).subscribe(
      res => {
        if (res) {
          this.patientGet = res;
          this.getPatientMedicalProfile();
          this.getPatientMedicalProfielDiseasesNumber();
          this.patientInfo = true;
          this.intializeEdit();
          localStorage.setItem('id', this.patientGet.userId + '')
          this.getImage();
          this.getAppointments();
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
  updateUsername() {
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
    if (!this.invalidMailVariable) {
      this.twoStringsPost = new TwoStringsPost(localStorage.getItem('secureLogin'), this.mail.toLowerCase())
      this.userService.updateUsernameBySecureLogin(this.twoStringsPost).subscribe(
        async res => {
          if (!res) {
            this.invalidMailVariable = true;
            this.mailInformation = this.translate.instant('mailExist');
          } else {
            this.router.navigate(['/acceuil']);
            this.toastr.success(this.translate.instant('usernameChanged'), this.translate.instant('info'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            localStorage.setItem('secureLogin', '');
            localStorage.setItem('id', '');
            await this.sleep(1000);
            document.getElementById("connexionSection").scrollIntoView({ behavior: "smooth" });
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
  updatePassword() {
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
    if (!this.invalidPasswordVariable && !this.invalidPasswordRepeatVariable) {
      this.updatePasswordPost = new UpdatePasswordPost(localStorage.getItem('secureLogin'), this.passwordRepeat);
      this.userService.updateUserPasswordBySecurelogin(this.updatePasswordPost).subscribe(
        async res => {
          if (!res) {
            this.toastr.warning(this.translate.instant('applicationDataChanged'), this.translate.instant('Data'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            localStorage.setItem('secureLogin', '');
            localStorage.setItem('id', '');
            await this.sleep(1000);
            document.getElementById("connexionSection").scrollIntoView({ behavior: "smooth" });
          } else {
            this.router.navigate(['/acceuil']);
            this.toastr.success(this.translate.instant('passwordChanged'), this.translate.instant('info'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            localStorage.setItem('secureLogin', '');
            localStorage.setItem('id', '');
            await this.sleep(1000);
            document.getElementById("connexionSection").scrollIntoView({ behavior: "smooth" });
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
  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  intializeEdit() {
    this.firstName = this.patientGet.patientFirstName;
    this.lastName = this.patientGet.patientLastName;
    this.mail = this.patientGet.userUsername;
    this.adress = this.patientGet.userCity;
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
    document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
  }
  checkAdress() {
    let upperCaseAdress: string = this.adress.toUpperCase();
    this.adress = this.adress.replace('é', 'e');
    this.adress = this.adress.replace('è', 'e');
    for (let city of this.cities) {
      if (upperCaseAdress == city.toLocaleUpperCase()) {
        this.invalidAdressVariable = false;
        this.adressInformation = this.translate.instant('city');
        break;
      }
      else {
        this.invalidAdressVariable = true;
        this.adressInformation = this.translate.instant('enterValidCity');
      }
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
  changePasswordClick() {
    this.editeSecureInfo = true;
    this.editPassword = true;
    document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
  }
  changeUsernameClick() {
    this.editeSecureInfo = true;
    this.editPassword = false;
    document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
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
    if (this.mail.toLowerCase() === this.patientGet.userUsername)
      this.disableUpdateUsernamePassBtn = true;
    else
      this.disableUpdateUsernamePassBtn = false;
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
    if (this.adress.toLowerCase() === this.patientGet.userCity)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareHeight() {
    if (parseFloat(this.height) == this.patientMedicalProfile.height || this.height == "")
      this.disableSaveMedicalProfileBtn = true;
    else
      this.disableSaveMedicalProfileBtn = false;
    this.height = this.height.replace(',', '.');

  }
  compareWeight() {
    if (parseFloat(this.weight) == this.patientMedicalProfile.weight || this.weight == "")
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
    this.updateMedicalProfilePost = new UpdateMedicalProfilePost(this.patientGet.medicalProfileId, parseFloat(this.height), parseFloat(this.weight));
    this.patientService.updateMedicalProfileByMedicalProfileId(this.updateMedicalProfilePost).subscribe(
      res => {
        if (res) {
          this.medicalProfile = 'showData';
          this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('update'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.getUserInfo();
          this.medicalProfileInfo = 'showData';
        }
      }
    );
  }
  initilizeMedicalProfile() {
    // this.height = this.patientGet.medicalProfile.height.toString();
    // this.weight = this.patientGet.medicalProfile.weight.toString();
  }
  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload();
    this.getImage();
  }
  onUpload() {
    if (this.patientGet.userId == parseInt(localStorage.getItem('id'))) {
      const uploadImageData = new FormData();
      uploadImageData.append('imageFile', this.selectedFile, this.patientGet.userId + "patientProfilePic");
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
    if (this.patientGet.userId == parseInt(localStorage.getItem('id'))) {
      this.patientService.getPatientPofilePhoto().subscribe(
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
    } else {
      this.toastr.info(this.translate.instant('applicationDataChanged'), this.translate.instant('Data'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    }
  }
  getDocProfileImg(id: number, index: number, appLength) {
    let retrieveResonse: any;
    let base64Data: any;
    let retrievedImage: any;
    this.patientService.getDoctorPofilePhoto(id + 'doctorProfilePic').subscribe(
      res => {
        if (res != null) {
          retrieveResonse = res;
          base64Data = retrieveResonse.picByte;
          retrievedImage = 'data:image/jpeg;base64,' + base64Data;
          this.doctorProfileImg[index] = retrievedImage;
          if (appLength == ((index % 4) + 1)) {
            this.docProfileImages = true;
            if (this.docInfos && this.docProfileImages) {
              this.appointmentLoading = false;
            }
          }
        } else {
          this.doctorProfileImg[index] = false;
          this.docProfileImages = true;
        }
      }
    );

  }
  getDoctorAppointmentInfoForPatientByDoctorId(id: number, index: number, appLength) {
    this.doctorService.getDoctorAppointmentInfoForPatientByDoctorId(id).subscribe(
      res => {
        if (res) {
          this.docInfoForPatient[index] = res;
          if (appLength == ((index % 4) + 1)) {
            this.docInfos = true;
            if (this.docInfos && this.docProfileImages) {
              this.appointmentLoading = false;
            }
          }
        } else
          this.docInfos = true;
      }
    );

  }
  deleteAppById(id: number, key: number) {
    this.appointmentService.deleteAppointmentById(id).subscribe(
      res => {
        if (res) {
          this.toastr.success(this.translate.instant('appointmentDeleted'), this.translate.instant('appointment'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.deletedApp[key] = true;
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
  changeAppDate(docId: number, appDate: string, key: number) {
    this.generateMonthDay(docId, appDate, key);
    this.showUpdateCalendar[key] = true;
    document.getElementById("calendarGridSection").scrollIntoView({ behavior: "smooth" });
  }
  getMonthLastDay() {
    if (this.utcMonth == 1)
      this.lastMonthDay = 31;
    else if (this.utcMonth == 2) {
      if ((this.utcYear % 4) == 0)
        this.lastMonthDay = 29;
      else
        this.lastMonthDay = 28;
    } else if (this.utcMonth == 3)
      this.lastMonthDay = 31;
    else if (this.utcMonth == 4)
      this.lastMonthDay = 30;
    else if (this.utcMonth == 5)
      this.lastMonthDay = 31;
    else if (this.utcMonth == 6)
      this.lastMonthDay = 30;
    else if (this.utcMonth == 7)
      this.lastMonthDay = 31;
    else if (this.utcMonth == 8)
      this.lastMonthDay = 31;
    else if (this.utcMonth == 9)
      this.lastMonthDay = 30;
    else if (this.utcMonth == 10)
      this.lastMonthDay = 31;
    else if (this.utcMonth == 11)
      this.lastMonthDay = 30;
    else if (this.utcMonth == 12)
      this.lastMonthDay = 31;
  }
  generateMonthDay(docId: number, appDate: string, key: number) {
    this.daysName = [this.translate.instant('sun'), this.translate.instant('mon'), this.translate.instant('tue'), this.translate.instant('wed'), this.translate.instant('thu'), this.translate.instant('fri'), this.translate.instant('sat')];
    this.daysNameDouble = [this.translate.instant('sun'), this.translate.instant('mon'), this.translate.instant('tue'), this.translate.instant('wed'), this.translate.instant('thu'), this.translate.instant('fri'), this.translate.instant('sat'), this.translate.instant('sun'), this.translate.instant('mon'), this.translate.instant('tue'), this.translate.instant('wed'), this.translate.instant('thu'), this.translate.instant('fri'), this.translate.instant('sat'), this.translate.instant('sat')];
    this.getMonthLastDay();
    let day: number = 0;
    let todayNumber: number;
    this.todayName = /*'Sun';*/this.date.toString().slice(0, 3);
    let checkAppointmentMonth: number;
    let checkAppointmentYear: number;
    let appointmentDate: string;
    let integerAndStringPost: IntegerAndStringPost;
    let j1: number;
    let workDays: string;
    for (let c = 0; c < 7; c++) {
      if (this.daysNameEn[c] == this.todayName) {
        todayNumber = c;
        this.todayNumber = c;
      }
    }
    for (let c = 1; c <= 7; c++) {
      this.monthDays[day] = this.daysNameDouble[todayNumber];
      todayNumber++;
      day++;
    }
    for (var i = this.today; i <= this.lastMonthDay; i++) {
      this.monthDays[day] = i;
      if (this.appointmentDocInfoGet[key])
        workDays = this.appointmentDocInfoGet[key].workDays;
      else if (this.docInfoForPatient[key])
        workDays = this.docInfoForPatient[key].workDays;
      if (workDays.indexOf(this.daysNameEn[(this.todayNumber + i + (7 - this.todayNumber)) % 7]) == -1)
        this.monthDaysDis[i] = true;
      else {
        if (i == this.today)
          this.monthDaysDis[this.today] = true;
        else {
          checkAppointmentMonth = this.utcMonth;
          checkAppointmentYear = this.utcYear;
          if (checkAppointmentMonth <= 9)
            appointmentDate = checkAppointmentYear + '/0' + checkAppointmentMonth + '/' + i;
          else
            appointmentDate = checkAppointmentYear + '/' + checkAppointmentMonth + '/' + i;
          integerAndStringPost = new IntegerAndStringPost(docId, appointmentDate);
          this.checkIfDayAppFull(i, integerAndStringPost, docId, appDate, key);
        }
      }
      day++;
    }
    for (var j = 0; j <= (this.today - this.lastMonthDay) + 26; j++) {
      this.monthDays[day + j] = j + 1;
      j1 = j + 1;
      if (workDays.indexOf(this.daysNameEn[(this.todayNumber + day + j) % 7]) == -1)
        this.monthDaysDis[j1] = true;
      else {
        checkAppointmentMonth = this.utcMonth + 1;
        checkAppointmentYear = this.utcYear;
        if (checkAppointmentMonth <= 9)
          appointmentDate = checkAppointmentYear + '/0' + checkAppointmentMonth + '/' + j1;
        else {
          if (checkAppointmentMonth == 13) {
            checkAppointmentMonth = 1;
            checkAppointmentYear = checkAppointmentYear + 1;
          }
          appointmentDate = checkAppointmentYear + '/' + checkAppointmentMonth + '/' + j1;
        }
        integerAndStringPost = new IntegerAndStringPost(docId, appointmentDate);
        this.checkIfDayAppFull(j1, integerAndStringPost, docId, appDate, key);
      }
    }
  }
  checkIfDayAppFull(i: number, integerAndStringPost: IntegerAndStringPost, docId: number, appDate: string, key: number) {
    let maxPatientPerDay: number;
    if (this.appointmentDocInfoGet[key])
      maxPatientPerDay = this.appointmentDocInfoGet[key].maxPatientPerDay;
    else if (this.docInfoForPatient[key])
      maxPatientPerDay = this.docInfoForPatient[key].maxPatientPerDay;
    if (i == parseInt(appDate.slice(8, 10)))
      this.monthDaysDis[i] = true;
    else {
      this.appointmentService.appointmentsCountByDoctorIdAndDate(integerAndStringPost).subscribe(
        res => {
          if (res >= maxPatientPerDay)
            this.monthDaysDis[i] = true;
          else
            this.monthDaysDis[i] = false;
        }
      );
    }
  }
  daySelected(day: number) {
    this.appointmentDay = day;
    if (day > 0 && day <= 31) {
      this.slectedDay = false;
      if (day >= this.today) {
        this.appointmentMonth = this.utcMonth;
        this.appointmentYear = this.utcYear;
      } else {
        if (this.utcMonth + 1 == 13) {
          this.appointmentMonth = 1;
          this.appointmentYear = this.utcYear + 1;
        } else {
          this.appointmentMonth = this.utcMonth + 1;
          this.appointmentYear = this.utcYear;
        }
      }
    }
    else
      this.slectedDay = true;
  }
  updateAppById(appId: number, key: number) {
    if (this.slectedDay == false) {
      if (this.appointmentMonth <= 9) {
        if (this.appointmentDay <= 9)
          this.appointmentDate = this.appointmentYear + '/0' + this.appointmentMonth + '/0' + this.appointmentDay;
        else
          this.appointmentDate = this.appointmentYear + '/0' + this.appointmentMonth + '/' + this.appointmentDay;
      } else {
        if (this.appointmentDay <= 9)
          this.appointmentDate = this.appointmentYear + '/' + this.appointmentMonth + '/0' + this.appointmentDay;
        else
          this.appointmentDate = this.appointmentYear + '/' + this.appointmentMonth + '/' + this.appointmentDay;
      }
      this.integerAndStringPost = new IntegerAndStringPost(appId, this.appointmentDate);
      this.appointmentService.updateAppointmentDateById(this.integerAndStringPost).subscribe(
        res => {
          if (res) {
            this.toastr.success(this.translate.instant('appontmentDateUpdated'), this.translate.instant('appointment'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.showUpdateCalendar[key] = false;
            document.getElementById(key.toString()).scrollIntoView({ behavior: "smooth" });
            this.slectedDay = true;
            this.appointment[key].appointmentDate = this.appointmentDate;
          }
        },
        err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    } else {
      this.toastr.warning(this.translate.instant('selectDayFirst'), this.translate.instant('appointment'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    }
  }
  getPatientMedicalProfile() {
    this.patientService.getPatientMedicalProfileByMedicalProfileId(this.patientGet.medicalProfileId).subscribe(
      res => {
        this.patientMedicalProfile = res;
      }
    );
  }
  getPatientMedicalProfielDiseasesNumber() {
    this.patientService.getPatientMedicalProfileDeseasesNumberByMedicalProfileId(this.patientGet.medicalProfileId).subscribe(
      res => {
        this.diseaseNumber = res;
      }
    );
  }
  getAppointments() {
    this.docProfileImages = false;
    this.docInfos = false;
    this.appointmentLoading = true;
    let appointment: AppointmentGet[] = [];
    this.appointmentService.getPatientAppointmentByPatientId(this.patientGet.userId, this.appointmentPage, 4).subscribe(
      res => {
        appointment = res;
        for (let app of appointment) {
          this.deletedApp[this.appointment.length] = false;
          this.getDocProfileImg(app.doctorId, this.appointment.length, appointment.length);
          this.getDoctorAppointmentInfoForPatientByDoctorId(app.doctorId, this.appointment.length, appointment.length);
          this.appointment.push(app);
        }
        if (appointment.length == 4)
          this.showLoadMoreApp = true;
        else
          this.showLoadMoreApp = false;
        this.appointmentPage += 1;
      },
      err => {
        this.appointmentLoading = false;
      }
    );
  }
  getApproximationTime(startTime: string, approxTime: number, patientTurn: number): string {
    let time: number = approxTime * (patientTurn - 1);
    let startHour: number = 0; let endHour: number = 1;
    let docStartHour: number; let docStartMunite: number;
    if (startTime.length == 4) {
      docStartHour = parseInt(startTime.slice(0, 1));
      docStartMunite = parseInt(startTime.slice(2, 4));
    }
    else {
      docStartHour = parseInt(startTime.slice(0, 2));
      docStartMunite = parseInt(startTime.slice(3, 5));
    }

    time += docStartMunite;
    if (time >= 60) {
      while (time >= 60) {
        time = time % 60;
        startHour += 1;
        endHour += 1;
      }
      time -= 30;
      if (((60 + time) % 60) <= 9)
        return (docStartHour + startHour) + 'h:0' + ((60 + time) % 60) + 'mn - ' + (docStartHour + endHour) + 'h:0' + ((60 + time) % 60) + 'mn';
      else
        return (docStartHour + startHour) + 'h:' + ((60 + time) % 60) + 'mn - ' + (docStartHour + endHour) + 'h:' + ((60 + time) % 60) + 'mn';
    } else {
      if ((docStartMunite + (approxTime * patientTurn)+15) >= 60)
        endHour += 1;
      else
        endHour = 0;
      if (docStartMunite <= 9)
        return docStartHour + 'h:' + docStartMunite + 'mn - ' + (docStartHour + endHour) + 'h:0' + ((docStartMunite + (approxTime * patientTurn)+15)%60) + 'mn';
      else
        return docStartHour + 'h:' + docStartMunite + 'mn - ' + (docStartHour + endHour) + 'h:' + ((docStartMunite + (approxTime * patientTurn)+15)%60) + 'mn';
    }
  }
}
