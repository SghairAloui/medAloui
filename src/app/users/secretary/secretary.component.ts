import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppointmentService } from 'src/app/appointment/appointment.service';
import { HeaderService } from 'src/app/Headers/header/header.service';
import { ConversationService } from 'src/app/services/conversation.service';
import { NotificationService } from 'src/app/services/notification.service';
import { QuestionService } from 'src/app/services/question.service';
import { UserService } from 'src/app/services/user.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { AppointmentForSec } from 'src/model/AppointmentForSec';
import { AppointmentForSecWithPag } from 'src/model/AppointmentForSecWithPag';
import { AppointmentGet } from 'src/model/AppointmentGet';
import { AppointmentInfoForSec } from 'src/model/AppointmentInfoForSec';
import { Conversation } from 'src/model/Conversation';
import { ConversationGet } from 'src/model/ConversationGet';
import { IdAndBoolean } from 'src/model/IdAndBoolean';
import { MessageGet } from 'src/model/MessageGet';
import { NotificationGet } from 'src/model/NotificationGet';
import { OpenConversation } from 'src/model/OpenConversation';
import { QuestionGet } from 'src/model/QuestionGet';
import { SecretaryInfo } from 'src/model/SecretaryInfo';
import { SecretaryWork } from 'src/model/SecretaryWork';
import { StringGet } from 'src/model/StringGet';
import { UserSearchGet } from 'src/model/UserSearchGet';
import { WebSocketNotification } from 'src/model/WebSocketNotification';
import { DoctorService } from '../doctor/doctor/doctor.service';
import { SecretaryService } from './secretary.service';

declare const L: any;

@Component({
  selector: 'app-secretary',
  templateUrl: './secretary.component.html',
  styleUrls: ['./secretary.component.css']
})
export class SecretaryComponent implements OnInit {

