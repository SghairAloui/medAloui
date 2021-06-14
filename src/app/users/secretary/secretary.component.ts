import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from 'src/app/Headers/header/header.service';
import { ConversationService } from 'src/app/services/conversation.service';
import { UserService } from 'src/app/services/user.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { ConversationGet } from 'src/model/ConversationGet';
import { IdAndBoolean } from 'src/model/IdAndBoolean';
import { MessageGet } from 'src/model/MessageGet';
import { OpenConversation } from 'src/model/OpenConversation';
import { SecretaryInfo } from 'src/model/SecretaryInfo';
import { StringGet } from 'src/model/StringGet';
import { UpdatePasswordPost } from 'src/model/UpdatePasswordPost';
import { UserSearchGet } from 'src/model/UserSearchGet';
import { WebSocketNotification } from 'src/model/WebSocketNotification';
import { DoctorService } from '../doctor/doctor/doctor.service';
import { SecretaryService } from './secretary.service';

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
    private router:Router) {
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
        console.log(res);
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
    this.conversationService.getConversationByUserId(this.secretaryGet.userId, this.conversationPage, 10).subscribe(
      res => {
        let conversations: ConversationGet[] = res;
        for (let conver of conversations) {
          if (conver.message_content.length >= 10)
            conver.message_content = conver.message_content.slice(0, 7) + '...';
          if (conver.is_unread == true && conver.last_message_sender_id != this.secretaryGet.userId)
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
      this.conversationService.readConversationById(this.openConversation.conversationId, this.openConversation.userId).subscribe(
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
      this.conversationService.sendMessage(this.secretaryGet.userId, this.openConversation.userId, this.message, this.openConversation.conversationId).subscribe(
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
  firstName: string=''; lastName: string=''; mail: string=''; day: string=''; month: string=''; year: string=''; adress: string=''; password: string=''; passwordRepeat: string='';
  days: number[] = [];
  months: number[] = [];
  years: number[] = [];
  cities: string[] = ["Ariana", this.translate.instant('Beja'), "Ben Arous", "Bizerte", this.translate.instant('Gabes'), "Gafsa", "Jendouba", "Kairouan", "Kasserine", this.translate.instant('Kebili'), "Kef", "Mahdia", "Manouba", this.translate.instant('Medenine'), "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];
  femaleCheckBox: boolean = false;
  maleCheckBox: boolean = false;
  editeSecureInfo:boolean=false;
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

  updateSecretaryInfoBySecureLogin(){
    let birthday: string = (this.day.length == 1 ? '0'+this.day : this.day)  + '/' + (this.month.length == 1 ? '0'+this.month : this.month) + '/' + this.year;
    let gender: string;
    if (this.maleCheckBox == true)
      gender = 'male';
    else
      gender = 'female';
    this.secretaryService.updateSecretaryInfoBySecureLogin(this.firstName,this.lastName,birthday,this.adress,gender,this.secretaryGet.secureLogin).subscribe(
      res=>{
        if(res){
          this.toastr.success(this.translate.instant('infoUpdated'), this.translate.instant('notification'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.generalInfo='show';
          this.editeSecureInfo=false;
          this.secretaryGet.secretaryFirstName=this.firstName;
          this.secretaryGet.secretaryLastName=this.lastName;
          this.secretaryGet.secretaryBirthDay=birthday;
          this.secretaryGet.userCity=this.adress;
          this.secretaryGet.secretaryGender=gender;
          this.disableSaveBtn=true;
          this.toGeneralInfoSection();
        }
      },
      err=>{
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
      this.secretaryService.updatePasswordBySecureLogin(this.passwordRepeat,this.secretaryGet.secureLogin).subscribe(
        async res=>{
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
        err=>{
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    }
  }
}
