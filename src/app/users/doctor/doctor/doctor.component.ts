import { formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppointmentService } from 'src/app/appointment/appointment.service';
import { HeaderService } from 'src/app/Headers/header/header.service';
import { ConversationService } from 'src/app/services/conversation.service';
import { MedicamentService } from 'src/app/services/medicament.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PrescriptionService } from 'src/app/services/prescription.service';
import { UserService } from 'src/app/services/user.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { SpecialityService } from 'src/app/speciality/speciality.service';
import { AppointmentGet } from 'src/model/AppointmentGet';
import { AppointmentPatientInfo } from 'src/model/AppointmentPatientInfo';
import { Conversation } from 'src/model/Conversation';
import { ConversationGet } from 'src/model/ConversationGet';
import { dignoses } from 'src/model/dignoses';
import { doctor } from 'src/model/Doctor';
import { DoctorGet } from 'src/model/Doctorget';
import { DoctorPostWithSecureLogin } from 'src/model/DoctorPostWithSecureLogin';
import { DoctorSettingsPost } from 'src/model/DoctorSettingsPost';
import { FiveStringsPost } from 'src/model/FiveStringsPost';
import { IdAndBoolean } from 'src/model/IdAndBoolean';
import { IntegerAndStringPost } from 'src/model/IntegerAndStringPost';
import { medicalProfileDiseaseGet } from 'src/model/medicalProfileDiseaseGet';
import { medicalProfileGet } from 'src/model/medicalProfileGet';
import { MessageGet } from 'src/model/MessageGet';
import { NotificationGet } from 'src/model/NotificationGet';
import { OneStringPost } from 'src/model/OneStringPost';
import { OpenConversation } from 'src/model/OpenConversation';
import { prescriptionGet } from 'src/model/prescriptionGet';
import { PrescriptionMedicament } from 'src/model/PrescriptionMedicament';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { SpecialityGet } from 'src/model/SpecialityGet';
import { StringGet } from 'src/model/StringGet';
import { TwoStringsPost } from 'src/model/TwoStringsPost';
import { UpdatePasswordPost } from 'src/model/UpdatePasswordPost';
import { PatientService } from '../../patient/patient/patient.service';
import { DoctorService } from './doctor.service';

