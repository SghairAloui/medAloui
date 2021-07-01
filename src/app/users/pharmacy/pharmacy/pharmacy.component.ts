import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from 'src/app/Headers/header/header.service';
import { ConversationService } from 'src/app/services/conversation.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PrescriptionService } from 'src/app/services/prescription.service';
import { UserService } from 'src/app/services/user.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { Conversation } from 'src/model/Conversation';
import { ConversationGet } from 'src/model/ConversationGet';
import { IdAndBoolean } from 'src/model/IdAndBoolean';
import { MedicamentStockGet } from 'src/model/MedicamentStockGet';
import { MessageGet } from 'src/model/MessageGet';
import { NotificationGet } from 'src/model/NotificationGet';
import { OneStringPost } from 'src/model/OneStringPost';
import { OpenConversation } from 'src/model/OpenConversation';
import { PharmacyGet } from 'src/model/PharmacyGet';
import { PharmacyPostWithSecureLogin } from 'src/model/PharmacyPostWithSecureLogin';
import { PrescriptionMedicament } from 'src/model/PrescriptionMedicament';
import { ReturnWithPag } from 'src/model/ReturnWithPag';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { StringGet } from 'src/model/StringGet';
import { TwoStringsPost } from 'src/model/TwoStringsPost';
import { UpdatePasswordPost } from 'src/model/UpdatePasswordPost';
import { UserSearchGet } from 'src/model/UserSearchGet';
import { WebSocketNotification } from 'src/model/WebSocketNotification';
import { DoctorService } from '../../doctor/doctor/doctor.service';
import { PharmacyService } from '../pharmacy.service';
import jwt_decode from 'jwt-decode';

