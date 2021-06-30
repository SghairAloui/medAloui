import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConversationService } from 'src/app/services/conversation.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { UserService } from 'src/app/services/user.service';
import { AdminComponent } from 'src/app/users/admin/admin/admin.component';
import { DoctorComponent } from 'src/app/users/doctor/doctor/doctor.component';
import { DoctorService } from 'src/app/users/doctor/doctor/doctor.service';
import { PatientComponent } from 'src/app/users/patient/patient/patient.component';
import { PharmacyComponent } from 'src/app/users/pharmacy/pharmacy/pharmacy.component';
import { SecretaryComponent } from 'src/app/users/secretary/secretary.component';
import { SecretaryService } from 'src/app/users/secretary/secretary.service';
import { ConversationGet } from 'src/model/ConversationGet';
import { IdAndBoolean } from 'src/model/IdAndBoolean';
import { MessageGet } from 'src/model/MessageGet';
import { NotificationGet } from 'src/model/NotificationGet';
import { OpenConversation } from 'src/model/OpenConversation';
import { UserSearchGet } from 'src/model/UserSearchGet';
import { AppComponent } from '../../app.component'
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  USER_KEY = 'auth-user';
  userName: any;

  constructor(private translate: TranslateService, private appComp: AppComponent,
    private toastr: ToastrService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private patientComp: PatientComponent,
    private doctorComp: DoctorComponent,
    private adminComp: AdminComponent,
    private pharmacyComp: PharmacyComponent,
    private headerService: HeaderService,
    private notificationService: NotificationService,
    private conversationService: ConversationService,
    private doctorService: DoctorService,
    private userService: UserService,
    private secretaryComponent: SecretaryComponent,
    private secretaryService: SecretaryService) {
    translate.addLangs(['en', 'fr']);
    /*document.addEventListener('click', this.closeAllMenu.bind(this));*/
  }

  notifications: NotificationGet[] = [];
  conversations: ConversationGet[] = [];
  unreadNotifications: number = 0;
  loadMoreConversation: boolean;
  loadMoreNotification: boolean;
  message: MessageGet;
  userId: number = 0;
  loadingNotification: boolean = false;
  notificationScroll: number = 0;
  conversationScroll: number = 0;
  search: string;
  currentSearch: string;
  searchPage: number = 0;
  searchingUsers: boolean = false;
  secureLogin:string;

  @ViewChild('notificationsScrollEL') private notificationsScrollEl: ElementRef;
  @ViewChild('conversationsScrollEl') private conversationsScrollEl: ElementRef;

  ngOnInit(): void {

    this.headerService.childHeader$.subscribe(
      (message)=>{
        if(message == true || message == false ){
          console.log(message)
          this.showChildHeader = message;
        }
      }
    );

    this.headerService.conversation$.subscribe(
      (message) => {
        let conversation: ConversationGet = message;
        let convExist: boolean = false;
        for (let conver of this.conversations) {
          if (conver.conversation_id == conversation.conversation_id) {
            convExist = true;
            break;
          }
        }
        if (convExist == false) {
          if (conversation.order == 'end')
            this.conversations.push(message);
          else if (conversation.order == 'start') {
            this.conversations.unshift(message);
          }
        }
      }
    );

    this.headerService.loadMoreConversation$.subscribe(
      async (message) => {
        this.loadMoreConversation = message;
        await this.sleep(1);
        this.conversationsScrollEl.nativeElement.scrollTop = this.conversationScroll;
      }
    );

    this.headerService.searchUser$.subscribe(
      async (message) => {
        if (message == true)
          this.searchUsersByName(false);
      }
    );

    this.headerService.loadMoreNotification$.subscribe(
      async (message) => {
        this.loadMoreNotification = message;
        await this.sleep(1);
        this.notificationsScrollEl.nativeElement.scrollTop = this.notificationScroll;
        this.loadingNotification = false;
      }
    );

    this.headerService.firstConversation$.subscribe(
      (message) => {
        if (message > 0) {
          let i: number = 0;
          let convFound = false;
          for (let conv of this.conversations) {
            if (conv.conversation_id == message) {
              let toTopConv: ConversationGet = this.conversations[i];
              toTopConv.is_unread = true;
              this.conversations.splice(i, 1);
              this.conversations.unshift(toTopConv);
              convFound = true;
              break;
            }
            i += 1;
          }
          if (convFound == false) {
            this.getConversationByid(message, true);
          }
        }
      }
    );

    this.headerService.message$.subscribe(
      (message) => {
        this.message = message;
        if (this.message.messageContent) {
          this.conversations.forEach((conver, index) => {
            if (conver.conversation_id == this.message.conversationId) {
              this.conversations[index].message_content = this.message.messageContent;
              this.conversations[index].last_update_date = this.message.messageDate;
              this.conversations[index].is_unread = true;
              this.conversations[index].last_message_sender_id = this.message.senderId;
              if (this.message.messageContent.length > 10)
                this.conversations[index].message_content = this.message.messageContent.slice(0, 7) + '...';
            }
          });
        }
      }
    );

    this.headerService.readConversation$.subscribe(
      (message) => {
        let i: number = 0;
        let data: IdAndBoolean = message;
        for (let conv of this.conversations) {
          if (conv.conversation_id == data.id) {
            this.conversations[i].is_unread = data.boolean;
            if (data.lastMessageSenderId != 0)
              this.conversations[i].last_message_sender_id = data.lastMessageSenderId;
            break;
          }
          i += 1;
        }
      }
    );

    this.headerService.notification$.subscribe(
      (message) => {
        let notification: NotificationGet = message;
        if (notification.notificationType) {
          this.allNotIsRead = false;
          if (notification.isUnread == true)
            this.unreadNotifications += 1;
          if (notification.order == 'start')
            this.notifications.unshift(message);
          else if (notification.order == 'end')
            this.notifications.push(message);
        }
      }
    );

    this.headerService.deletePrescription$.subscribe(
      (message) => {
        if (message > 0) {
          let index: number = 0;
          for (let not of this.notifications) {
            if (parseInt(not.notificationParameter) == message && not.notificationType == 'doctorAddPrescription') {
              this.notifications.splice(index, 1);
              break;
            }
          }
        }
      }
    );

    const user = window.sessionStorage.getItem(this.USER_KEY);

    if (user) {
      this.userName = JSON.parse(user).username;
    }

    if (localStorage.getItem("darkMode") == 'true') {
      this.appComp.switchTheme('dark');
      this.darkMode = true;
    } else {
      this.appComp.switchTheme('light');
      this.darkMode = false;
    }

    this.translate.use(localStorage.getItem("lang"));
    if (localStorage.getItem("lang") == 'en') {
      this.en = true;
      this.fr = false;
    } else if (localStorage.getItem("lang") == 'fr') {
      this.en = false;
      this.fr = true;
    } else {
      localStorage.setItem("lang", "en");
      this.en = true;
      this.fr = false;
    }

    this.headerService.header$.subscribe(
      (message) => {
        this.role = message;
        if (this.role == 'doctor'){
          this.userId = this.doctorComp.doctorGet.userId;
          this.secureLogin = this.doctorComp.doctorGet.secureLogin;
        }
        else if (this.role == 'patient'){
          this.userId = this.patientComp.patientGet.userId;
          this.secureLogin = this.patientComp.patientGet.secureLogin;
        }
        else if (this.role == 'pharmacy'){
          this.userId = this.pharmacyComp.pharmacyGet.userId;
          this.secureLogin = this.pharmacyComp.pharmacyGet.secureLogin;
        }
        else if (this.role == 'admin'){
          this.userId = this.adminComp.adminGet.userId;
          this.secureLogin = this.adminComp.adminGet.secureLogin;
        }
        else if (this.role == 'secretary'){
          this.userId = this.secretaryComponent.secretaryGet.userId;
          this.secureLogin = this.secretaryComponent.secretaryGet.secureLogin;
        }
      }
    );

    this.headerService.parentHeader$.subscribe(
      (message) => {
        if (message)
          this.parentHeader = message;
        else
          this.parentHeader = 'message';
      }
    );
  }

  en: boolean = true;
  fr: boolean = false;
  settingsBoxUnder700: boolean = false;
  displaySettingsBox: boolean = false;
  darkMode: boolean = false;
  menuCheckBox: boolean = false;
  headerOnScrollVariable = false;
  parentHeader: string = 'message';
  role: any = this.headerService.header$;
  allNotIsRead: boolean = false;


  //Home header

  @HostListener("document:scroll")
  scroll() {
    if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
      this.headerOnScrollVariable = true;
    } else {
      this.headerOnScrollVariable = false;
    }
  }

  toDoctocSection() {
    document.getElementById("doctocSection").scrollIntoView({ behavior: "smooth" });
    this.menuCheckBox = false;
  }

  toAcceuilSection() {
    document.getElementById("acceuilSection").scrollIntoView({ behavior: "smooth" });
    this.menuCheckBox = false;
  }

  toConnexionSection() {
    if (this.userName == null) {
      document.getElementById("connexionSection").scrollIntoView({ behavior: "smooth" });
      this.menuCheckBox = false;
    } else {
      // deconnection
      this.tokenStorageService.signOut();
      this.reloadPage();
    }
  }

  reloadPage(): void {
    window.location.reload();
  }

  toMaladiesSection() {
    document.getElementById("maladiesSection").scrollIntoView({ behavior: "smooth" });
    this.menuCheckBox = false;
  }

  toAboutSection() {
    document.getElementById("aboutSection").scrollIntoView({ behavior: "smooth" });
    this.menuCheckBox = false;
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem("lang", lang);
    if (localStorage.getItem("lang") == 'en')
      this.toastr.info(this.translate.instant('langToEn'), this.translate.instant('Language'), {
        timeOut: 2500,
        positionClass: 'toast-bottom-left'

      });
    else if (localStorage.getItem("lang") == 'fr')
      this.toastr.info(this.translate.instant('langToFr'), this.translate.instant('Language'), {
        timeOut: 2500,
        positionClass: 'toast-bottom-left'
      });
  }

  /*closeAllMenu(event:any) {
    if(this.menuCheckBox==true || this.displaySettingsBox==true){
      this.menuCheckBox=false;
      this.displaySettingsBox=false;
    }
  }*/

  closeMenu() {
    this.menuCheckBox = false;
  }

  switchTheme() {
    if (this.darkMode == false) {
      this.appComp.switchTheme('dark');
      this.darkMode = true;
      localStorage.setItem("darkMode", "true");
      this.toastr.info(this.translate.instant('darkModeOn'), this.translate.instant('theme'), {
        timeOut: 2500,
        positionClass: 'toast-bottom-left'
      });
    }
    else {
      this.appComp.switchTheme('light');
      this.darkMode = false;
      localStorage.setItem("darkMode", "false");
      this.toastr.info(this.translate.instant('darkModeOf'), this.translate.instant('theme'), {
        timeOut: 2500,
        positionClass: 'toast-bottom-left'
      });
    }
  }
  //Home header

  //patient header
  toMedicalProfileSection() {
    document.getElementById("medicalProfileSection").scrollIntoView({ behavior: "smooth" });
  }

  toPrescriptionSection() {
    document.getElementById("prescriptionSection").scrollIntoView({ behavior: "smooth" });
  }

  toMyDoctorsSection() {
    document.getElementById("myDoctorsSection").scrollIntoView({ behavior: "smooth" });
  }

  toMyPharmaciesSection() {
    document.getElementById("myPharmaciesSection").scrollIntoView({ behavior: "smooth" });
  }

  doctorClick() {
    this.patientComp.container = 'patientDoctor';
  }

  profileCLick() {
    this.patientComp.container='profile';
  }

  diseaseClick() {
    this.patientComp.container = 'patientDisease';
  }

  toFindDoctorSection() {
    document.getElementById("patientFindDoctorSection").scrollIntoView({ behavior: "smooth" });
  }

  toTopRatedSection() {
    document.getElementById("patientTopRatedDoctorSection").scrollIntoView({ behavior: "smooth" });
  }

  toOurMethodologySection() {
    document.getElementById("patientOurMethodologySection").scrollIntoView({ behavior: "smooth" });
  }

  toWhyHealthCareSection() {
    document.getElementById("patientWhyHealthCareSection").scrollIntoView({ behavior: "smooth" });
  }

  toMyAppointmentsSection() {
    document.getElementById("myAppointmentsSection").scrollIntoView({ behavior: "smooth" });
  }

  toAddQuestionSection() {
    document.getElementById("addQuestionSection").scrollIntoView({ behavior: "smooth" });
  }

  toAllQuestionSection() {
    document.getElementById("allQuestionSection").scrollIntoView({ behavior: "smooth" });
  }

  //doctor header
  openContainerToDoctor(containerName: string) {
    this.doctorComp.container = containerName;
  }
  //doctor header

  //admin header
  openContainerToAdmin(containerName: string) {
    this.adminComp.container = containerName;
  }
  //admin header

  //pharmacy header
  toMyMedicamentsInfoSection() {
    document.getElementById("myMedicamentsSection").scrollIntoView({ behavior: "smooth" });
  }
  openContainerToPharmacy(containerName: string) {
    this.pharmacyComp.container = containerName;
  }
  //pharmacy header

  //secretary header
  openContainerToSecretary(container: string) {
    this.secretaryComponent.container = container;
  }
  toWorkTimeLinesSection() {
    document.getElementById("secretaryWork").scrollIntoView({ behavior: "smooth" });
  }
  //secretary header

  logOut() {
    localStorage.setItem("secureLogin", "");
    localStorage.setItem("id", "");
    localStorage.setItem("secureLoginType", "");
    this.parentHeader='';
    this.router.navigate(['/acceuil']);
  }

  toGeneralInfoSection() {
    document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
  }

  toAdminFindDoctorScection() {
    document.getElementById("adminFindDoctor").scrollIntoView({ behavior: "smooth" });
  }
  toAdminAddSpecialityScection() {
    document.getElementById("adminAddSpeciality").scrollIntoView({ behavior: "smooth" });
  }

  toPendingDoctorScection() {
    document.getElementById("pendingDoctor").scrollIntoView({ behavior: "smooth" });
  }

  toPendingPharmaciesSection() {
    document.getElementById("pendingPharmaciesSection").scrollIntoView({ behavior: "smooth" });
  }

  toTodayPatientSection() {
    document.getElementById("todayPatientSection").scrollIntoView({ behavior: "smooth" });
  }

  toTomorrowPatientSection() {
    document.getElementById("tomorrowPatientSection").scrollIntoView({ behavior: "smooth" });
  }

  toFindPatientSection() {
    document.getElementById("findPatientSection").scrollIntoView({ behavior: "smooth" });
  }

  toMyPositionSection() {
    document.getElementById("myPositionSection").scrollIntoView({ behavior: "smooth" });
  }

  tomyPositionSection() {
    document.getElementById("myPositionSection").scrollIntoView({ behavior: "smooth" });
  }

  toApprovedByAdminSection() {
    document.getElementById("approvedByAdminSection").scrollIntoView({ behavior: "smooth" });
  }


  closeNotification(notificationKey) {
    if (this.notifications[notificationKey].isUnread == true)
      this.unreadNotifications -= 1;
    this.notifications.splice(notificationKey, 1);
  }

  changeUnreadNotification(notificationKey: number) {
    let newUnread: boolean;
    if (this.notifications[notificationKey].isUnread == true)
      newUnread = false;
    else
      newUnread = true;
    this.notificationService.changeUnreadNotification(this.notifications[notificationKey].notificationId, newUnread).subscribe(
      res => {
        if (res)
          this.notifications[notificationKey].isUnread = newUnread;
        if (newUnread == true)
          this.unreadNotifications += 1;
        else
          this.unreadNotifications -= 1;
      }
    );
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async updatePosClick() {
    if ((this.doctorComp.container && this.doctorComp.container != 'profile') || (this.pharmacyComp.container && this.pharmacyComp.container != 'profile')) {
      this.doctorComp.container = 'profile';
      this.pharmacyComp.container = 'profile';
      await this.sleep(500);
    }
    document.getElementById("myPositionSection").scrollIntoView({ behavior: 'smooth' });
  }

  getPassedTime(date: string): string { 
    let time: string = '';
    time += date.slice(0, 10).split('/').join('-') + 'T' + date.slice(11, date.length);
    let timeBetween = new Date(new Date().valueOf() - new Date(time).valueOf());
    let clockTime: string = this.convertMillisecondsToDigitalClock(timeBetween).clock;
    if (parseInt(clockTime.slice(0, clockTime.indexOf(':'))) == 0) {
      if (clockTime.slice((clockTime.indexOf(':') + 2), (clockTime.indexOf(':') + 3)) == ':')
        time = clockTime.slice((clockTime.indexOf(':') + 1), (clockTime.indexOf(':') + 2)) + ' munites';
      else
        time = clockTime.slice((clockTime.indexOf(':') + 1), (clockTime.indexOf(':') + 3)) + ' munites';
    }
    else if (parseInt(clockTime.slice(0, clockTime.indexOf(':'))) >= 1 && parseInt(clockTime.slice(0, clockTime.indexOf(':'))) <= 24)
      time = date.slice(11, 16);
    else {
      let day: number = Math.ceil(parseInt(clockTime.slice(0, clockTime.indexOf(':'))) / 24);
      let daysNameEn: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let daysName: string[] = [this.translate.instant('sun')
        , this.translate.instant('mon')
        , this.translate.instant('tue')
        , this.translate.instant('wed')
        , this.translate.instant('thu')
        , this.translate.instant('fri')
        , this.translate.instant('sat')];
      if (day <= 7) {
        time = daysName[daysNameEn.indexOf(new Date(time).toString().slice(0, 3))];
      }
      else {
        time = this.translate.instant(new Date(time).toString().slice(4, 7).toLocaleLowerCase()) + new Date(time).toString().slice(7, 10);
      }

    }
    return time;
  }

  convertMillisecondsToDigitalClock(ms) {
    let hours = Math.floor(ms / 3600000), // 1 Hour = 36000 Milliseconds
      minutes = Math.floor((ms % 3600000) / 60000), // 1 Minutes = 60000 Milliseconds
      seconds = Math.floor(((ms % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      clock: hours + ":" + minutes + ":" + seconds
    };
  }

  @HostListener('scroll', ['$event'])
  conversationsScroll(event) {
    if (this.loadMoreConversation == true) {
      let pos = document.getElementById("conversationsScroll").scrollTop + document.getElementById("conversationsScroll").offsetHeight;
      let max = document.getElementById("conversationsScroll").scrollHeight;
      if (((max - 10) <= pos) && this.loadMoreConversation == true) {
        this.loadMoreConversation = false;
        this.conversationScroll = document.getElementById("conversationsScroll").scrollTop;
        if (this.role == 'doctor')
          this.doctorComp.openMessages(true);
        else if (this.role == 'patient')
          this.patientComp.openMessages(false);
        else if (this.role == 'pharmacy')
          this.pharmacyComp.openMessages(false);
        else if (this.role == 'secretary')
          this.secretaryComponent.openMessages(false);
      }
    }
  }

  openConversation(converKey: number) {
    let lastName: string = '';
    if (this.conversations[converKey].last_name != null)
      lastName = this.conversations[converKey].last_name;
    let openConver: OpenConversation = {
      conversationId: this.conversations[converKey].conversation_id,
      username: this.conversations[converKey].first_name + ' ' + lastName,
      messagePage: 0,
      messages: [],
      userId: this.conversations[converKey].recipient,
      userImg: this.conversations[converKey].recipientImg,
      isUnread: this.conversations[converKey].is_unread,
      lastMessageSenderId: this.conversations[converKey].last_message_sender_id,
      conversationStatus: this.conversations[converKey].conversation_status,
      loadMoreMessage: true,
      statusUpdatedBy: this.conversations[converKey].status_updated_by
    };
    if (this.role == 'doctor')
      this.doctorComp.openFullConversation(openConver);
    else if (this.role == 'patient')
      this.patientComp.openFullConversation(openConver);
    else if (this.role == 'pharmacy')
      this.pharmacyComp.openFullConversation(openConver);
    else if (this.role == 'secretary')
      this.secretaryComponent.openFullConversation(openConver);
    this.showChildHeader=false;
  }

  getConversationByid(convId: number, openConv: boolean) {
    this.conversationService.getConversationByid(convId, this.secureLogin).subscribe(
      res => {
        let conv: ConversationGet = res;
        let retrieveResonse: any;
        let base64Data: any;
        let retrievedImage: any;
        this.doctorService.getDoctorPofilePhoto(conv.recipient + 'profilePic').subscribe(
          res => {
            if (res != null) {
              retrieveResonse = res;
              base64Data = retrieveResonse.picByte;
              retrievedImage = 'data:image/jpeg;base64,' + base64Data;
              conv.recipientImg = retrievedImage;
            } else
              conv.recipientImg = false;

            if (openConv)
              this.conversations.unshift(conv);
            else {
              let openConver: OpenConversation = {
                conversationId: conv.conversation_id,
                username: conv.first_name + ' ' + conv.last_name,
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
              if (this.role == 'doctor')
                this.doctorComp.openFullConversation(openConver);
              else if (this.role == 'patient')
                this.patientComp.openFullConversation(openConver);
              else if (this.role == 'pharmacy')
                this.pharmacyComp.openFullConversation(openConver);
              else if (this.role == 'secretary')
                this.secretaryComponent.openFullConversation(openConver);
            }
          }
        );
      }
    );
  }

  deleteNotificationById(notifKey: number) {
    this.notificationService.deleteNotificationById(this.notifications[notifKey].notificationId,this.secureLogin).subscribe(
      res => {
        if (res) {
          if (this.notifications[notifKey].isUnread == true)
            this.unreadNotifications -= 1;
          this.notifications.splice(notifKey, 1);
          if (this.notifications.length <= 6 && this.loadMoreNotification == true) {
            if (this.role == 'doctor')
              this.doctorComp.getMyNotifications(this.userId);
            else if (this.role == 'patient')
              this.patientComp.getMyNotifications(this.userId);
            else if (this.role == 'pharmacy')
              this.pharmacyComp.getMyNotifications(this.userId);
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

  @HostListener('scroll', ['$event'])
  notificationsScroll(event) {
    if (this.loadMoreNotification == true && this.loadingNotification == false) {
      let pos = document.getElementById("notificationsScroll").scrollTop + document.getElementById("notificationsScroll").offsetHeight;
      let max = document.getElementById("notificationsScroll").scrollHeight;
      if (((max - 10) <= pos) && this.loadMoreNotification == true) {
        this.notificationScroll = document.getElementById("notificationsScroll").scrollTop;
        this.loadingNotification = true;
        if (this.role == 'doctor')
          this.doctorComp.getMyNotifications(this.userId);
        else if (this.role == 'patient')
          this.patientComp.getMyNotifications(this.userId);
        else if (this.role == 'pharmacy')
          this.pharmacyComp.getMyNotifications(this.userId);
      }
    }
  }

  searchUsersByName(firstTime: boolean) {
    this.searchingUsers = true;
    if (firstTime && this.role == 'doctor')
      this.doctorComp.searchedUsers = [];
    else if (firstTime && this.role == 'patient')
      this.patientComp.searchedUsers = [];
    else if (firstTime && this.role == 'pharmacy')
      this.pharmacyComp.searchedUsers = [];
    else if (firstTime && this.role == 'secretary')
      this.secretaryComponent.searchedUsers = [];
    if (firstTime)
      this.searchPage = 0;
    if (firstTime)
      this.currentSearch = '%' + this.search.split(' ').join('% %') + '%';
    this.userService.searchUsersByName(this.currentSearch, this.searchPage, 6).subscribe(
      async res => {
        let searchedUsers: UserSearchGet[] = res;
        let retrieveResonse: any;
        let base64Data: any;
        let retrievedImage: any;
        for (let user of searchedUsers) {
          user.startingConversation = false;
          this.doctorService.getDoctorPofilePhoto(user.userId + 'profilePic').subscribe(
            res => {
              if (res != null) {
                retrieveResonse = res;
                base64Data = retrieveResonse.picByte;
                retrievedImage = 'data:image/jpeg;base64,' + base64Data;
                user.userImg = retrievedImage;
              } else
                user.userImg = false;
            }
          );
          if (this.role == 'doctor')
            this.doctorComp.searchedUsers.push(user);
          else if (this.role == 'patient')
            this.patientComp.searchedUsers.push(user);
          else if (this.role == 'pharmacy')
            this.pharmacyComp.searchedUsers.push(user);
          else if (this.role == 'secretary')
            this.secretaryComponent.searchedUsers.push(user);
        }
        this.search = '';
        if (searchedUsers.length == 6) {
          if (this.role == 'doctor')
            this.doctorComp.loadMoreUsers = true;
          else if (this.role == 'patient')
            this.patientComp.loadMoreUsers = true;
          else if (this.role == 'pharmacy')
            this.pharmacyComp.loadMoreUsers = true;
          else if (this.role == 'secretary')
            this.secretaryComponent.loadMoreUsers = true;
        } else {
          if (this.role == 'doctor')
            this.doctorComp.loadMoreUsers = false;
          else if (this.role == 'patient')
            this.patientComp.loadMoreUsers = false;
          else if (this.role == 'pharmacy')
            this.pharmacyComp.loadMoreUsers = false;
          else if (this.role == 'secretary')
            this.secretaryComponent.loadMoreUsers = false;
        }
        this.searchPage += 1;
        this.searchingUsers = false;
        if (this.searchPage == 1) {
          await this.sleep(1);
          window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        }
      }, err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
      });
  }

  nameMaxLength(firstName: string, lastName: string): string {
    let name: string = firstName + ' ' + lastName;
    if (name.length > 14)
      return name.slice(0, 14) + '...';
    else
      return name;
  }

  acceptDoctorAddRequest(notKey:number){
    this.secretaryService.acceptDoctorAddRequest(this.notifications[notKey].senderId,this.notifications[notKey].notificationId,this.userId,this.secureLogin).subscribe(
      res=>{
        if(res){
          this.notifications[notKey].notificationParameter = 'accepted';
          this.secretaryComponent.getSecretaryWork();
        }
      },err=>{
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  refuseDoctorAddRequest(notKey:number){
    this.secretaryService.refuseDoctorAddRequest(this.notifications[notKey].notificationId,this.secureLogin,this.notifications[notKey].senderId,this.userId).subscribe(
      res=>{
        if(res)
          this.notifications[notKey].notificationParameter = 'refused';
      },err=>{
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  showLoginHeaderUnder700:boolean=false;
  showChildHeader:boolean=false;
}