declare const L: any;

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
  disableSavePassBtn: boolean = true;
  specialityInformation: string; speciality: string; specialityGet: SpecialityGet[] = [];
  invalidSpecialityVariable: boolean;
  maleCheckBox: boolean; femaleCheckBox: boolean;
  doctorPostWithSecureLogin: DoctorPostWithSecureLogin;
  secureLogin: SecureLoginString = new SecureLoginString(localStorage.getItem('secureLogin'));
  Mon: boolean; Tue: boolean; Wed: boolean; Thu: boolean; Fri: boolean; Sat: boolean; Sun: boolean; selectDay: boolean = false;

  constructor(private doctorService: DoctorService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private router: Router,
    private specialityService: SpecialityService,
    private patientService: PatientService,
    private userService: UserService,
    private appointmentService: AppointmentService,
    private medicamentService: MedicamentService,
    private prescriptionService: PrescriptionService,
    private headerService: HeaderService,
    private notificationService: NotificationService,
    private conversationService: ConversationService,
    private webSocketService: WebSocketService) {
    // Open connection with server socket
    let stompClient = this.webSocketService.connect();
    stompClient.connect({}, frame => {

      // Subscribe to notification topic
      stompClient.subscribe('/topic/message/' + this.doctorGet.userId, async message => {
        let not = JSON.parse(message.body);
        if (not > 0) {
          if (this.openConversation.conversationId == not)
            this.openConversation.isUnread = false;
          let data: IdAndBoolean = { id: not, boolean: false, lastMessageSenderId: 0 };
          this.headerService.setReadConversation(data);
          this.scrollToBottomMessages();
        } else {
          let msg: MessageGet = not;
          if (this.openConversation.conversationId == msg.conversationId) {
            this.openConversation.isUnread = true;
            this.openConversation.lastMessageSenderId = msg.senderId;
            this.openConversation.messages.push(msg);
            await this.sleep(1);
            this.scrollToBottomMessages();
            this.messageSound();
            this.headerService.newMessage(msg);
            this.headerService.setFirstConversation(msg.conversationId);
          } else {
            this.toastr.info(this.translate.instant('newMessage'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.notificationSound();
            this.headerService.setFirstConversation(msg.conversationId);
            let data: IdAndBoolean = { id: msg.conversationId, boolean: true, lastMessageSenderId: msg.senderId };
            this.headerService.setReadConversation(data);
          }
        }
      })
    });
  }
  invalidAppointmentPrice: boolean; invalidAppointmentApproximateDuration: boolean; invalidExactAdress: boolean; invalidStartTime: boolean; invalidMaxPatientPerDay: boolean; invalidFirstNameVariable: boolean; invalidLastNameVariable: boolean; invalidMailVariable: boolean; invalidDayVariable: boolean; invalidMonthVariable: boolean; invalidYearVariable: boolean; invalidAdressVariable: boolean; invalidPasswordVariable: boolean; invalidPasswordRepeatVariable: boolean;
  appointmentApproximateDurationInformation: string; appointmentPriceInformation: string; exactAdressInformation: string; startTimeInformation: string; maxPatientPerDayInformation: string; passwordRepeatInfromation: string; passwordInfromation: string; firstNameInformation: string; lastNameInformation: string; mailInformation: string; dayInformation: string; monthInformation: string; yearInformation: string; adressInformation: string;
  appointmentApproximateDuration: string; appointmentPrice: string; exactAdress: string; startTime: string; maxPatientPerDay: string; firstName: string; lastName: string; mail: string; day: string; month: string; year: string; adress: string; password: string; passwordRepeat: string;
  docInfo: boolean;
  toadyAppointmentPatientInfo: AppointmentPatientInfo[];
  tomorrowAppointmentPatientInfo: AppointmentPatientInfo[];
  completedAppointmentPatientInfo: AppointmentPatientInfo[];
  nextAppointmentPatientInfo: AppointmentPatientInfo[];
  patientTodayProfilePicRes: any[]; patientTomorrowProfilePicRes: any[];
  patientTodayProfilePic: any[]; patientTomorrowProfilePic: any[];
  patientStart: number = 0; patientTomorrowStart: number = 0;
  patientFinish: number = 0; patientTomorrowFinish: number = 0;
  showpatientNavigationRight: boolean; showTomorrowpatientNavigationRight: boolean;
  showpatientNavigationLeft: boolean; showTomorrowpatientNavigationLeft: boolean;
  lengthTested: boolean; tommorowLengthTested: boolean;
  patientInfo: boolean = false; tomorrowPatientInfo: boolean = false;
  patientKey: number; tomorrowPatientKey: number;
  todayPatientMedicalProfileGet: medicalProfileGet[] = []; tomorrowPatientMedicalProfileGet: medicalProfileGet[] = [];
  accountDeleted: boolean = false;
  doctorSpecialities: string[] = [];
  doctorSettingsPost: DoctorSettingsPost;
  editPass: boolean = false;
  updatePasswordPost: UpdatePasswordPost;
  editGeneralInformation: boolean = true;
  editPassword: boolean;
  cities: string[] = ["Ariana", this.translate.instant('Beja'), "Ben Arous", "Bizerte", this.translate.instant('Gabes'), "Gafsa", "Jendouba", "Kairouan", "Kasserine", this.translate.instant('Kebili'), "Kef", "Mahdia", "Manouba", this.translate.instant('Medenine'), "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];
  todayAppPage: number = 0; tomorrowAppPage: number = 0;
  docTodayAppointments: AppointmentGet[] = []; docTomorrowAppointments: AppointmentGet[] = [];
  todayPatientNumber: number; tomorrowPatientNumber: number;
  todayAppCharged: boolean = false; tomorrowAppCharged: boolean = false;
  currentPatientInfo: AppointmentPatientInfo[] = [];
  nextPatientInfo: AppointmentPatientInfo; backPatientInfo: AppointmentPatientInfo;
  currentPatientProfileImg: any[] = [];
  currentPatientMedicalProfile: medicalProfileGet[] = []; currentPatientMedicalProfileDiseases: medicalProfileGet[] = [];
  loadingCurrentPatientInfo: boolean = false;
  addToCurrentPatient: string;
  currentMedicamentName: string; currentMedicamentPeriode: string;
  currentMed: PrescriptionMedicament; falseNumber: boolean = false;
  medicaments: PrescriptionMedicament[] = []; periodMesure: string = this.translate.instant('D');
  treatmentPerMonth: boolean = false; treatmentPerWeek: boolean = false; treatmentPerday: boolean = true;
  searchedMedicaments: string[] = []; savePrescription: boolean = true;
  prescriptionAddedToCurrentPatient: number = 0; diseaseName: string; docDiagnose: string;
  diagnoseAddedToCurrentPatient: number = 0;
  currentDiagnose: dignoses;
  diagnoses: dignoses[] = [];
  saveDiagnose: boolean = true;
  doctorInfoForMedicalProfileDis: doctor[] = [];
  doctorProfileImgForMedicalProfileDis: any[] = [];
  loadDoctorInfoForMedicalProfileDis: boolean[] = [];
  loadMoreDiagnose: boolean; todayLoadMoreDiagnose: boolean; todayMedicalProfileDiseasePage: number[] = [];
  tomorrowMedicalProfileDiseasePage: number[] = [];
  cuurentMedicalProfileDiseasePage: number = 0;
  currentMedicalProfilePrescription: prescriptionGet[] = [];
  todayMedicalProfilePrescription: prescriptionGet[] = [];
  tomorrowMedicalProfilePrescription: prescriptionGet[] = [];
  todayPatientMedicalProfileId: number = 0;
  tomorrowPatientMedicalProfileId: number = 0;
  notificationPage: number = 0;
  position: boolean = false;
  geoNotId: number = 0;
  notVerified: boolean;
  field1Code: string; field2Code: string; field3Code: string; field4Code: string; field5Code: string;
  isVerificationCode: boolean;
  todayDiseaseKey: number;
  todayDiseaseFullInfo: boolean = false;
  tomorrowDiseaseKey: number;
  tomorrowDiseaseFullInfo: boolean = false;
  currentDiseaseKey: number;
  currentDiseaseFullInfo: boolean = false;
  conversationPage: number = 0;
  openConversation: OpenConversation;
  message: string;
  @ViewChild('messagesContainer') private messagesContainer: ElementRef;
  loadMoreMessage: boolean = true;
  loadingMessages:boolean = false;

  ngOnInit(): void {
    this.headerService.setHeader('doctor');
    this.lengthTested = false; this.tommorowLengthTested = false;
    this.toadyAppointmentPatientInfo = []; this.tomorrowAppointmentPatientInfo = []; this.completedAppointmentPatientInfo = []; this.nextAppointmentPatientInfo = []; this.patientTodayProfilePicRes = []; this.patientTodayProfilePic = []; this.patientTomorrowProfilePicRes = []; this.patientTomorrowProfilePic = [];
    this.currentDate = formatDate(new Date(), 'yyyy/MM/dd', 'en');
    this.docInfo = false;
    this.getDoctorInfo();
    this.getAllSpecialities();
  }

  scrollToBottomMessages(): void {
    this.messagesContainer.nativeElement.scroll({
      top: this.messagesContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  async setDoctorPosition() {
    if (!navigator.geolocation) {
      console.log('not supported');
    }
    if (this.doctorGet.doctorLatitude && this.doctorGet.doctorLongitude) {
      this.position = true;
      let container = document.getElementById('map');
      while (!container) {
        container = document.getElementById('map');
        await this.sleep(500);
      }
      let myMap = L.map('map').setView([this.doctorGet.doctorLatitude, this.doctorGet.doctorLongitude], 13);

      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVzc2FhZGlpIiwiYSI6ImNrbzE3ZHZwbzA1djEyb3M1bzY4cmw1ejYifQ.cisRE8KJri7O9GD3KkMCCg', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'your.mapbox.access.token'
      }).addTo(myMap);

      let marker = L.marker([this.doctorGet.doctorLatitude, this.doctorGet.doctorLongitude]).addTo(myMap);
      marker.bindPopup(this.translate.instant('helloIm') + "<br><b> Dr. " + this.doctorGet.doctorFirstName + " " + this.doctorGet.doctorLastName + "</b>").openPopup();
    }
  }

  updateMyPosition() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.doctorService.updatePositionBySecureLogin(localStorage.getItem('secureLogin'), position.coords.latitude.toString(), position.coords.longitude.toString()).subscribe(
        res => {
          if (res) {
            if (!this.position) {
              this.notificationService.deleteNotificationById(this.geoNotId).subscribe(
                res => {
                  if (res) {
                    this.toastr.success(this.translate.instant('positionUpdated'), this.translate.instant('position'), {
                      timeOut: 3500,
                      positionClass: 'toast-bottom-left'
                    });
                    this.doctorGet.doctorLatitude = position.coords.latitude.toString();
                    this.doctorGet.doctorLongitude = position.coords.longitude.toString();
                    this.setDoctorPosition();
                  }
                },
                err => {
                  this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
                    timeOut: 3500,
                    positionClass: 'toast-bottom-left'
                  });
                }
              );
            } else {
              this.toastr.success(this.translate.instant('positionUpdated'), this.translate.instant('position'), {
                timeOut: 3500,
                positionClass: 'toast-bottom-left'
              });
              this.doctorGet.doctorLatitude = position.coords.latitude.toString();
              this.doctorGet.doctorLongitude = position.coords.longitude.toString();
              this.setDoctorPosition();
            }
          }
        }
      );
    });
  }

  getDoctorInfo() {
    this.doctorService.getDoctorInfo(this.secureLogin).subscribe(
      res => {
        if (res) {
          this.doctorGet = res;
          if (parseInt(this.doctorGet.doctorStatus) <= 99999 && parseInt(this.doctorGet.doctorStatus) >= 10000)
            this.notVerified = true;
          else {
            this.notVerified = false;
            this.getMyNotifications(this.doctorGet.userId);
            this.setDoctorPosition();
            this.getPatientNumber(this.currentDate, 'today');
            this.getTomorrowAppPatientByDate(true);
            if (this.doctorGet.doctorStatus == 'disapprovedPermanently') {
              this.deleteAccount();
              this.accountDeleted = true;
            } else {
              this.docInfo = true;
              this.getDoctorSpecialities();
              localStorage.setItem('id', this.doctorGet.userId.toString());
              if (this.doctorGet.doctorStatus == 'notApproved' || this.doctorGet.doctorStatus == 'disapprovedByAdmin') {
                this.checkDocDocument(this.doctorGet.userId + "doctorCinPic");
                this.checkDocDocument(this.doctorGet.userId + "doctorMedicalClinicPic");
                this.checkDocDocument(this.doctorGet.userId + "doctorMedicalSpecialty");
              }
              this.getImage(this.doctorGet.userId + "profilePic");
              this.intializeEdit();
              this.initializeAccountSettings();
              this.initializeEditAccountSettigns();
            }
          }
        } else
          this.router.navigate(['/acceuil']);
      },
      err => {
        this.router.navigate(['/acceuil']);
      }
    );
  }

  getMyNotifications(userId: number) {
    this.notificationService.getAllNotificationByUserId(userId, this.notificationPage, 5).subscribe(
      res => {
        let notifications: NotificationGet[] = [];
        notifications = res;
        for (let notification of notifications) {
          this.headerService.addNotification(notification);
          if (notification.notificationType == 'setYourGeoLocation')
            this.geoNotId = notification.notificationId;
        }
      }
    );
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
      this.doctorPostWithSecureLogin = new DoctorPostWithSecureLogin(this.mail.toLowerCase(), this.firstName.toLowerCase(), this.lastName.toLowerCase(), this.adress.toLowerCase(), this.passwordRepeat, birthday, gender.toLowerCase(), localStorage.getItem("secureLogin"));
      this.doctorService.updateDoctorInfoBySecureLogin(this.doctorPostWithSecureLogin).subscribe(
        res => {
          if (!res) {
            this.invalidMailVariable = true;
            this.mailInformation = this.translate.instant('mailExist');
          } else {
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
      this.updatePasswordPost = new UpdatePasswordPost(localStorage.getItem('secureLogin'), this.password);
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

  changePasswordClick() {
    this.editGeneralInformation = false;
    this.editPassword = true;
    this.toGeneralInfoSection();
  }

  changeUsernameClick() {
    this.editGeneralInformation = false;
    this.editPassword = false;
    this.toGeneralInfoSection();
  }

  ckeckFormAndUpdate(status: string) {
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
    if (this.appointmentPrice != null && parseInt(this.appointmentPrice) > 0 && parseInt(this.appointmentPrice) < 500) {
      this.invalidAppointmentPrice = false;
      if (this.appointmentApproximateDuration != null && parseInt(this.appointmentApproximateDuration) > 0 && parseInt(this.appointmentApproximateDuration) < 60) {
        this.invalidAppointmentApproximateDuration = false;
      } else {
        this.appointmentApproximateDurationInformation = this.translate.instant('appointmentApproximateDurationInvalid');
        this.invalidAppointmentApproximateDuration = true;
      }
    } else {
      this.appointmentPriceInformation = this.translate.instant('appointmentPriceInvalid');
      this.invalidAppointmentPrice = true;
    }

    if (!this.invalidStartTime && !this.invalidMaxPatientPerDay && this.exactAdress != null && !this.invalidAppointmentApproximateDuration && !this.invalidAppointmentPrice) {
      if (this.exactAdress.length >= 10) {
        this.invalidExactAdress = false;
        if (this.Mon || this.Tue || this.Wed || this.Thu || this.Fri || this.Sat || this.Sun) {
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
          this.doctorSettingsPost = new DoctorSettingsPost(localStorage.getItem('secureLogin'), this.startTime, this.exactAdress, workDays, parseInt(this.maxPatientPerDay), parseInt(this.appointmentPrice), parseInt(this.appointmentApproximateDuration));
          this.doctorService.updateDoctorSettingsBySecurelogin(this.doctorSettingsPost).subscribe(
            res => {
              if (res) {
                if (status == 'set') {
                  this.twoStringsPost = new TwoStringsPost(localStorage.getItem('secureLogin'), 'approved');
                  this.doctorService.changeDoctorStatusBySecureLogin(this.twoStringsPost).subscribe(
                    res => {
                      if (res) {
                        this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('update'), {
                          timeOut: 5000,
                          positionClass: 'toast-bottom-left'
                        });
                        this.ngOnInit();
                      }
                    }
                  );
                } else {
                  this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('update'), {
                    timeOut: 5000,
                    positionClass: 'toast-bottom-left'
                  });
                  this.ngOnInit();
                }
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

  intializeEdit() {
    this.password = null;
    this.passwordRepeat = null
    this.firstName = this.doctorGet.doctorFirstName;
    this.lastName = this.doctorGet.doctorLastName;
    this.mail = this.doctorGet.userUsername;
    this.adress = this.doctorGet.userCity;
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
    this.toGeneralInfoSection();
  }

  checkAdress() {
    let lowerCaseAdress: string = this.adress.toLocaleLowerCase();
    this.adress = this.adress.replace('é', 'e');
    this.adress = this.adress.replace('è', 'e');
    for (let city of this.cities) {
      if (lowerCaseAdress == city.toLocaleLowerCase()) {
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
    if (this.mail.toLowerCase() === this.doctorGet.userUsername)
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
    if (this.adress.toLowerCase() === this.doctorGet.userCity)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }

  comparePassword() {
    if (this.password.length == 0 || this.password == null)
      this.disableSavePassBtn = true;
    else
      this.disableSavePassBtn = false;
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.doctorGet.userId + "profilePic");
  }

  onUpload(imageName: string) {
    if (this.doctorGet.userId == parseInt(localStorage.getItem('id'))) {
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
    if (this.doctorGet.userId == parseInt(localStorage.getItem('id'))) {
      if (imageName == this.doctorGet.userId + "profilePic") {
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
      } else if (imageName == this.doctorGet.userId + "doctorCinPic")
        this.cinPic = true;
      else if (imageName == this.doctorGet.userId + "doctorMedicalClinicPic")
        this.medicalClinicPic = true;
      else if (imageName == this.doctorGet.userId + "doctorMedicalSpecialty")
        this.medicalSpecialtyPic = true;
    } else {
      this.toastr.info(this.translate.instant('applicationDataChanged'), this.translate.instant('Data'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    }
  }

  onFileChangedCin(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.doctorGet.userId + "doctorCinPic");
  }

  onFileChangedMedicalClinic(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.doctorGet.userId + "doctorMedicalClinicPic");
  }

  onFileChangedMedicalSpecialty(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.doctorGet.userId + "doctorMedicalSpecialty");
  }

  submitDoctorDocuments() {
    this.testSpeciality = true;
    if (this.specialityName != null) {
      for (let spec of this.specialityGet) {
        if (this.translate.instant(spec.specialityCode).toLowerCase() == this.specialityName.toLowerCase()) {
          this.testSpeciality = false;
          this.specialityCode = spec.specialityCode;
          break;
        }
      }
    }
    if (this.testSpeciality) {
      this.invalidSpecialityVariable = true;
      this.specialityInformation = this.translate.instant('invalidSpeciality');
    } else {
      this.invalidSpecialityVariable = false;
      this.specialityInformation = this.translate.instant('speciality');
      this.twoStringsPost = new TwoStringsPost(localStorage.getItem('secureLogin'), 'pending');
      this.doctorService.changeDoctorStatusBySecureLogin(this.twoStringsPost).subscribe(
        res => {
          if (res) {
            this.integerAndStringPost = new IntegerAndStringPost(this.doctorGet.userId, this.specialityCode)
            this.doctorService.addspecialityTodoctor(this.integerAndStringPost).subscribe(
              res => {
                if (res) {
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
          if (imageName == this.doctorGet.userId + "doctorCinPic")
            this.cinPic = true;
          else if (imageName == this.doctorGet.userId + "doctorMedicalClinicPic")
            this.medicalClinicPic = true;
          else if (imageName == this.doctorGet.userId + "doctorMedicalSpecialty")
            this.medicalSpecialtyPic = true;
        }
      }
    );
  }

  toNotApprovedSection() {
    document.getElementById("notApprovedSection").scrollIntoView({ behavior: "smooth" });
  }

  toGeneralInfoSection() {
    document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
  }

  toapprovedByAdminSection() {
    document.getElementById("approvedByAdminSection").scrollIntoView({ behavior: "smooth" });
  }

  initializeAccountSettings() {
    this.maxPatientPerDayInformation = this.translate.instant('maxPatientPerDay');
    this.startTimeInformation = this.translate.instant('startTime');
    this.exactAdressInformation = this.translate.instant('exactAdress');
    this.specialityInformation = this.translate.instant('speciality');
    this.appointmentPriceInformation = this.translate.instant('appointmentPrice');
    this.appointmentApproximateDurationInformation = this.translate.instant('appointmentApproximateDuration');
  }

  initializeEditAccountSettigns() {
    if (this.doctorGet.startTime && this.doctorGet.maxPatientPerDay && this.doctorGet.appointmentPrice) {
      this.startTime = this.doctorGet.startTime.toString();
      this.exactAdress = this.doctorGet.exactAddress;
      this.maxPatientPerDay = this.doctorGet.maxPatientPerDay.toString();
      this.appointmentApproximateDuration = this.doctorGet.appointmentApproximateDuration.toString();
      this.appointmentPrice = this.doctorGet.appointmentPrice.toString();
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
  }

  compareMaxPateintPerDay() {
    if (this.doctorGet.maxPatientPerDay.toString() != this.maxPatientPerDay)
      this.disabledUpdateBtn = false;
    else
      this.disabledUpdateBtn = true;
  }

  compareStartTime() {
    if (this.doctorGet.startTime.toString() != this.startTime)
      this.disabledUpdateBtn = false;
    else
      this.disabledUpdateBtn = true;
  }

  compareExactAdress() {
    if (this.doctorGet.exactAddress != this.exactAdress)
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

  compareAppointmenTime() {
    if (parseInt(this.appointmentApproximateDuration) != this.doctorGet.appointmentApproximateDuration) {
      this.disabledUpdateBtn = false;
    } else {
      this.disabledUpdateBtn = true;
    }
  }

  compareAppointmentPrice() {
    if (parseInt(this.appointmentPrice) != this.doctorGet.appointmentPrice) {
      this.disabledUpdateBtn = false;
    } else {
      this.disabledUpdateBtn = true;
    }
  }

  toreVerifySection() {
    document.getElementById("reVerifySection").scrollIntoView({ behavior: "smooth" });
  }

  reVerifyDoctorDocuments() {
    this.twoStringsPost = new TwoStringsPost(localStorage.getItem('secureLogin'), 'reVerify');
    this.doctorService.changeDoctorStatusBySecureLogin(this.twoStringsPost).subscribe(
      res => {
        if (res) {
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
    this.doctorService.deteleDoctorById(this.doctorGet.userId).subscribe(
      res => {
        if (res == 1) {
          localStorage.setItem('secureLogin', '');
          localStorage.setItem('id', '');
          localStorage.setItem('secureLoginType', '');
          this.toastr.warning(this.translate.instant('accountDeleted'), this.translate.instant('delete'), {
            timeOut: 10000,
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

  getPatientNumber(date: string, status: string) {
    this.appointmentService.getAppointmentNumberByDoctorIdAndDate(this.doctorGet.userId, date).subscribe(
      res => {
        if (res > 0) {
          if (status == 'today') {
            this.todayPatientNumber = res;
            if (this.doctorGet.currentPatient != 0)
              this.getPatientByTurn(true);
            else
              this.getTodayAppPatientByDate(true);
          } else if (status == 'tomorrow')
            this.tomorrowPatientNumber = res;

        }
      }
    );
  }

  getTodayAppPatientByDate(firstTime: boolean) {
    if (!this.todayAppCharged) {
      let docTodayAppointments: AppointmentGet[] = [];
      this.appointmentService.getAppointmentByDoctorIdAndDate(this.doctorGet.userId, this.todayAppPage, 6, this.currentDate).subscribe(
        res => {
          docTodayAppointments = res;
          if (firstTime) {
            this.patientStart = -docTodayAppointments.length;
            this.patientFinish = 0;
          }
          for (let todayApp of docTodayAppointments) {
            this.docTodayAppointments.push(todayApp);
            this.getPatientInfo(todayApp.patientId, todayApp.patientTurn, 'today');
            this.getPatientProfileImage(todayApp.patientId, todayApp.patientTurn, 'today');
          }
          if (docTodayAppointments.length == 6) {
            this.showpatientNavigationRight = true;
            this.patientStart += 6;
            this.patientFinish += 6;
          }
          else {
            this.showpatientNavigationRight = false;
            this.patientStart += docTodayAppointments.length;
            this.patientFinish += docTodayAppointments.length;
            this.todayAppCharged = true;
          }
          this.todayAppPage += 1;
        }
      );
    } else {
      if (this.docTodayAppointments.length >= (this.patientFinish + 6)) {
        this.patientStart += 6;
        this.patientFinish += 6;
        this.showpatientNavigationLeft = true;
        this.showpatientNavigationRight = true;
      } else {
        this.patientStart += (this.docTodayAppointments.length % 6);
        this.patientFinish += (this.docTodayAppointments.length % 6);
        this.showpatientNavigationRight = false;
        this.showpatientNavigationLeft = true;
      }
    }
    if (!firstTime)
      this.showpatientNavigationLeft = true;
    else {
      if (this.docTodayAppointments.length <= 6)
        this.showpatientNavigationLeft = false;
    }
  }

  getTomorrowAppPatientByDate(firstTime: boolean) {
    if (!this.tomorrowAppCharged) {
      let today = new Date();
      let tomorrow = formatDate(new Date(today.setDate(today.getDate() + 1)), 'yyyy/MM/dd', 'en');
      let tomorrowAppointments: AppointmentGet[] = [];
      this.appointmentService.getAppointmentByDoctorIdAndDate(this.doctorGet.userId, this.tomorrowAppPage, 6, tomorrow).subscribe(
        res => {
          tomorrowAppointments = res;
          if (firstTime) {
            this.patientTomorrowStart = -tomorrowAppointments.length;
            this.patientTomorrowFinish = 0;
            this.getPatientNumber(tomorrow, 'tomorrow');
          }
          for (let tomorrowApp of tomorrowAppointments) {
            this.docTomorrowAppointments.push(tomorrowApp);
            this.getPatientInfo(tomorrowApp.patientId, tomorrowApp.patientTurn, 'tomorrow');
            this.getPatientProfileImage(tomorrowApp.patientId, tomorrowApp.patientTurn, 'tomorrow');
          }
          if (tomorrowAppointments.length == 6) {
            this.showTomorrowpatientNavigationRight = true;
            this.patientTomorrowStart += 6;
            this.patientTomorrowFinish += 6;
          }
          else {
            this.showTomorrowpatientNavigationRight = false;
            this.patientTomorrowStart += tomorrowAppointments.length;
            this.patientTomorrowFinish += tomorrowAppointments.length;
            this.tomorrowAppCharged = true;
          }
          this.tomorrowAppPage += 1;
        }
      );
    } else {
      if (this.docTomorrowAppointments.length >= (this.patientTomorrowFinish + 6)) {
        this.patientTomorrowStart += 6;
        this.patientTomorrowFinish += 6;
        this.showTomorrowpatientNavigationLeft = true;
        this.showTomorrowpatientNavigationRight = true;
      } else {
        this.patientTomorrowStart += (this.docTomorrowAppointments.length % 6);
        this.patientTomorrowFinish += (this.docTomorrowAppointments.length % 6);
        this.showTomorrowpatientNavigationRight = false;
        this.showTomorrowpatientNavigationLeft = true;
      }
    }
    if (!firstTime)
      this.showTomorrowpatientNavigationLeft = true;
    else {
      if (this.docTodayAppointments.length <= 6)
        this.showTomorrowpatientNavigationLeft = false;
    }
  }

  patientNavigationLeftClick() {
    if (this.toadyAppointmentPatientInfo.length >= (this.patientFinish + 6)) {
      this.patientStart -= 6;
      this.patientFinish -= 6;
      this.showpatientNavigationLeft = true;
      this.showpatientNavigationRight = true;
    } else {
      this.patientStart -= (this.toadyAppointmentPatientInfo.length % 6);
      this.patientFinish -= (this.toadyAppointmentPatientInfo.length % 6);
      this.showpatientNavigationRight = true;
      this.showpatientNavigationLeft = false;
    }
  }

  patientTomorrowNavigationLeftClick() {
    if (this.tomorrowAppointmentPatientInfo.length >= (this.patientTomorrowFinish + 6)) {
      this.patientTomorrowStart -= 6;
      this.patientTomorrowFinish -= 6;
      this.showTomorrowpatientNavigationLeft = true;
      this.showTomorrowpatientNavigationRight = true;
    } else {
      this.patientTomorrowStart -= (this.tomorrowAppointmentPatientInfo.length % 6);
      this.patientTomorrowFinish -= (this.tomorrowAppointmentPatientInfo.length % 6);
      this.showTomorrowpatientNavigationRight = true;
      this.showTomorrowpatientNavigationLeft = false;
    }
  }

  showFullPatientTomorrowInfo(medicalProfileId: number, patientKey: number) {
    this.tomorrowPatientKey = patientKey;
    this.tomorrowPatientMedicalProfileId = medicalProfileId;
    if (this.tomorrowPatientMedicalProfileGet[patientKey] == null) {
      this.patientService.getPatientMedicalProfileByMedicalProfileId(medicalProfileId).subscribe(
        res => {
          if (res) {
            this.tomorrowMedicalProfileDiseasePage[patientKey] = 0;
            this.tomorrowPatientMedicalProfileGet[patientKey] = res;
            this.tomorrowPatientInfo = true;
            this.tomorrowPatientMedicalProfileGet[patientKey].medicalProfileDisease = [];
            this.getMedicalProfileDiseases(medicalProfileId, patientKey, 'tomorrow', this.tomorrowMedicalProfileDiseasePage[patientKey]);
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
      this.tomorrowPatientInfo = true;
    }
  }

  getPatientInfo(patientId: number, patientTurn, status: string) {
    this.doctorService.getAppPatientInfoById(patientId).subscribe(
      res => {
        if (res) {
          if (status == 'today') {
            this.toadyAppointmentPatientInfo[patientTurn - 1] = res;
            this.toadyAppointmentPatientInfo[patientTurn - 1].userId = patientId;
          } else if (status == 'tomorrow') {
            this.tomorrowAppointmentPatientInfo[patientTurn - 1] = res;
            this.tomorrowAppointmentPatientInfo[patientTurn - 1].userId = patientId;
          }
        }
      });
  }

  getPatientProfileImage(id: number, turn: number, status: string) {
    let retrieveResonse: any;
    let base64Data: any;
    let retrievedImage: any;
    this.doctorService.getDoctorPofilePhoto(id + 'profilePic').subscribe(
      res => {
        if (status == 'today') {
          if (res != null) {
            retrieveResonse = res;
            base64Data = retrieveResonse.picByte;
            retrievedImage = 'data:image/jpeg;base64,' + base64Data;
            this.patientTodayProfilePic[turn - 1] = retrievedImage;
          } else {
            this.patientTodayProfilePic[turn - 1] = false;
          }
        } else if (status == 'tomorrow') {
          if (res != null) {
            retrieveResonse = res;
            base64Data = retrieveResonse.picByte;
            retrievedImage = 'data:image/jpeg;base64,' + base64Data;
            this.patientTomorrowProfilePic[turn - 1] = retrievedImage;
          } else {
            this.patientTomorrowProfilePic[turn - 1] = false;
          }
        }
      }
    );
  }

  icreasePatientTurn(key: string): string {
    return parseInt(key) + 1 + '';
  }

  showFullPatientInfo(medicalProfileId: number, patientKey: number) {
    this.patientKey = patientKey;
    this.todayPatientMedicalProfileId = medicalProfileId;
    if (this.todayPatientMedicalProfileGet[patientKey] == null) {
      this.patientService.getPatientMedicalProfileByMedicalProfileId(medicalProfileId).subscribe(
        res => {
          if (res) {
            this.todayMedicalProfileDiseasePage[patientKey] = 0;
            this.todayPatientMedicalProfileGet[patientKey] = res;
            this.todayPatientMedicalProfileGet[patientKey].medicalProfileDisease = [];
            this.patientInfo = true;
            this.getMedicalProfileDiseases(medicalProfileId, patientKey, 'today', this.todayMedicalProfileDiseasePage[patientKey]);
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
      this.patientInfo = true;
    }
  }

  getPatientPrescriptionByDoctorIdPatientIdAndDate(patientId: number, date: string, disKey: number, status: string) {
    this.prescriptionService.getPrescriptionByDoctorIdPatientIdAndDate(this.doctorGet.userId, patientId, date).subscribe(
      res => {
        if (status == 'current')
          this.currentMedicalProfilePrescription[disKey - 1] = res;
        if (status == 'today')
          this.todayMedicalProfilePrescription[disKey - 1] = res;
        if (status == 'tomorrow')
          this.tomorrowMedicalProfilePrescription[disKey - 1] = res;
      }
    );
  }

  getMedicalProfileDiseases(id: number, patientKey: number, status: string, page: number) {
    this.patientService.getPatientMedicalProfileDeseasesByMedicalProfileId(id, page, 3).subscribe(
      res => {
        let response: medicalProfileDiseaseGet[] = [];
        response = res;
        this.loadingCurrentPatientInfo = false;
        if (status == 'today') {
          this.todayMedicalProfileDiseasePage[patientKey] += 1;
          for (let dis of response) {
            dis.showFullInfo = false;
            this.todayPatientMedicalProfileGet[patientKey].medicalProfileDisease.push(dis);
            this.getPatientPrescriptionByDoctorIdPatientIdAndDate(this.docTodayAppointments[this.patientKey].patientId, dis.medicalProfileDiseaseDiagnoseDay.slice(0, 10), this.todayPatientMedicalProfileGet[patientKey].medicalProfileDisease.length, 'today');
          }
          if (response.length == 3)
            this.todayLoadMoreDiagnose = true;
          else
            this.todayLoadMoreDiagnose = false;
        }
        else if (status == 'tomorrow') {
          this.tomorrowMedicalProfileDiseasePage[patientKey] += 1;
          for (let dis of response) {
            dis.showFullInfo = false;
            this.tomorrowPatientMedicalProfileGet[patientKey].medicalProfileDisease.push(dis);
            this.getPatientPrescriptionByDoctorIdPatientIdAndDate(this.docTomorrowAppointments[this.tomorrowPatientKey].patientId, dis.medicalProfileDiseaseDiagnoseDay.slice(0, 10), this.tomorrowPatientMedicalProfileGet[patientKey].medicalProfileDisease.length, 'tomorrow');
          }
          if (response.length == 3)
            this.todayLoadMoreDiagnose = true;
          else
            this.todayLoadMoreDiagnose = false;
        }
        else if (status == 'currentPatient') {
          for (let dis of response) {
            dis.showFullInfo = false;
            this.currentPatientMedicalProfile[patientKey - 1].medicalProfileDisease.push(dis);
            if (this.doctorGet.currentPatient == patientKey)
              this.getPatientPrescriptionByDoctorIdPatientIdAndDate(this.currentPatientInfo[patientKey - 1].userId, dis.medicalProfileDiseaseDiagnoseDay.slice(0, 10), this.currentPatientMedicalProfile[patientKey - 1].medicalProfileDisease.length, 'current');
          }
          if (this.doctorGet.currentPatient == patientKey) {
            if (response.length == 3)
              this.loadMoreDiagnose = true;
            else
              this.loadMoreDiagnose = false;
            this.cuurentMedicalProfileDiseasePage += 1;
          }
        }
      }
    );
  }

  getPatientByTurn(firsttime: boolean) {
    if (!this.savePrescription) {
      this.toastr.warning(this.translate.instant('prescriptionNotNull'), this.translate.instant('prescription'), {
        timeOut: 6000,
        positionClass: 'toast-bottom-left'
      });
    } else if (!this.saveDiagnose) {
      this.toastr.warning(this.translate.instant('diagNotNull'), this.translate.instant('diagnose'), {
        timeOut: 6000,
        positionClass: 'toast-bottom-left'
      });
    } else {
      this.loadingCurrentPatientInfo = true;
      let patientTurn: number;
      if (firsttime)
        patientTurn = this.doctorGet.currentPatient;
      else if (this.doctorGet.currentPatient == this.todayPatientNumber)
        patientTurn = 0;
      else
        patientTurn = parseInt(this.doctorGet.currentPatient.toString()) + 1;
      this.doctorService.changeCurrentPatientBySecureLogin(localStorage.getItem('secureLogin'), patientTurn).subscribe(
        res => {
          if (res) {
            if (this.currentPatientInfo[parseInt(this.doctorGet.currentPatient.toString()) - 1])
              this.changeAppointmentStatusById(this.currentPatientInfo[parseInt(this.doctorGet.currentPatient.toString()) - 1].appointmentId, 'completed');
            this.cuurentMedicalProfileDiseasePage = 0;
            let nextPatient: number = parseInt(patientTurn.toString()) + 1;
            this.doctorGet.currentPatient = patientTurn;
            if (this.currentPatientInfo[patientTurn - 1] == null)
              this.getAppPatientInfoByDoctorIdTurnAndDate(patientTurn, firsttime);
            if (nextPatient <= this.todayPatientNumber) {
              this.cuurentMedicalProfileDiseasePage = 0;
              this.getAppPatientInfoByDoctorIdTurnAndDate(nextPatient, false);
            }
            this.prescriptionAddedToCurrentPatient = 0;
            this.diagnoseAddedToCurrentPatient = 0;
            this.medicaments = [];
            this.diagnoses = [];
            document.getElementById("currentPatientSection").scrollIntoView({ behavior: "smooth" });
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

  changeAppointmentStatusById(appId: number, newStatus) {
    this.appointmentService.changeAppointmentStatusById(appId, newStatus).subscribe();
  }

  getAppPatientInfoByDoctorIdTurnAndDate(patientTurn: number, firstTime: boolean) {
    this.doctorService.getAppPatientInfoByDoctorIdTurnAndDate(this.doctorGet.userId, patientTurn, this.currentDate).subscribe(
      res => {
        this.currentPatientInfo[patientTurn - 1] = res;
        this.getCurrentPatientProfileImg(this.currentPatientInfo[patientTurn - 1].userId, patientTurn);
        this.getCurrentPatientMedicalProfile(this.currentPatientInfo[patientTurn - 1].medicalProfileId, patientTurn);
        if (firstTime) {
          this.getPrescriptionByDoctorIdPatientIdAndDate(patientTurn);
          this.getDiagnoseByMedicalProfileIdDoctorIdAndDate(this.currentPatientInfo[this.doctorGet.currentPatient - 1].medicalProfileId, this.currentDate, 'currentDiagnose');
        }
      }
    );
  }

  getCurrentPatientMedicalProfile(medicalProfileId: number, patientTurn: number) {
    this.patientService.getPatientMedicalProfileByMedicalProfileId(medicalProfileId).subscribe(
      res => {
        if (res) {
          this.currentPatientMedicalProfile[patientTurn - 1] = res;
          this.currentPatientMedicalProfile[patientTurn - 1].medicalProfileDisease = [];
          this.getMedicalProfileDiseases(medicalProfileId, patientTurn, 'currentPatient', this.cuurentMedicalProfileDiseasePage);
        }
      }
    );
  }

  getCurrentPatientProfileImg(id: number, patientTurn: number) {
    let retrieveResonse: any; let base64Data: any; let retrievedImage: any;
    this.doctorService.getDoctorPofilePhoto(id + 'profilePic').subscribe(
      res => {
        if (res != null) {
          retrieveResonse = res;
          base64Data = retrieveResonse.picByte;
          retrievedImage = 'data:image/jpeg;base64,' + base64Data;
          this.currentPatientProfileImg[patientTurn - 1] = retrievedImage;
        } else
          this.currentPatientProfileImg[patientTurn - 1] = false;
      }
    );
  }

  addMedicaments() {
    if ((parseInt(this.currentMedicamentPeriode) > 0) && this.currentMedicamentName != null && this.currentMedicamentName.length > 2) {
      this.currentMed = { medicamentName: this.currentMedicamentName, treatmentPeriode: this.currentMedicamentPeriode + this.periodMesure };
      this.medicaments.push(this.currentMed);
      this.currentMedicamentName = "";
      this.currentMedicamentPeriode = "";
      this.currentMed = { medicamentName: "", treatmentPeriode: "" };
      this.savePrescription = false;
    } else {
      this.falseNumber = true;
      this.toastr.warning(this.translate.instant('fillTheFieldsWithCoorectInfo'), this.translate.instant('prescription'), {
        timeOut: 5000,
        positionClass: 'toast-bottom-left'
      });
    }
  }

  changeTreatmentPeriode(periode: string) {
    if (periode == 'd') {
      this.treatmentPerday = true;
      this.treatmentPerWeek = false;
      this.treatmentPerMonth = false;
    } else if (periode == 'w') {
      this.treatmentPerday = false;
      this.treatmentPerWeek = true;
      this.treatmentPerMonth = false;
    } else if (periode == 'm') {
      this.treatmentPerday = false;
      this.treatmentPerWeek = false;
      this.treatmentPerMonth = true;
    }
  }

  getMedicaments() {
    if (this.currentMedicamentName.length == 3) {
      this.medicamentService.getMedicamentsByFirstLetters(this.currentMedicamentName).subscribe(
        res => {
          this.searchedMedicaments = res;
        }
      );
    }
  }

  cancelMed(key: number) {
    this.medicaments.splice(key, 1);
    if (this.medicaments.length == 0)
      this.savePrescription = true;
    else
      this.savePrescription = false;
  }

  cancelDiagnose(key: number) {
    this.diagnoses.splice(key, 1);
    if (this.diagnoses.length == 0)
      this.saveDiagnose = true;
    else
      this.saveDiagnose = false;
  }

  addPrescription(patientId: number) {
    if (this.prescriptionAddedToCurrentPatient == 0) {
      this.prescriptionService.addPres(patientId, this.doctorGet.userId).subscribe(
        res => {
          this.prescriptionAddedToCurrentPatient = res;
          for (let med of this.medicaments) {
            med.treatmentPeriode = med.treatmentPeriode.replace('J', 'D');
            med.treatmentPeriode = med.treatmentPeriode.replace('S', 'W');
            this.prescriptionService.addMedicamentToPresById(med.medicamentName, med.treatmentPeriode, this.prescriptionAddedToCurrentPatient).subscribe();
          }
          this.currentMedicamentName = '';
          this.currentMedicamentPeriode = '';
          this.savePrescription = true;
          this.addToCurrentPatient = '';
          document.getElementById("addedToCurrentPatient").scrollIntoView({ behavior: "smooth" });
          this.toastr.success(this.translate.instant('prescriptionSaved'), this.translate.instant('prescription'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    } else
      this.deletePres(false, patientId);
  }

  deletePres(doctor: boolean, patientId: number) {
    this.prescriptionService.deleteById(this.prescriptionAddedToCurrentPatient).subscribe(
      res => {
        if (res) {
          if (doctor) {
            this.toastr.warning(this.translate.instant('prescriptionDeleted'), this.translate.instant('prescription'), {
              timeOut: 3500,
              positionClass: 'toast-bottom-left'
            });
            this.prescriptionAddedToCurrentPatient = 0;
          } else {
            this.prescriptionAddedToCurrentPatient = 0;
            this.addPrescription(patientId);
          }
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

  addPrescriptionBtn() {
    if (this.prescriptionAddedToCurrentPatient == 0) {
      this.addToCurrentPatient = 'prescription';
      document.getElementById("addToPatientSection").scrollIntoView({ behavior: "smooth" });
    }
    else {
      this.toastr.warning(this.translate.instant('patientAlreadyhavePrescription'), this.translate.instant('prescription'), {
        timeOut: 3500,
        positionClass: 'toast-bottom-left'
      });
      document.getElementById("addedToCurrentPatient").scrollIntoView({ behavior: "smooth" });
    }
  }

  getPrescriptionByDoctorIdPatientIdAndDate(patientTurn: number) {
    let response: prescriptionGet;
    this.prescriptionService.getPrescriptionByDoctorIdPatientIdAndDate(this.doctorGet.userId, this.currentPatientInfo[patientTurn - 1].userId, this.currentDate).subscribe(
      res => {
        if (res) {
          response = res;
          this.prescriptionAddedToCurrentPatient = response.prescriptionId;
          this.medicaments = response.medicament;
        }
      }
    );
  }

  getDoctorSpecialities() {
    this.doctorService.getDoctorSpecialitiesBySecureLogin(this.secureLogin).subscribe(
      res => {
        this.doctorSpecialities = res;
      }
    );
  }

  addDiagnoseBtn() {
    if (this.diagnoseAddedToCurrentPatient == 0) {
      this.addToCurrentPatient = 'disease';
      document.getElementById("addToPatientSection").scrollIntoView({ behavior: "smooth" });
    }
    else {
      this.toastr.warning(this.translate.instant('patientAlreadyDiagnosed'), this.translate.instant('diagnose'), {
        timeOut: 3500,
        positionClass: 'toast-bottom-left'
      });
      document.getElementById("addedToCurrentPatient").scrollIntoView({ behavior: "smooth" });
    }
  }

  addDiagnose() {
    if (this.diseaseName == null || this.diseaseName.length < 3) {
      this.toastr.warning(this.translate.instant('fillTheFieldsWithCoorectInfo'), this.translate.instant('diagnose'), {
        timeOut: 3500,
        positionClass: 'toast-bottom-left'
      });
    } else {
      this.currentDiagnose = { medicalProfileDiseaseName: this.diseaseName, medicalProfileDiseaseDiagnose: this.docDiagnose, medicalProfileDiseaseId: 0 };
      this.diagnoses.push(this.currentDiagnose);
      this.diseaseName = "";
      this.docDiagnose = "";
      this.currentDiagnose = { medicalProfileDiseaseName: "", medicalProfileDiseaseDiagnose: "", medicalProfileDiseaseId: 0 };
      this.saveDiagnose = false;
    }
  }

  getDiagnoseByMedicalProfileIdDoctorIdAndDate(medicalProfileId: number, date: string, status: string) {
    this.patientService.getDiagnoseByMedicalProfileIdDoctorIdAndDate(medicalProfileId, this.doctorGet.userId, date).subscribe(
      res => {
        if (res) {
          if (status == 'currentDiagnose') {
            this.diagnoses = res;
            if (this.diagnoses.length > 0)
              this.diagnoseAddedToCurrentPatient = 1;
          }
        }
      }
    );
  }

  saveCurrentPatientDiagnose(medicalProfileId: number) {
    if (this.diagnoseAddedToCurrentPatient == 0) {
      let i: number = 1;
      for (let diag of this.diagnoses) {
        this.patientService.addDiagnoseToMedicalProfileById(this.doctorGet.userId, medicalProfileId, diag.medicalProfileDiseaseName, diag.medicalProfileDiseaseDiagnose).subscribe(
          res => {
            if (res && i == this.diagnoses.length) {
              this.toastr.success(this.translate.instant('diagnoseAdded'), this.translate.instant('diagnose'), {
                timeOut: 3500,
                positionClass: 'toast-bottom-left'
              });
              document.getElementById("addedToCurrentPatient").scrollIntoView({ behavior: "smooth" });
              this.addToCurrentPatient = null;
              this.diagnoseAddedToCurrentPatient = 1;
            }
            i += 1;
          }
        );
      }
    } else
      this.deleteDiagnoseByMedicalProfileIdDoctorIdAndDate(false);
  }

  deleteDiagnoseByMedicalProfileIdDoctorIdAndDate(fromHtml: boolean) {
    this.patientService.deleteDiagnoseByMedicalProfileIdDoctorIdAndDate(parseInt(this.currentPatientInfo[this.doctorGet.currentPatient - 1].medicalProfileId.toString()), this.doctorGet.userId, this.currentDate).subscribe(
      res => {
        if (res) {
          if (fromHtml) {
            this.toastr.success(this.translate.instant('diagnoseDeleted'), this.translate.instant('diagnose'), {
              timeOut: 3500,
              positionClass: 'toast-bottom-left'
            });
            this.diagnoseAddedToCurrentPatient = 0;
          } else {
            this.diagnoseAddedToCurrentPatient = 0;
            this.saveCurrentPatientDiagnose(this.currentPatientInfo[this.doctorGet.currentPatient - 1].medicalProfileId);
          }
        }
      }
    );
  }

  getDoctorFullInfo(doctorId: number, diseaseKey: number, status: string) {
    if (status == 'current' && this.doctorInfoForMedicalProfileDis[diseaseKey]) {
      this.currentDiseaseKey = diseaseKey;
      this.currentDiseaseFullInfo = true;
    }
    else if (status == 'today' && this.doctorInfoForMedicalProfileDis[diseaseKey]) {
      this.todayDiseaseKey = diseaseKey;
      this.todayDiseaseFullInfo = true;
    }
    else if (status == 'tomorrow' && this.doctorInfoForMedicalProfileDis[diseaseKey]) {
      this.tomorrowDiseaseKey = diseaseKey;
      this.tomorrowDiseaseFullInfo = true;
    }
    else {
      this.loadDoctorInfoForMedicalProfileDis[diseaseKey] = true;
      this.doctorService.GetDoctorInfoById(doctorId).subscribe(
        res => {
          if (status == 'today')
            this.todayDiseaseKey = diseaseKey;
          else if (status == 'tomorrow')
            this.tomorrowDiseaseKey = diseaseKey;
          else if (status == 'current')
            this.currentDiseaseKey = diseaseKey;
          this.doctorInfoForMedicalProfileDis[diseaseKey] = res;
          this.getDoctorProfileImage(doctorId, diseaseKey, status);
        }
      );
    }
  }

  getDoctorProfileImage(doctorId: number, diseaseKey: number, status: string) {
    let retrieveResonse: any;
    let base64Data: any;
    let retrievedImage: any;
    this.doctorService.getDoctorPofilePhoto(doctorId + 'profilePic').subscribe(
      res => {
        if (res != null) {
          retrieveResonse = res;
          base64Data = retrieveResonse.picByte;
          retrievedImage = 'data:image/jpeg;base64,' + base64Data;
          this.doctorProfileImgForMedicalProfileDis[diseaseKey] = retrievedImage;
        } else
          this.doctorProfileImgForMedicalProfileDis[diseaseKey] = false;
        this.loadDoctorInfoForMedicalProfileDis[diseaseKey] = false;
        if (status == 'current')
          this.currentDiseaseFullInfo = true;
        else if (status == 'today')
          this.todayDiseaseFullInfo = true;
        else if (status == 'tomorrow')
          this.tomorrowDiseaseFullInfo = true;
      }
    );
  }

  checkVerificationCode() {
    let code: number = parseInt(this.field1Code + this.field2Code + this.field3Code + this.field4Code + this.field5Code);
    if (code) {
      this.userService.checkVerifacationCode(this.doctorGet.userUsername, code).subscribe(
        res => {
          if (res == true) {
            this.updateStatusByEmail();
          }
          else
            this.isVerificationCode = false;
        }, err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    } else {
      this.isVerificationCode = false;
    }
  }

  updateStatusByEmail() {
    this.userService.updateUserStatusByEmail(this.doctorGet.userUsername, 'notApproved').subscribe(
      res => {
        if (res) {
          this.toastr.success(this.translate.instant('accountVerified'), this.translate.instant('verified'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
          this.ngOnInit();
        }
      }
    );
  }

  @ViewChild('1') field1Input: ElementRef;
  @ViewChild('2') field2Input: ElementRef;
  @ViewChild('3') field3Input: ElementRef;
  @ViewChild('4') field4Input: ElementRef;
  @ViewChild('5') field5Input: ElementRef;

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
    if (this.field4Code.length == 1)
      this.field5Input.nativeElement.focus();
    else
      this.field3Input.nativeElement.focus();
  }
  field5Keyup() {
    if (this.field5Code.length == 0)
      this.field4Input.nativeElement.focus();
  }

  openMessages() {
    this.conversationService.getConversationByUserId(this.doctorGet.userId, this.conversationPage, 10).subscribe(
      res => {
        let conversations: ConversationGet[] = res;
        for (let conver of conversations) {
          if (conver.message_content.length >= 10)
            conver.message_content = conver.message_content.slice(0, 7) + '...';
          let imageName: string;
          imageName = conver.recipient + 'profilePic';
          this.doctorService.getDoctorPofilePhoto(imageName).subscribe(
            res => {
              if (res != null) {
                let retrieveResonse: any = res;
                let base64Data: any = retrieveResonse.picByte;
                let retrievedImage: any = 'data:image/jpeg;base64,' + base64Data;
                conver.recipientImg = retrievedImage;
              } else
                conver.recipientImg = false;
            }
          );
          conver.order = 'end';
          this.headerService.addConversation(conver);
        }
        if (conversations.length == 10)
          this.headerService.setLoadMoreConversation(true);
        else
          this.headerService.setLoadMoreConversation(false);
        this.headerService.setParentHeader('message');
        this.conversationPage += 1;
      }
    );
  }

  openFullConversation(conver: OpenConversation) {
    if (!this.openConversation || this.openConversation.conversationId != conver.conversationId) {
      this.loadMoreMessage = true;
      this.openConversation = conver;
      this.getConversationMessages(true);
    }
  }

  getConversationMessages(firstTime: boolean) {
    this.loadingMessages=true;
    if (this.loadMoreMessage == true) {
      this.conversationService.getMessagesByConversationId(this.openConversation.conversationId, this.openConversation.messagePage, 20).subscribe(
        async res => {
          let messages: MessageGet[] = res;
          for (let message of messages)
            this.openConversation.messages.unshift(message);
          if (firstTime == true) {
            await this.sleep(1);
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
          }
          else if (firstTime == false) {
            await this.sleep(1);
            this.messagesContainer.nativeElement.scroll({
              top: document.getElementById(messages[0].messageDate).getBoundingClientRect().top - document.getElementById("messagesContainer").getBoundingClientRect().top + 10,
              left: 0,
              behavior: 'smooth'
            });
          }
          if (messages.length == 20)
            this.loadMoreMessage = true;
          else
            this.loadMoreMessage = false;
          this.openConversation.messagePage += 1;
          this.loadingMessages=false;
        }
      );
    }
  }

  @HostListener('scroll', ['$event'])
  messagesScroll(event) {
    if (document.getElementById("messagesContainer").scrollTop < 10 && this.loadMoreMessage == true && this.loadingMessages == false) 
      this.getConversationMessages(false);
  }

  sendMessage() {
    if (this.message && this.message.length != 0) {
      this.conversationService.sendMessage(this.doctorGet.userId, this.openConversation.userId, this.message, this.openConversation.conversationId).subscribe(
        async res => {
          let response: StringGet = res;
          if (response.string.length != 0) {
            if (this.message.length > 10)
              this.message = this.message.slice(0, 7) + '...';
            let message: MessageGet = { messageContent: this.message, senderId: this.doctorGet.userId, recipientId: this.openConversation.userId, messageDate: response.string, conversationId: this.openConversation.conversationId }
            this.openConversation.messages.push(message);
            this.headerService.newMessage(message);
            this.message = '';
            await this.sleep(1);
            this.scrollToBottomMessages();
            this.headerService.setFirstConversation(this.openConversation.conversationId);
            this.openConversation.isUnread = true;
            let data: IdAndBoolean = { id: this.openConversation.conversationId, boolean: true, lastMessageSenderId: this.doctorGet.userId };
            this.headerService.setReadConversation(data);
            this.openConversation.lastMessageSenderId = this.doctorGet.userId;
          }
        }
      );
    }
  }

  messageSound() {
    let audio = new Audio();
    audio.src = "../../../../assets/sounds/messageSound.wav";
    audio.load();
    audio.play();
  }

  notificationSound() {
    let audio = new Audio();
    audio.src = "../../../../assets/sounds/notificationSound.wav";
    audio.load();
    audio.play();
  }

  startConversation(userId: number, firstName: string, lastName: string) {
    this.conversationService.addConversation(this.doctorGet.userId, userId).subscribe(
      res => {
        let conversation: Conversation = res;
        let conv: ConversationGet = {
          recipient: userId,
          open_date: conversation.openDate,
          last_name: lastName,
          conversation_id: conversation.conversationId,
          last_update_date: conversation.openDate,
          first_name: firstName,
          conversation_status: 'open',
          recipientImg: false,
          user_type: '',
          message_content: conversation.messageContent,
          order: 'start',
          is_unread: false,
          last_message_sender_id: 0
        }
        let retrieveResonse: any;
        let base64Data: any;
        let retrievedImage: any;
        this.doctorService.getDoctorPofilePhoto(userId + 'profilePic').subscribe(
          res => {
            if (res != null) {
              retrieveResonse = res;
              base64Data = retrieveResonse.picByte;
              retrievedImage = 'data:image/jpeg;base64,' + base64Data;
              conv.recipientImg = retrievedImage;
            }
          }
        );
        this.headerService.addConversation(conv);
        this.loadMoreMessage = false;
        this.headerService.setParentHeader('message');

        let openConver: OpenConversation = {
          conversationId: conv.conversation_id,
          username: firstName + ' ' + lastName.toUpperCase(),
          messagePage: 0,
          messages: [],
          openFullConver: true,
          userId: conv.recipient,
          userImg: conv.recipientImg,
          isUnread: conv.is_unread,
          lastMessageSenderId: conv.last_message_sender_id
        };
        this.openFullConversation(openConver);
      }
    );
  }

  readConversation() {
    if (this.openConversation.isUnread == true) {
      this.conversationService.readConversationById(this.openConversation.conversationId, this.openConversation.userId).subscribe(
        res => {
          if (res)
            this.openConversation.isUnread = false;
          let data: IdAndBoolean = { id: this.openConversation.conversationId, boolean: false, lastMessageSenderId: 0 };
          this.headerService.setReadConversation(data);
        }
      );
    }
  }
}