declare const L: any;

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {

  constructor(private translate: TranslateService,
    private pharmacyService: PharmacyService,
    private headerService: HeaderService,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService,
    private doctorService: DoctorService,
    private notificationService: NotificationService,
    private conversationService: ConversationService,
    private webSocketService: WebSocketService,
    private prescriptionService: PrescriptionService) {
    // Open connection with server socket
    let stompClient = this.webSocketService.connect();
    stompClient.connect({}, async frame => {

      // Subscribe to notification topic
      stompClient.subscribe('/topic/notification/' + this.pharmacyGet.userId, async message => {
        let not: WebSocketNotification = JSON.parse(message.body);
        if (not.type == 'seen') {
          if (this.openConversation.conversationId == parseInt(not.data))
            this.openConversation.isUnread = false;
          let data: IdAndBoolean = { id: parseInt(not.data), boolean: false, lastMessageSenderId: 0 };
          this.headerService.setReadConversation(data);
          this.scrollToBottomMessages();
        } else if (not.type == 'message') {
          if (this.openConversation && this.openConversation.conversationId == not.message.conversationId) {
            this.openConversation.isUnread = true;
            this.openConversation.lastMessageSenderId = not.message.senderId;
            this.openConversation.messages.push(not.message);
            await this.sleep(1);
            this.scrollToBottomMessages();
            this.messageSound();
            this.headerService.newMessage(not.message);
            this.headerService.setFirstConversation(not.message.conversationId);
          }
          else {
            this.newMessage += 1;
            let i: number = 0;
            for (let conv of this.smallConversations) {
              if (conv.conversationId == not.message.conversationId) {
                this.smallConversations[i].isUnread = true;
                this.smallConversations[i].lastMessageSenderId = not.message.senderId;
                let message: MessageGet = { messageContent: not.message.messageContent, senderId: not.message.senderId, recipientId: not.message.recipientId, messageDate: not.message.messageDate, conversationId: not.message.conversationId }
                this.smallConversations[i].messages.push(message);
                break;
              }
              i += 1;
            }
            this.toastr.info(this.translate.instant('newMessage'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.notificationSound();
            this.headerService.setFirstConversation(not.message.conversationId);
            let data: IdAndBoolean = { id: not.message.conversationId, boolean: true, lastMessageSenderId: not.message.senderId };
            this.headerService.setReadConversation(data);
            this.headerService.newMessage(not.message);
          }
        } else if (not.type == 'notification') {
          not.notification.order = 'start';
          if (not.notification.notificationType == 'openConversationRequest') {
            this.toastr.info(this.translate.instant(not.data + ' ' + this.translate.instant('sentYouReq')), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
          } else if (not.notification.notificationType == 'conversationclose') {
            this.toastr.info(this.translate.instant(not.data + ' ' + this.translate.instant('closeConversation')), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });

            if (this.openConversation && parseInt(not.notification.notificationParameter) == this.openConversation.conversationId) {
              this.openConversation.conversationStatus = 'close';
              this.openConversation.statusUpdatedBy = not.notification.senderId;
            } else if (this.smallConversations) {
              let i: number = 0;
              for (let conv of this.smallConversations) {
                if (conv.conversationId == parseInt(not.notification.notificationParameter)) {
                  this.smallConversations[i].conversationStatus = 'close';
                  this.smallConversations[i].statusUpdatedBy = not.notification.senderId;
                  break;
                }
                i = +1;
              }
            }

          } else if (not.notification.notificationType == 'conversationopen') {
            this.toastr.info(this.translate.instant(not.data + ' ' + this.translate.instant('openConversation')), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });

            if (this.openConversation && parseInt(not.notification.notificationParameter) == this.openConversation.conversationId) {
              this.openConversation.conversationStatus = 'open';
              this.openConversation.statusUpdatedBy = 0;
            } else if (this.smallConversations) {
              let i: number = 0;
              for (let conv of this.smallConversations) {
                if (conv.conversationId == parseInt(not.notification.notificationParameter)) {
                  this.smallConversations[i].conversationStatus = 'open';
                  this.smallConversations[i].statusUpdatedBy = 0;
                  break;
                }
                i = +1;
              }
            }

          } else if (not.notification.notificationType == 'userSelectYouForPres') {
            this.toastr.info(this.translate.instant(not.data + ' ' + this.translate.instant('selectYouForPres')), this.translate.instant('prescription'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.getTodayPrescriptionNumberById();
            this.todaysPresNumberChanged = true;
          }
          if (not.notification.notificationType != 'userSelectYouForPres') {
            not.notification.name = not.data;
            this.headerService.addNotification(not.notification);
          }
          this.notificationSound();
        } else if (not.type == 'info') {
          if (not.data == "approvedByAdmin") {
            this.toastr.success(this.translate.instant('congYourAccountApp'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.pharmacyGet.pharmacyStatus = 'approvedByAdmin';
          } else if (not.data == "disapprovedByAdmin") {
            this.toastr.warning(this.translate.instant('accountDis'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.pharmacyGet.pharmacyStatus = 'disapprovedByAdmin';
          } else if (not.data == "disapprovedPermanently") {
            this.toastr.warning(this.translate.instant('accountDisPerma'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.pharmacyGet.pharmacyStatus = 'disapprovedPermanently';
          }
        }
      })
    });
  }
  pharmacyPostWithSecureLogin: PharmacyPostWithSecureLogin;
  secureLoginString: SecureLoginString;
  re = /^[A-Za-z-' ']+$/;
  generalInfo: string = 'show';
  pharmacyGet: PharmacyGet;
  pharmacyInfo: boolean;
  pharmacyName: string;
  invalidPharmacyNameVariable: boolean;
  pharmacyNameInformation: string;
  adress: string;
  cities: string[] = ["Ariana", this.translate.instant('Beja'), "Ben Arous", "Bizerte", this.translate.instant('Gabes'), "Gafsa", "Jendouba", "Kairouan", "Kasserine", this.translate.instant('Kebili'), "Kef", "Mahdia", "Manouba", this.translate.instant('Medenine'), "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];
  invalidAdressVariable: boolean;
  adressInformation: string;
  disableSaveBtn: boolean = true;
  mail: string; password: string;
  disableUpdateUsernamePassBtn: boolean = false;
  editPassword: boolean;
  editeSecureInfo: boolean = false;
  passwordRepeatInfromation: string;
  passwordInfromation: string;
  mailInformation: string;
  invalidMailVariable: boolean; invalidPasswordVariable: boolean;
  twoStringsPost: TwoStringsPost;
  passwordRepeat: string; invalidPasswordRepeatVariable: boolean;
  updatePasswordPost: UpdatePasswordPost;
  selectedFile: File;
  excelFile: File;
  retrievedImage: any;
  base64Data: any;
  retrieveResonse: any;
  container: string = 'profile';
  passwordDis: boolean = true;
  cinPic: Boolean = false; pharmacyOwnershipPic: Boolean = false; pharmacySpecialty: Boolean = false;
  notApproved: string = 'info';
  deleteAccount: boolean = false;
  exactAddress: string; exactAddressInformation: string; invalidExactAddress: boolean = false;
  nightPh: boolean = false; dayPh: boolean = false; accountType: boolean = false;
  myMedicamentNumber: number = 0; savingExcelFile: boolean = false;
  medicamentName: string; myMedicaments: MedicamentStockGet[] = [];
  notificationPage: number = 0;
  geoNotId: number = 0;
  position: boolean = false;
  notVerified: boolean;
  field1Code: string; field2Code: string; field3Code: string; field4Code: string; field5Code: string;
  isVerificationCode: boolean;
  conversationPage: number = 0;
  openConversation: OpenConversation;
  smallConversations: OpenConversation[] = [];
  message: string;
  hoveredPrescription: number = -2;

  @ViewChild('messagesContainer') private messagesContainer: ElementRef;
  loadingMessages: boolean = false;
  searchedUsers: UserSearchGet[] = [];
  loadMoreUsers: boolean;
  selectedUser: UserSearchGet;
  myMap;
  popUp: boolean = false;
  popUpTitle: string;
  popUpText: string;
  popUpFor: string;
  confirming: boolean = false;
  popUpValue1: string;
  popUpValue2: string;
  popUpValue3: string;
  todaysPresNumber: number = 0;
  todaysPresNumberChanged: boolean = false;
  pharmacyPrescriptionsPage: number = 0;
  pharmacyPrescriptions: ReturnWithPag;
  loadingPrescriptions: boolean = true;
  newMessage: number = 0;
  showMyPres: boolean;
  prescriptionMeds: PrescriptionMedicament[];

  ngOnInit(): void {
    this.headerService.setHeader('pharmacy');
    this.pharmacyInfo = false;
    this.getUserInfo();
  }

  scrollToBottomMessages(): void {
    this.messagesContainer.nativeElement.scroll({
      top: this.messagesContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  checkForm() {
    //name
    if (this.pharmacyName.length < 3) {
      this.invalidPharmacyNameVariable = true;
      this.pharmacyNameInformation = this.translate.instant('nameFirst');
    } else {
      if (this.re.test(this.pharmacyName)) {
        this.invalidPharmacyNameVariable = false;
        this.pharmacyNameInformation = this.translate.instant('pharmacyName');
      }
      else {
        this.invalidPharmacyNameVariable = true;
        this.pharmacyNameInformation = this.translate.instant('nameApha');
      }
    }

    //address
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

    if (!this.invalidAdressVariable && !this.invalidPharmacyNameVariable) {
      let data: PharmacyPostWithSecureLogin = new PharmacyPostWithSecureLogin(this.pharmacyName, this.adress, this.pharmacyGet.userId);
      this.pharmacyService.updatePharmacyInfoById(data).subscribe(
        res => {
          if (res) {
            this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('update'), {
              timeOut: 3500,
              positionClass: 'toast-bottom-left'
            });
            this.generalInfo = 'show';
            document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
            this.pharmacyGet.pharmacyFullName = this.pharmacyName;
            this.pharmacyGet.userCity = this.adress
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

  getMyNotifications(userId: number) {
    this.notificationService.getAllNotificationByUserId(userId, this.notificationPage, 5).subscribe(
      res => {
        let notifications: NotificationGet[] = [];
        notifications = res;
        for (let notification of notifications) {
          notification.order = 'end';
          this.headerService.addNotification(notification);
          if (notification.notificationType == 'setYourGeoLocation')
            this.geoNotId = notification.notificationId;
        }
        if (notifications.length == 6)
          this.headerService.setLoadMoreNotification(true);
        else
          this.headerService.setLoadMoreNotification(false);
        this.notificationPage += 1;
      }
    );
  }

  userInfoLoaded: boolean = false;
  getUserInfo() {
    let token:any = jwt_decode(sessionStorage.getItem('auth-token'));
    this.pharmacyService.getPharmacyInfo(parseInt(token.jti)).subscribe(
      res => {
        if (res) {
          this.pharmacyGet = res;
          if (parseInt(this.pharmacyGet.pharmacyStatus) <= 99999 && parseInt(this.pharmacyGet.pharmacyStatus) >= 10000) {
            this.notVerified = true;
            this.userInfoLoaded = true;
          }
          else {
            this.notVerified = false;
            this.headerService.setHeader('pharmacy');
            this.openMessages(true);
            this.getImage();
            this.getTodayPrescriptionNumberById();
            this.getMyNotifications(this.pharmacyGet.userId);
            this.setPharmacyPosition();
            this.getStockNumberByPharmacyId();
            this.intializeEdit();
            if (this.pharmacyGet.pharmacyStatus == 'notApproved' || this.pharmacyGet.pharmacyStatus == 'disapproved') {
              this.checkDocDocument(this.pharmacyGet.userId + "pharmacyCinPic");
              this.checkDocDocument(this.pharmacyGet.userId + "pharmacyOwnershipPic");
              this.checkDocDocument(this.pharmacyGet.userId + "pharmacySpecialty");
              this.exactAddressInformation = this.translate.instant('exactAddress');
            }
            if (this.pharmacyGet.pharmacyStatus == 'disapprovedPermanently')
              this.deleteByUserId();
            this.pharmacyInfo = true;
            localStorage.setItem('id', this.pharmacyGet.userId + '');
            this.userInfoLoaded = true;
          }
        } else {
          this.router.navigate(['/acceuil']);
          this.userInfoLoaded = true;
        }
      },
      err => {
        this.router.navigate(['/acceuil']);
      }
    );
  }

  async setPharmacyPosition() {
    if (!navigator.geolocation) {
      console.log('not supported');
    }
    if (this.pharmacyGet.pharmacyLatitude && this.pharmacyGet.pharmacyLongitude) {
      this.position = true;
      let container = document.getElementById('map');
      while (!container) {
        container = document.getElementById('map');
        await this.sleep(500);
      }
      let myMap = L.map('map').setView([this.pharmacyGet.pharmacyLatitude, this.pharmacyGet.pharmacyLongitude], 13);

      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVzc2FhZGlpIiwiYSI6ImNrbzE3ZHZwbzA1djEyb3M1bzY4cmw1ejYifQ.cisRE8KJri7O9GD3KkMCCg', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'your.mapbox.access.token'
      }).addTo(myMap);

      let marker = L.marker([this.pharmacyGet.pharmacyLatitude, this.pharmacyGet.pharmacyLongitude]).addTo(myMap);
      marker.bindPopup(this.translate.instant('helloIm') + "<br><b> Ph. " + this.pharmacyGet.pharmacyFullName + "</b>").openPopup();
    }
  }

  updateMyPosition() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.pharmacyService.updatePositionById(this.pharmacyGet.userId, position.coords.latitude.toString(), position.coords.longitude.toString()).subscribe(
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
                    this.pharmacyGet.pharmacyLatitude = position.coords.latitude.toString();
                    this.pharmacyGet.pharmacyLongitude = position.coords.longitude.toString();
                    this.setPharmacyPosition();
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
              this.pharmacyGet.pharmacyLatitude = position.coords.latitude.toString();
              this.pharmacyGet.pharmacyLongitude = position.coords.longitude.toString();
              this.setPharmacyPosition();
            }
          }
        }
      );
    });
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
      this.updatePasswordPost = new UpdatePasswordPost(this.pharmacyGet.userId, this.passwordRepeat);
      this.userService.updateUserPasswordById(this.updatePasswordPost).subscribe(
        async res => {
          if (!res) {
            this.toastr.warning(this.translate.instant('applicationDataChanged'), this.translate.instant('Data'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            localStorage.setItem('secureLogin', '');
            localStorage.setItem('id', '');
            await this.sleep(1);
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
    this.pharmacyName = this.pharmacyGet.pharmacyFullName;
    this.mail = this.pharmacyGet.userUsername;
    this.adress = this.pharmacyGet.userCity;
  }

  initializeEditLabel() {
    this.pharmacyNameInformation = this.translate.instant('pharmacyName');
    this.passwordRepeatInfromation = this.translate.instant('repeatPassword');
    this.passwordInfromation = this.translate.instant('password');
    this.mailInformation = this.translate.instant('mail');
    this.adressInformation = this.translate.instant('city');
    document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
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

  comparePharmacyName() {
    if (this.pharmacyName.toLowerCase() === this.pharmacyGet.pharmacyFullName)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }

  compareUserName() {
    if (this.mail.toLowerCase() === this.pharmacyGet.userUsername)
      this.disableUpdateUsernamePassBtn = true;
    else
      this.disableUpdateUsernamePassBtn = false;
  }

  compareCity() {
    if (this.adress.toLowerCase() === this.pharmacyGet.userCity)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.pharmacyGet.userId + "profilePic");
    this.getImage();
  }

  onUpload(imageName: string) {
    const uploadImageData = new FormData();
    uploadImageData.append('imageFile', this.selectedFile, imageName);
    this.pharmacyService.updatePharmacyProfilePhoto(uploadImageData).subscribe(
      res => {
        if (res == 'imageUpdated') {
          if (imageName == this.pharmacyGet.userId + "pharmacyCinPic")
            this.cinPic = true;
          else if (imageName == this.pharmacyGet.userId + "pharmacyOwnershipPic")
            this.pharmacyOwnershipPic = true;
          else if (imageName == this.pharmacyGet.userId + "pharmacySpecialty")
            this.pharmacySpecialty = true;
          else
            this.getImage();
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

  getImage() {
    this.pharmacyService.getPharmacyPofilePhoto(this.pharmacyGet.userId + "profilePic").subscribe(
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
  }

  onFileChangedCin(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.pharmacyGet.userId + "pharmacyCinPic");
  }

  onFileChangedMedicalClinic(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.pharmacyGet.userId + "pharmacyOwnershipPic");
  }

  onFileChangedMedicalSpecialty(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.pharmacyGet.userId + "pharmacySpecialty");
  }

  checkDocDocument(imageName: string) {
    let oneStringPost: OneStringPost = new OneStringPost(imageName);
    this.doctorService.checkIfDocumentExist(oneStringPost).subscribe(
      res => {
        if (res == true) {
          if (imageName == this.pharmacyGet.userId + "pharmacyCinPic")
            this.cinPic = true;
          else if (imageName == this.pharmacyGet.userId + "pharmacyOwnershipPic")
            this.pharmacyOwnershipPic = true;
          else if (imageName == this.pharmacyGet.userId + "pharmacySpecialty")
            this.pharmacySpecialty = true;
        }
      }
    );
  }

  submitPharmacyDocuments() {
    if (!this.dayPh && !this.nightPh)
      this.accountType = true;
    else if (this.exactAddress == null) {
      this.invalidExactAddress = true;
      this.exactAddressInformation = this.translate.instant('enterValidAddress');
    }
    else if (this.exactAddress.length < 6) {
      this.invalidExactAddress = true;
      this.exactAddressInformation = this.translate.instant('enterValidAddress');
    }
    else {
      let status: string;
      if (this.pharmacyGet.pharmacyStatus == 'notApproved')
        status = 'pending';
      else if (this.pharmacyGet.pharmacyStatus == 'disapproved')
        status = 'reVerify';

      let pharmacyType: string;
      if (this.dayPh)
        pharmacyType = 'day';
      else if (this.nightPh)
        pharmacyType = 'night';

      this.pharmacyService.changePharamcyStatusAndSettingsById(this.pharmacyGet.userId, status, this.exactAddress, pharmacyType).subscribe(
        res => {
          if (res) {
            this.pharmacyGet.pharmacyStatus = status;
          }
        }
      );
    }
  }

  toNotApprovedSection() {
    document.getElementById("approvePharmacySection").scrollIntoView({ behavior: 'smooth' });
  }

  deleteByUserId() {
    this.pharmacyService.deleteByUserId(this.pharmacyGet.userId).subscribe(
      res => {
        if (res) {
          this.toastr.warning(this.translate.instant('accountDeleted'), this.translate.instant('info'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
          this.deleteAccount = true;
        }
      }
    );
  }

  toapprovedByAdminSection() {
    document.getElementById("approvedByAdminSection").scrollIntoView({ behavior: 'smooth' });
  }

  getStockNumberByPharmacyId() {
    this.pharmacyService.getStockNumberByPharmacyId(this.pharmacyGet.userId).subscribe(
      res => {
        this.myMedicamentNumber = res;
      }
    );
  }

  saveExcelFile(event) {
    this.excelFile = null;
    this.excelFile = event.target.files[0];
    if (this.excelFile.name.length != 0) {
      this.savingExcelFile = true;
      this.uploadPharmacyMedicaments();
    }
  }

  uploadPharmacyMedicaments() {
    let uploadExcelFileData = new FormData();
    uploadExcelFileData.append('file', this.excelFile);
    this.pharmacyService.deleteByPharmacyId(this.pharmacyGet.userId).subscribe(
      res => {
        if (res) {
          this.pharmacyService.importExcelFile(this.pharmacyGet.userId, uploadExcelFileData).subscribe(
            res => {
              this.toastr.success(this.translate.instant('medicamentsUpdated'), this.translate.instant('info'), {
                timeOut: 3500,
                positionClass: 'toast-bottom-left'
              });
              this.savingExcelFile = false;
              this.getStockNumberByPharmacyId();
            },
            err => {
              this.toastr.warning(this.translate.instant('fileNotValid'), this.translate.instant('info'), {
                timeOut: 3500,
                positionClass: 'toast-bottom-left'
              });
              this.savingExcelFile = false;
            }
          );
        }
      }
    );
  }

  searchMedByNameAndPharmacyId() {
    let medSearch: string = '%' + this.medicamentName.split(' ').join('% %') + '%';
    this.pharmacyService.searchMedByNameAndPharmacyId(this.pharmacyGet.userId, medSearch).subscribe(
      res => {
        let response: MedicamentStockGet[] = [];
        response = res;
        this.myMedicaments = [];
        for (let med of response) {
          med.deleted = false;
          this.myMedicaments.push(med);
        }
      }
    );
  }

  deleteByMedicamentStockId(stockId: number, medKey: number) {
    this.pharmacyService.deleteByMedicamentStockId(stockId).subscribe(
      res => {
        if (res) {
          this.toastr.success(this.translate.instant('stockDeleted'), this.translate.instant('info'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
          this.confirming = false;
          this.closePopUp();
          this.myMedicaments[medKey].deleted = true;
          this.myMedicamentNumber -= 1;
        }
      }
    );
  }

  checkVerificationCode() {
    let code: number = parseInt(this.field1Code + this.field2Code + this.field3Code + this.field4Code + this.field5Code);
    if (code) {
      this.userService.checkVerifacationCode(this.pharmacyGet.userUsername, code).subscribe(
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
    this.userService.updateUserStatusByEmail(this.pharmacyGet.userUsername, 'notApproved').subscribe(
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

  openMessages(firstTime: boolean) {
    this.conversationService.getConversationByUserId(this.pharmacyGet.userId, this.conversationPage, 10).subscribe(
      res => {
        let conversations: ConversationGet[] = res;
        console.log(conversations)
        for (let conver of conversations) {
          if (conver.message_content.length >= 10)
            conver.message_content = conver.message_content.slice(0, 7) + '...';
          if (conver.is_unread == true && conver.last_message_sender_id != this.pharmacyGet.userId)
            this.newMessage += 1;
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
        if (firstTime == false)
          this.headerService.showChildHeader(true);      
      }
    );
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

  async showFullconv(convKey: number) {
    this.openConversation = this.smallConversations[convKey];
    this.smallConversations.splice(convKey, 1);
    await this.sleep(1);
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    if (this.openConversation.isUnread == true)
      this.readConversation(this.openConversation.lastMessageSenderId);
  }

  readConversation(lastSenderId: number) {
    if (this.openConversation.isUnread == true && lastSenderId != this.pharmacyGet.userId) {
      this.conversationService.readConversationById(this.openConversation.conversationId, this.openConversation.userId).subscribe(
        res => {
          if (res) {
            this.newMessage -= 1;
            this.openConversation.isUnread = false;
            let data: IdAndBoolean = { id: this.openConversation.conversationId, boolean: false, lastMessageSenderId: 0 };
            this.headerService.setReadConversation(data);
          }
        }
      );
    }
  }

  closeSmallConv(convKey: number) {
    this.smallConversations.splice(convKey, 1);
    if (this.smallConversations[convKey].conversationId == this.openConversation.conversationId)
      this.openConversation = null;
  }

  restoreConversation() {
    let convFound: boolean = false;
    let i: number = 0;
    for (let conv of this.smallConversations) {
      if (conv.conversationId == this.openConversation.conversationId) {
        convFound = true;
        break;
      }
      i += 1;
    }
    if (convFound == false) {
      if (this.smallConversations.length == 3)
        this.smallConversations.splice(0, 1);
      this.smallConversations.push(this.openConversation);
    } else {
      let newOrdConv: OpenConversation = this.smallConversations[i];
      this.smallConversations.splice(i, 1);
      this.smallConversations.push(newOrdConv);
    }
    this.openConversation = null;
  }

  updateConversationStatusById(conversationId: number, status: string, userId: number) {
    this.conversationService.updateConversationStatusById(conversationId, status, this.pharmacyGet.userId, userId).subscribe(
      res => {
        if (res) {
          this.openConversation.conversationStatus = status;
          if (status == 'close')
            this.openConversation.statusUpdatedBy = this.pharmacyGet.userId;
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

  @HostListener('scroll', ['$event'])
  messagesScroll(event) {
    if (document.getElementById("messagesContainer").scrollTop < 10 && this.openConversation.loadMoreMessage == true && this.loadingMessages == false)
      this.getConversationMessages(false);
  }

  getConversationMessages(firstTime: boolean) {
    this.loadingMessages = true;
    if (this.openConversation.loadMoreMessage == true) {
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
              top: document.getElementById("message" + messages.length).getBoundingClientRect().top - document.getElementById("messagesContainer").getBoundingClientRect().top,
              left: 0
            });
          }
          if (messages.length == 20)
            this.openConversation.loadMoreMessage = true;
          else
            this.openConversation.loadMoreMessage = false;
          this.openConversation.messagePage += 1;
          this.loadingMessages = false;
        }
      );
    }
  }

  sendMessage() {
    if (this.message && this.message.length != 0) {
      this.conversationService.sendMessage(this.pharmacyGet.userId, this.openConversation.userId, this.message, this.openConversation.conversationId).subscribe(
        async res => {
          let response: StringGet = res;
          if (response.string.length != 0) {
            let message: MessageGet = { messageContent: this.message, senderId: this.pharmacyGet.userId, recipientId: this.openConversation.userId, messageDate: response.string, conversationId: this.openConversation.conversationId }
            this.openConversation.messages.push(message);
            this.headerService.newMessage(message);
            this.message = '';
            await this.sleep(1);
            this.scrollToBottomMessages();
            this.headerService.setFirstConversation(this.openConversation.conversationId);
            this.openConversation.isUnread = true;
            let data: IdAndBoolean = { id: this.openConversation.conversationId, boolean: true, lastMessageSenderId: this.pharmacyGet.userId };
            this.headerService.setReadConversation(data);
            this.openConversation.lastMessageSenderId = this.pharmacyGet.userId;
          }
        }
      );
    }
  }

  openFullConversation(conver: OpenConversation) {
    if (!this.openConversation || this.openConversation.conversationId != conver.conversationId) {
      if (this.openConversation)
        this.restoreConversation();
      this.openConversation = conver;
      if (this.openConversation.isUnread == true)
        this.readConversation(this.openConversation.lastMessageSenderId);
      this.getConversationMessages(true);
      let i: number = 0;
      for (let conv of this.smallConversations) {
        if (conv.conversationId == this.openConversation.conversationId) {
          this.smallConversations.splice(i, 1);
          break;
        }
        i = +1;
      }
    }
  }

  startConversation(userId: number, firstName: string, lastName: string) {
    this.conversationService.addConversation(this.pharmacyGet.userId, userId).subscribe(
      res => {
        let conversation: Conversation = res;
        let conv: ConversationGet = {
          recipient: userId,
          open_date: conversation.openDate,
          last_name: lastName,
          conversation_id: conversation.conversationId,
          last_update_date: conversation.openDate,
          first_name: firstName,
          conversation_status: conversation.conversationStatus,
          recipientImg: false,
          user_type: '',
          message_content: conversation.messageContent,
          order: 'start',
          is_unread: false,
          last_message_sender_id: 0,
          status_updated_by: conversation.statusUpdatedBy
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
            } else
              conv.recipientImg = false;
          }
        );
        this.headerService.addConversation(conv);
        this.headerService.setParentHeader('message');

        let openConver: OpenConversation = {
          conversationId: conv.conversation_id,
          username: firstName + ' ' + lastName.toUpperCase(),
          messagePage: 0,
          messages: [],
          userId: conv.recipient,
          userImg: conv.recipientImg,
          isUnread: conv.is_unread,
          lastMessageSenderId: conv.last_message_sender_id,
          conversationStatus: conv.conversation_status,
          loadMoreMessage: true,
          statusUpdatedBy: conv.status_updated_by
        };
        this.openFullConversation(openConver);
      }
    );
  }

  findMoreUser() {
    this.headerService.searchUserNow(true);
  }

  showUserFullInfo(userKey: number) {
    this.selectedUser = this.searchedUsers[userKey];
    if (this.searchedUsers[userKey].userType == 'doctor' || this.searchedUsers[userKey].userType == 'pharmacist')
      this.setSelectedUserPosition();
    else {

    }
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  async setSelectedUserPosition() {
    if (this.selectedUser.userLatitude.length != 0 && this.selectedUser.userLongitude.length != 0) {
      let container = document.getElementById('selectedUserMap');
      while (!container) {
        container = document.getElementById('selectedUserMap');
        await this.sleep(500);
      }
      this.myMap = L.map('selectedUserMap').setView([this.selectedUser.userLatitude, this.selectedUser.userLongitude], 13);

      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWVzc2FhZGlpIiwiYSI6ImNrbzE3ZHZwbzA1djEyb3M1bzY4cmw1ejYifQ.cisRE8KJri7O9GD3KkMCCg', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'your.mapbox.access.token'
      }).addTo(this.myMap);

      let marker = L.marker([this.selectedUser.userLatitude, this.selectedUser.userLongitude]).addTo(this.myMap);
      marker.bindPopup(this.translate.instant('helloIm') + "<br><b> " + this.selectedUser.userFullName + "</b>").openPopup();
    }
  }

  addMapRoute() {
    navigator.geolocation.getCurrentPosition((position) => {
      L.Routing.control({
        waypoints: [
          L.latLng(position.coords.latitude, position.coords.longitude),
          L.latLng(this.selectedUser.userLatitude, this.selectedUser.userLongitude)
        ]
      }).addTo(this.myMap);
    }, function (e) {
      console.log(e.message);
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  }

  closePopUp() {
    this.popUp = false;
    this.popUpTitle = '';
    this.popUpText = '';
    this.popUpFor = '';
    this.popUpValue1 = '';
    this.popUpValue2 = '';
    this.popUpValue3 = '';
  }

  openPopUp(popUpFor: string, value1: string, value2: string) {
    this.popUpFor = popUpFor;
    this.popUpValue1 = value1;
    this.popUpValue2 = value2;
    if (popUpFor == 'confirmDeleteMedicament') {
      this.popUpTitle = this.translate.instant('confirmDelete');
      this.popUpText = this.translate.instant('confirmToDeleteStock') + ' ' + this.myMedicaments[parseInt(value2)].medicamentName.toLocaleUpperCase() + ', ' + this.translate.instant('thisActionIsIree') + ', ' + this.translate.instant('confirmToDelete') + '?';
    }
    this.popUp = true;
  }

  confirmPopUp() {
    this.confirming = true;
    if (this.popUpFor == 'confirmDeleteMedicament')
      this.deleteByMedicamentStockId(parseInt(this.popUpValue1), parseInt(this.popUpValue2));
    else if (this.popUpFor == 'prescriptionMeds')
      this.confirmPrescription();
  }

  getTodayPrescriptionNumberById() {
    this.pharmacyService.getTodayPrescriptionNumberById(this.pharmacyGet.userId).subscribe(
      res => {
        this.todaysPresNumber = res;
      }
    );
  }

  pharmacyPrescriptionsPages: number[] = [1, 2, 3, 4, 5];
  searchPrescription: string = '';
  getPharmacyPrescriptionsById() {
    this.showMyPres = true;
    if (this.searchPrescription == '') {
      this.pharmacyService.getPharmacyPrescriptionsById(this.pharmacyGet.userId, this.pharmacyPrescriptionsPage, 6).subscribe(
        async res => {
          let prescriptions: ReturnWithPag = res;

          if (this.pharmacyPrescriptionsPage == 0)
            this.pharmacyPrescriptions = { totalPages: (prescriptions.totalPages % 6), list: [] };

          this.pharmacyPrescriptions.list = prescriptions.list;

          this.loadingPrescriptions = false;
          await this.sleep(1);
          document.getElementById("allMyPrescriptions").scrollIntoView({ 'behavior': 'smooth' });
        },
        err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    } else {
      this.pharmacyService.searchPharamacyPrescriptionByPatientName('%' + this.searchPrescription.split(' ').join('% %') + '%', this.pharmacyGet.userId, this.pharmacyPrescriptionsPage, 6).subscribe(
        async res => {
          let prescriptions: ReturnWithPag = res;

          if (this.pharmacyPrescriptionsPage == 0)
            this.pharmacyPrescriptions = { totalPages: (prescriptions.totalPages % 6), list: [] };

          this.pharmacyPrescriptions.list = prescriptions.list;

          this.loadingPrescriptions = false;
          await this.sleep(1);
          document.getElementById("allMyPrescriptions").scrollIntoView({ 'behavior': 'smooth' });
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

  changePharmacyPrescriptionsPage(page: number) {
    this.loadingPrescriptions = true;
    this.pharmacyPrescriptionsPage = page;
    let j: number = 0;
    let endPage = page + 2;
    while ((page - 2) < 1) {
      page = page + 1;
    }
    if ((page + 2) > this.pharmacyPrescriptionsPage)
      endPage = this.pharmacyPrescriptionsPage;
    for (let i = (page - 2); i <= endPage; i++) {
      this.pharmacyPrescriptionsPages[j] = i;
      j++;
    }
    this.getPharmacyPrescriptionsById();
  }

  getMedicamentsByPrescriptionId(presId: number, name: string, index: string, patientId: number,) {
    this.prescriptionService.getMedicamentsByPrescriptionId(presId).subscribe(
      res => {
        this.prescriptionMeds = [];
        this.prescriptionMeds = res;
        this.popUpTitle = name;
        this.popUpFor = "prescriptionMeds";
        this.popUp = true;
        this.popUpValue1 = presId + "";
        this.popUpValue2 = index;
        this.popUpValue3 = patientId + "";
      }
    );
  }

  confirmPrescription() {
    console.log(this.popUpValue3)
    this.confirming = true;
    this.prescriptionService.confirmPrescriptionById(parseInt(this.popUpValue1), parseInt(this.field1Code + this.field2Code + this.field3Code + this.field4Code), parseInt(this.popUpValue3)).subscribe(
      res => {
        if (res == true) {
          this.pharmacyPrescriptions.list.splice(parseInt(this.popUpValue2), 1);
          this.closePopUp();
        }
        else
          this.isVerificationCode = false;
        this.confirming = false;
      }
    );
  }

  consoleelksjdflkjdfe() {
    console.log('ffff');
  }
}