  constructor(private secretaryService: SecretaryService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private userService: UserService,
    private conversationService: ConversationService,
    private doctorService: DoctorService,
    private headerService: HeaderService,
    private webSocketService: WebSocketService,
    private router: Router,
    private questionService: QuestionService,
    private notificationService: NotificationService,
    private appointmentService: AppointmentService) {
    let stompClient = this.webSocketService.connect();
    stompClient.connect({}, frame => {

      // Subscribe to notification topic
      stompClient.subscribe('/topic/notification/' + this.secretaryGet.userId, async message => {
        let not: WebSocketNotification = JSON.parse(message.body);
        if (not.type == 'seen') {
          if (this.openConversation && this.openConversation.conversationId == parseInt(not.data))
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
          } else {
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
          if (not.notification.notificationType == 'conversationclose') {
            this.toastr.info(not.data + ' ' + this.translate.instant('closeConversation'), this.translate.instant('Notification'), {
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
            this.toastr.info(not.data + ' ' + this.translate.instant('openConversation'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });

            if (this.openConversation && parseInt(not.notification.notificationParameter) == this.openConversation.conversationId) {
              this.openConversation.conversationStatus = 'open';
              this.openConversation.statusUpdatedBy = not.notification.senderId;
            } else if (this.smallConversations) {
              let i: number = 0;
              for (let conv of this.smallConversations) {
                if (conv.conversationId == parseInt(not.notification.notificationParameter)) {
                  this.smallConversations[i].conversationStatus = 'open';
                  this.smallConversations[i].statusUpdatedBy = not.notification.senderId;
                  break;
                }
                i = +1;
              }
            }

          } else if (not.notification.notificationType == 'doctorAddedYou') {
            this.toastr.info(this.translate.instant('addedYouToHisSecretaryList'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
          } else if (not.notification.notificationType == 'seeSecretaryWorkRequest') {
            this.toastr.info(not.data + ' ' + this.translate.instant('wantToSeePersonalInfo'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
          } else if (not.notification.notificationType == 'changeAppDateReq') {
            this.toastr.info(not.extraData + ' ' + this.translate.instant('wantToChangeAppDate'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            if (this.pendingAppointment.list.length != 4)
              this.getAppointmentInfoById(parseInt(not.data));
            this.updatePendingRequestsPages((this.pendingAppointment.totalPages + 1));
          } else if (not.notification.notificationType == 'newAppointment') {
            this.toastr.info(not.data + ' ' + this.translate.instant('wantToTakeAnAppointment'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            if (this.pendingAppointment.list.length != 4)
              this.getAppointmentInfoById(parseInt(not.notification.notificationParameter));
            console.log(this.pendingAppointment.list.length);
            this.updatePendingRequestsPages((this.pendingAppointment.totalPages + 1));
          }
          if (not.notification.notificationType != 'newAppointment' && not.notification.notificationType != 'changeAppDateReq') {
            not.notification.name = not.data;
            this.headerService.addNotification(not.notification);
          }
          this.notificationSound();
        } else if (not.type == 'delayPatientTurn'){
          this.toastr.info(not.data + ' ' + this.translate.instant('postponeTheApp'), this.translate.instant('Notification'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.getCurrentPatient();
          this.notificationSound();
        } else if (not.type == 'nextPatient'){
          if(not.extraData != '0'){
            this.toastr.info(not.data + ' ' + this.translate.instant('getTheNextPat'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.getCurrentPatient();
          }else{
            this.toastr.info(not.data + ' ' + this.translate.instant('finishAllThePatients'), this.translate.instant('Notification'), {
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
            this.currentPatient=null;
          }

          this.notificationSound();
        }
      })
    });
  }

  ngOnInit(): void {
    this.getSecretaryInfo();
  }

  searchedUsers: UserSearchGet[] = [];
  container: string = 'profile';

  notVerified: boolean;
  secretaryGet: SecretaryInfo;
  generalInfo: string = 'show';
  loadMoreUsers: boolean;
  todayApp: AppointmentGet[] = [];
  tomorrowApp: AppointmentGet[] = [];
  todayAppPage: number = 0;
  tomorrowAppPage: number = 0;
  todayAppNumber: number;
  tomorrowAppNumber: number;
  todayPages: number[] = [];
  tomorrowPages: number[] = [];
  getSecretaryInfo() {
    this.secretaryService.getSecretaryInfoBySecureLogin(localStorage.getItem('secureLogin')).subscribe(
      res => {
        this.secretaryGet = res;
        if (parseInt(this.secretaryGet.secretaryStatus) >= 10000)
          this.notVerified = true;
        else {
          this.headerService.setHeader('secretary');
          this.notVerified = false;
          this.secretaryGet.profileImage = this.getSecProfileImage(this.secretaryGet.userId + "profilePic");
          this.getSecretaryWork();
          this.getMyNotifications(this.secretaryGet.userId);
          this.getUncofirmedApp();
          this.getCurrentPatient();
          let nowDate = new Date();
          this.getAppointmentNumberByDoctorIdAndDate(nowDate.getFullYear() + '/' + ((nowDate.getMonth() + 1) < 10 ? '0' + (nowDate.getMonth() + 1) : (nowDate.getMonth() + 1)) + '/' + (nowDate.getDate() < 10 ? '0' + nowDate.getDate() : nowDate.getDate())).then(
            (value) => {
              this.todayAppNumber = value;
              for (let i = 1; i <= Math.ceil(this.todayAppNumber / 6); i++)
                this.todayPages.push(i);
            });
          let tomorrwoDate = new Date(nowDate.setDate(nowDate.getDate() + 1));
          this.getAppointmentByDateAndDocId(tomorrwoDate.getFullYear() + '/' + ((tomorrwoDate.getMonth() + 1) < 10 ? '0' + (tomorrwoDate.getMonth() + 1) : (tomorrwoDate.getMonth() + 1)) + '/' + (tomorrwoDate.getDate() < 10 ? '0' + tomorrwoDate.getDate() : tomorrwoDate.getDate()), this.tomorrowAppPage).then(
            (value) => {
              this.tomorrowApp = value;
            });
          this.getAppointmentNumberByDoctorIdAndDate(tomorrwoDate.getFullYear() + '/' + ((tomorrwoDate.getMonth() + 1) < 10 ? '0' + (tomorrwoDate.getMonth() + 1) : (tomorrwoDate.getMonth() + 1)) + '/' + (tomorrwoDate.getDate() < 10 ? '0' + tomorrwoDate.getDate() : tomorrwoDate.getDate())).then(
            (value) => {
              this.tomorrowAppNumber = value;
              for (let i = 1; i <= Math.ceil(this.todayAppNumber / 6); i++)
                this.tomorrowPages.push(i);
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

  async getSecProfileImage(imgName: string) {
    let retrieveResonse: any;
    let base64Data: any;
    this.doctorService.getDoctorPofilePhoto(imgName).subscribe(
      res => {
        if (res != null) {
          retrieveResonse = res;
          base64Data = retrieveResonse.picByte;
          this.secretaryGet.profileImage = 'data:image/jpeg;base64,' + base64Data;
        } else
          this.secretaryGet.profileImage = false;
      },
      err => {
        this.toastr.info(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  notificationPage: number = 0;
  getMyNotifications(userId: number) {
    this.notificationService.getAllNotificationByUserId(userId, this.notificationPage, 5).subscribe(
      res => {
        let notifications: NotificationGet[] = [];
        notifications = res;
        for (let notification of notifications) {
          notification.order = 'end';
          this.headerService.addNotification(notification);
        }
        if (notifications.length == 6)
          this.headerService.setLoadMoreNotification(true);
        else
          this.headerService.setLoadMoreNotification(false);
        this.notificationPage += 1;
      }
    );
  }

  field1Code: string; field2Code: string; field3Code: string; field4Code: string; field5Code: string;
  isVerificationCode: boolean;
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
  checkVerificationCode() {
    let code: number = parseInt(this.field1Code + this.field2Code + this.field3Code + this.field4Code + this.field5Code);
    if (code) {
      this.userService.checkVerifacationCode(this.secretaryGet.userUsername, code).subscribe(
        res => {
          if (res == true)
            this.updateStatusByEmail();
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
    this.userService.updateUserStatusByEmail(this.secretaryGet.userUsername, 'approved').subscribe(
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

  conversationPage: number = 0;
  newMessage: number = 0;
  smallConversations: OpenConversation[] = [];
  openConversation: OpenConversation;
  openMessages() {
    this.conversationService.getConversationByUserId(this.secretaryGet.secureLogin, this.secretaryGet.userId, this.conversationPage, 10).subscribe(
      res => {
        let conversations: ConversationGet[] = res;
        for (let conver of conversations) {
          if (conver.message_content.length >= 10)
            conver.message_content = conver.message_content.slice(0, 7) + '...';
          if (conver.is_unread == true && conver.last_message_sender_id != this.secretaryGet.userId)
            this.newMessage += 1;
          this.doctorService.getDoctorPofilePhoto(conver.recipient + 'profilePic').subscribe(
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

  @ViewChild('messagesContainer') private messagesContainer: ElementRef;
  scrollToBottomMessages(): void {
    this.messagesContainer.nativeElement.scroll({
      top: this.messagesContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
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

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
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

  @HostListener('scroll', ['$event'])
  messagesScroll(event) {
    if (document.getElementById("messagesContainer").scrollTop < 10 && this.openConversation.loadMoreMessage == true && this.loadingMessages == false) {
      this.openConversation.loadMoreMessage = false;
      this.getConversationMessages(false);
    }
  }

  loadingMessages: boolean = false;
  getConversationMessages(firstTime: boolean) {
    this.loadingMessages = true;
    if (this.openConversation.loadMoreMessage == true) {
      this.conversationService.getMessagesByConversationId(this.openConversation.conversationId, this.openConversation.messagePage, 20).subscribe(
        async res => {
          let messages: MessageGet[] = res;
          for (let message of messages)
            this.openConversation.messages.unshift(message);
          if (firstTime) {
            await this.sleep(1);
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
          }
          else {
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

  readConversation(lastSenderId: number) {
    if (this.openConversation.isUnread == true && lastSenderId != this.secretaryGet.userId) {
      this.conversationService.readConversationById(this.openConversation.conversationId, this.openConversation.userId, this.secretaryGet.secureLogin).subscribe(
        res => {
          if (res) {
            this.openConversation.isUnread = false;
            this.newMessage -= 1;
            let data: IdAndBoolean = { id: this.openConversation.conversationId, boolean: false, lastMessageSenderId: 0 };
            this.headerService.setReadConversation(data);
          }
        }
      );
    }
  }

  message: string;
  sendMessage() {
    if (this.message && this.message.length != 0) {
      this.conversationService.sendMessage(this.secretaryGet.userId, this.openConversation.userId, this.message, this.openConversation.conversationId, this.secretaryGet.secureLogin).subscribe(
        async res => {
          let response: StringGet = res;
          if (response.string.length != 0) {
            let message: MessageGet = { messageContent: this.message, senderId: this.secretaryGet.userId, recipientId: this.openConversation.userId, messageDate: response.string, conversationId: this.openConversation.conversationId }
            this.openConversation.messages.push(message);
            this.headerService.newMessage(message);
            this.message = '';
            await this.sleep(1);
            this.scrollToBottomMessages();
            this.headerService.setFirstConversation(this.openConversation.conversationId);
            this.openConversation.isUnread = true;
            let data: IdAndBoolean = { id: this.openConversation.conversationId, boolean: true, lastMessageSenderId: this.secretaryGet.userId };
            this.headerService.setReadConversation(data);
            this.openConversation.lastMessageSenderId = this.secretaryGet.userId;
          }
        }
      );
    }
  }

  selectedFile: File;
  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.secretaryGet.userId + "profilePic");
  }

  onUpload(imageName: string) {
    const uploadImageData = new FormData();
    uploadImageData.append('imageFile', this.selectedFile, imageName);
    this.doctorService.updateDoctorProfilePhoto(uploadImageData).subscribe(
      res => {
        if (res == 'imageUpdated')
          this.getSecProfileImage(imageName);
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  invalidFirstNameVariable: boolean; invalidLastNameVariable: boolean; invalidMailVariable: boolean; invalidDayVariable: boolean; invalidMonthVariable: boolean; invalidYearVariable: boolean; invalidAdressVariable: boolean; invalidPasswordVariable: boolean; invalidPasswordRepeatVariable: boolean;
  passwordRepeatInfromation: string; passwordInfromation: string; firstNameInformation: string; lastNameInformation: string; mailInformation: string; dayInformation: string; monthInformation: string; yearInformation: string; adressInformation: string;
  firstName: string = ''; lastName: string = ''; mail: string = ''; day: string = ''; month: string = ''; year: string = ''; adress: string = ''; password: string = ''; passwordRepeat: string = '';
  days: number[] = [];
  months: number[] = [];
  years: number[] = [];
  cities: string[] = ["Ariana", this.translate.instant('Beja'), "Ben Arous", "Bizerte", this.translate.instant('Gabes'), "Gafsa", "Jendouba", "Kairouan", "Kasserine", this.translate.instant('Kebili'), "Kef", "Mahdia", "Manouba", this.translate.instant('Medenine'), "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];
  femaleCheckBox: boolean = false;
  maleCheckBox: boolean = false;
  editeSecureInfo: boolean = false;
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
    this.firstName = this.secretaryGet.secretaryFirstName;
    this.lastName = this.secretaryGet.secretaryLastName;
    this.mail = this.secretaryGet.userUsername;
    this.day = this.secretaryGet.secretaryBirthDay.slice(0, 2);
    this.month = this.secretaryGet.secretaryBirthDay.slice(3, 5);
    this.year = this.secretaryGet.secretaryBirthDay.slice(6, 10);
    this.adress = this.secretaryGet.userCity;
    if (this.secretaryGet.secretaryGender == 'male')
      this.maleCheckBox = true;
    else
      this.femaleCheckBox = true;
    for (let i = 1; i <= 31; i++)
      this.days.push(i);
    for (let i = 1; i <= 12; i++)
      this.months.push(i);
    for (let i = 2021; i >= 1900; i--)
      this.years.push(i);
    this.toGeneralInfoSection();
  }

  toGeneralInfoSection() {
    document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
  }

  editPassword: boolean;
  changePasswordClick() {
    this.editeSecureInfo = true;
    this.editPassword = true;
    document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
  }

  re = /^[A-Za-z]+$/;
  nb = /^\d+$/;
  checkForm() {
    this.checkFirstName();
    this.checkLastName();
    this.checkAdress();
    this.checkBirthday();
    if (!this.invalidAdressVariable && !this.invalidFirstNameVariable && !this.invalidLastNameVariable && !this.invalidDayVariable && !this.invalidMonthVariable && !this.invalidYearVariable) {
      this.updateSecretaryInfoBySecureLogin();
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

  disableSaveBtn: boolean = true;
  checkDisabledBtnFromMale() {
    if (this.secretaryGet.secretaryGender == 'female')
      this.disableSaveBtn = false;
    else
      this.disableSaveBtn = true;
  }
  checkDisabledBtnFromFemale() {
    if (this.secretaryGet.secretaryGender == 'male')
      this.disableSaveBtn = false;
    else
      this.disableSaveBtn = true;
  }
  compareFirstName() {
    if (this.firstName.toLowerCase() === this.secretaryGet.secretaryFirstName)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareLastName() {
    if (this.lastName.toLowerCase() === this.secretaryGet.secretaryLastName)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareDay() {
    if (this.day === this.secretaryGet.secretaryBirthDay.substr(0, 2))
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareMonth() {
    if (this.month === this.secretaryGet.secretaryBirthDay.substr(3, 2))
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareYear() {
    if (this.year === this.secretaryGet.secretaryBirthDay.substr(6, 4))
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }
  compareCity() {
    if (this.adress.toLowerCase() === this.secretaryGet.userCity)
      this.disableSaveBtn = true;
    else
      this.disableSaveBtn = false;
  }

  updateSecretaryInfoBySecureLogin() {
    let birthday: string = (this.day.length == 1 ? '0' + this.day : this.day) + '/' + (this.month.length == 1 ? '0' + this.month : this.month) + '/' + this.year;
    let gender: string;
    if (this.maleCheckBox == true)
      gender = 'male';
    else
      gender = 'female';
    this.secretaryService.updateSecretaryInfoBySecureLogin(this.firstName, this.lastName, birthday, this.adress, gender, this.secretaryGet.secureLogin).subscribe(
      res => {
        if (res) {
          this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('notification'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.generalInfo = 'show';
          this.editeSecureInfo = false;
          this.secretaryGet.secretaryFirstName = this.firstName;
          this.secretaryGet.secretaryLastName = this.lastName;
          this.secretaryGet.secretaryBirthDay = birthday;
          this.secretaryGet.userCity = this.adress;
          this.secretaryGet.secretaryGender = gender;
          this.disableSaveBtn = true;
          this.toGeneralInfoSection();
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
      this.secretaryService.updatePasswordBySecureLogin(this.passwordRepeat, this.secretaryGet.secureLogin).subscribe(
        async res => {
          this.router.navigate(['/acceuil']);
          this.toastr.success(this.translate.instant('passwordChanged'), this.translate.instant('info'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          localStorage.setItem('secureLogin', '');
          localStorage.setItem('id', '');
          await this.sleep(1);
          document.getElementById("connexionSection").scrollIntoView({ behavior: "smooth" });
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

  secretaryWork: SecretaryWork[] = [];
  getSecretaryWork() {
    this.secretaryService.getSecretaryWorkById(this.secretaryGet.userId).subscribe(
      res => {
        this.secretaryWork = res;
        for (let work of this.secretaryWork) {
          let retrieveResonse: any;
          let base64Data: any;
          this.doctorService.getDoctorPofilePhoto(work.doctorId + "profilePic").subscribe(
            res => {
              if (res != null) {
                retrieveResonse = res;
                base64Data = retrieveResonse.picByte;
                work.doctorImg = 'data:image/jpeg;base64,' + base64Data;
              } else
                work.doctorImg = false;
            }
          );
        }
      }
    );
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

  selectedUser: UserSearchGet;
  showUserFullInfo(userKey: number) {
    this.selectedUser = this.searchedUsers[userKey];
    if (this.searchedUsers[userKey].userType == 'doctor' || this.searchedUsers[userKey].userType == 'pharmacist')
      this.setSelectedUserPosition();
    else {
      this.selectedUser.patientQuestionsPage = 0;
      this.selectedUser.patientQuestions = [];
      this.getPatientQuestionsById(this.selectedUser.userId, this.selectedUser.patientQuestionsPage);
    }
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  myMap;
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
    });
  }

  getPatientQuestionsById(userId: number, pageNumber: number) {
    this.questionService.getQuestionsByUserId(userId, pageNumber, 4).subscribe(
      res => {
        let questions: QuestionGet[] = res;
        for (let ques of questions) {
          this.selectedUser.patientQuestions.push(ques);
        }
        if (questions.length == 4)
          this.selectedUser.loadMoreQuestion = true;
        else
          this.selectedUser.loadMoreQuestion = false;
        this.selectedUser.patientQuestionsPage += 1;
      }
    );
  }

  startConversation(recipientId: number, firstName: string, lastName: string) {
    this.conversationService.addConversation(this.secretaryGet.userId, recipientId).subscribe(
      res => {
        let conversation: Conversation = res;
        let conv: ConversationGet = {
          recipient: recipientId,
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
        this.doctorService.getDoctorPofilePhoto(recipientId + 'profilePic').subscribe(
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

  pendingAppointment: AppointmentForSecWithPag;
  loadingRequests: boolean;
  getUncofirmedApp() {
    console.log(this.pendingRequestsPage)
    this.loadingRequests = true;
    this.secretaryService.getUncofirmedApp(this.secretaryGet.userId, this.secretaryGet.secureLogin, this.pendingRequestsPage, 4).subscribe(
      res => {
        let pendingAppointment: AppointmentForSecWithPag = res;
        this.pendingAppointment = { totalPages: this.pendingAppointment ? pendingAppointment.totalPages : 0, list: [] };

        for (let app of pendingAppointment.list) {
          this.getImage(app.userId + 'profilePic').then((value) => { app.patientProfilePic = value; });
          app.confirmingApp = false;
          app.refusingApp = false;
          this.pendingAppointment.list.push(app);
        }
        this.pendingAppointment.totalPages = pendingAppointment.totalPages;
        this.updatePendingRequestsPages(this.pendingAppointment.totalPages);
        this.loadingRequests = false;
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
        this.loadingRequests = false;
      }
    );
  }

  updatePendingRequestsPages(items: number) {
    if (items > this.pendingAppointment.totalPages) {
      let maxIndex = Math.ceil(items / 4);
      if (maxIndex > this.pendingRequestsPages.length) {
        this.pendingRequestsPages.push(maxIndex);
      }
    } else if (items < this.pendingAppointment.totalPages) {
      let maxIndex = Math.ceil(items / 4);
      if (this.pendingRequestsPages[(this.pendingRequestsPage + 1)])
        this.getNextRequest(this.pendingAppointment.list[(this.pendingAppointment.list.length - 1)].appointmentId);
      if (maxIndex < this.pendingRequestsPages.length) {
        this.pendingRequestsPages.splice((this.pendingRequestsPages.length - 1), 1);
        if (this.pendingRequestsPage != 0) {
          this.pendingRequestsPage = (this.pendingRequestsPage - 1);
          this.getUncofirmedApp();
        }
      }
    } else if (this.pendingRequestsPages.length == 0) {
      for (let i = 1; i <= Math.ceil(items / 4); i++)
        this.pendingRequestsPages.push(i);
    }
    this.pendingAppointment.totalPages = items;
  }

  getNextRequest(appId: number) {
    this.secretaryService.getNextRequestByAppId(this.secretaryGet.userId, this.secretaryGet.secureLogin, appId).subscribe(
      res => {
        let app: AppointmentForSec = res;
        this.getImage(app.userId + 'profilePic').then((value) => { app.patientProfilePic = value; });
        app.refusingApp = false;
        app.confirmingApp = false;
        this.pendingAppointment.list.push(res);
      }
    );
  }

  pendingRequestsPages: number[] = [];
  pendingRequestsPage: number = 0;
  changePendingRequestPage(page: number) {
    this.loadingRequests = true;
    this.pendingRequestsPage = page;
    let j: number = 0;
    let endPage = page + 2;
    while ((page - 2) < 1) {
      page = page + 1;
    }
    if ((page + 2) > this.pendingRequestsPage)
      endPage = this.pendingRequestsPage;
    for (let i = (page - 2); i <= endPage; i++) {
      this.pendingRequestsPages[j] = i;
      j++;
    }
    this.getUncofirmedApp();
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

  getAppointmentInfoById(appId: number) {
    this.secretaryService.getAppointmentInfoById(this.secretaryGet.userId, this.secretaryGet.secureLogin, appId).subscribe(
      res => {
        let app: AppointmentForSec = res;
        this.getImage(app.userId + 'profilePic').then((value) => { app.patientProfilePic = value; });
        app.confirmingApp = false;
        app.refusingApp = false;
        this.pendingAppointment.list.push(app);
      }
    );
  }

  confirmAppointment(appkey: number) {
    this.pendingAppointment.list[appkey].confirmingApp = true;
    this.secretaryService.confirmAppointmentById(this.secretaryGet.userId, this.secretaryGet.secureLogin,
      this.pendingAppointment.list[appkey].appointmentId, this.pendingAppointment.list[appkey].userId, this.secretaryGet.doctorId,
      this.pendingAppointment.list[appkey].appointmentStatus).subscribe(
        res => {
          if (res) {
            this.pendingAppointment.list[appkey].confirmingApp = false;
            this.pendingAppointment.list.splice(appkey, 1);
            this.updatePendingRequestsPages((this.pendingAppointment.totalPages - 1));
          }
        }, err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.pendingAppointment.list[appkey].confirmingApp = false;
        }
      );
  }

  refuseAppointment(appkey: number) {
    this.pendingAppointment.list[appkey].refusingApp = true;
    this.secretaryService.refuseAppointmentById(this.secretaryGet.userId, this.secretaryGet.secureLogin,
      this.pendingAppointment.list[appkey].appointmentId, this.pendingAppointment.list[appkey].userId, this.secretaryGet.doctorId,
      this.pendingAppointment.list[appkey].appointmentStatus).subscribe(
        res => {
          if (res) {
            this.pendingAppointment.list[appkey].refusingApp = false;
            this.pendingAppointment.list.splice(appkey, 1);
            this.updatePendingRequestsPages((this.pendingAppointment.totalPages - 1));
          }
        }, err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.pendingAppointment.list[appkey].refusingApp = false;
        }
      );
  }

  async getAppointmentByDateAndDocId(date: string, page: number,): Promise<any> {
    let apps: AppointmentInfoForSec[] = await this.appointmentService.getAppointmentByDoctorIdAndDateForSec(this.secretaryGet.doctorId, page, 6, date).toPromise();
    for (let app of apps) {
      this.getImage(app.userId + 'profilePic').then((value) => { app.profileImg = value; });
    }
    return apps;
  }

  getAppointmentNumberByDoctorIdAndDate(date: string): Promise<any> {
    let number = this.appointmentService.getAppointmentNumberByDoctorIdAndDate(this.secretaryGet.doctorId, date).toPromise();
    return number;
  }

  loadingTodayApp: boolean = false;
  getTodayApp(page: number) {
    this.loadingTodayApp = true;
    let nowDate = new Date();
    this.getAppointmentByDateAndDocId(nowDate.getFullYear() + '/' + ((nowDate.getMonth() + 1) < 10 ? '0' + (nowDate.getMonth() + 1) : (nowDate.getMonth() + 1)) + '/' + (nowDate.getDate() < 10 ? '0' + nowDate.getDate() : nowDate.getDate()), page).then(
      async (value) => {
        this.todayApp = value;
        this.todayAppPage = page;
        this.loadingTodayApp = false;
        await this.sleep(1);
        document.getElementById("todayApp").scrollIntoView({ behavior: "smooth" });
      });
  }

  loadingTomorrowApp: boolean = false;
  getTomorrowApp(page: number) {
    this.loadingTomorrowApp = true;
    let nowDate = new Date();
    let tomorrwoDate = new Date(nowDate.setDate(nowDate.getDate() + 1));
    this.getAppointmentByDateAndDocId(tomorrwoDate.getFullYear() + '/' + ((tomorrwoDate.getMonth() + 1) < 10 ? '0' + (tomorrwoDate.getMonth() + 1) : (tomorrwoDate.getMonth() + 1)) + '/' + (tomorrwoDate.getDate() < 10 ? '0' + tomorrwoDate.getDate() : tomorrwoDate.getDate()), this.tomorrowAppPage).then(
      async (value) => {
        this.tomorrowApp = value;
        this.tomorrowAppPage = page;
        this.loadingTomorrowApp = false;
        await this.sleep(1);
        document.getElementById("tomorrowApp").scrollIntoView({ behavior: "smooth" });
      });
  }

  findMoreUser() {
    this.headerService.searchUserNow(true);
  }

  currentPatient:AppointmentInfoForSec;
  getCurrentPatient(){
    let nowDate = new Date();
    this.secretaryService.getDoctorCurrentPatient(this.secretaryGet.doctorId,nowDate.getFullYear() + '/' + ((nowDate.getMonth() + 1) < 10 ? '0' + (nowDate.getMonth() + 1) : (nowDate.getMonth() + 1)) + '/' + (nowDate.getDate() < 10 ? '0' + nowDate.getDate() : nowDate.getDate())).subscribe(
      res=>{
        if(res){
          this.currentPatient=res;
          this.getImage(this.currentPatient.userId + 'profilePic').then((value) => { this.currentPatient.profileImg = value; });
          let nowDate = new Date();
          this.getAppointmentByDateAndDocId(nowDate.getFullYear() + '/' + ((nowDate.getMonth() + 1) < 10 ? '0' + (nowDate.getMonth() + 1) : (nowDate.getMonth() + 1)) + '/' + (nowDate.getDate() < 10 ? '0' + nowDate.getDate() : nowDate.getDate()), this.todayAppPage).then((value) => { this.todayApp = value; });
        }
      }
    );
  }
  
  delayToLastTurn() {
    this.appointmentService.delayAppointmentByAppId(this.secretaryGet.doctorId, this.currentPatient.userId, this.currentPatient.appointmentId, this.todayAppNumber, this.currentPatient.patientTurn,this.secretaryGet.userId,'secretary').subscribe(
      res => {
        if (res) {
          this.getCurrentPatient();
        }
      }
    );
  }
}
