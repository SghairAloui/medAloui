import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from 'src/app/services/notification.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { AdminComponent } from 'src/app/users/admin/admin/admin.component';
import { DoctorComponent } from 'src/app/users/doctor/doctor/doctor.component';
import { PatientComponent } from 'src/app/users/patient/patient/patient.component';
import { NotificationGet } from 'src/model/NotificationGet';
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
    private headerService: HeaderService,
    private notificationService: NotificationService) {
    translate.addLangs(['en', 'fr']);
    /*document.addEventListener('click', this.closeAllMenu.bind(this));*/
  }

  notifications: NotificationGet[] = [];
  unreadNotifications: number = 0;


  ngOnInit(): void {
    this.headerService.notification$.subscribe(
      (message) => {
        let notification: NotificationGet = message;
        if (notification.unread)
          this.unreadNotifications += 1;
        this.notifications.push(message);
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
  parentHeader: string = 'profile';
  role: any = this.headerService.header$;


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
        positionClass: 'toast-bottom-left',

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
    this.parentHeader = 'doctor';
  }

  profileCLick() {
    this.patientComp.container = 'profile';
    this.patientComp.ngOnInit();
    this.parentHeader = 'profile';
  }

  diseaseClick() {
    this.patientComp.container = 'patientDisease';
    this.parentHeader = 'disease';
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
    this.parentHeader = containerName;
  }
  async updateDocPosClick(){
    if(this.doctorComp.container != 'profile'){
      this.doctorComp.container = 'profile';
      await this.sleep(500);
    }
    document.getElementById("myPositionSection").scrollIntoView({behavior:'smooth'});
  }
  //doctor header

  //admin header
  openContainerToAdmin(containerName: string) {
    this.adminComp.container = containerName;
    this.parentHeader = containerName;
  }
  //admin header

  //pharmacy header
  toMyMedicamentsInfoSection() {
    document.getElementById("myMedicamentsSection").scrollIntoView({ behavior: "smooth" });
  }
  //pharmacy header

  logOut() {
    localStorage.setItem("secureLogin", "");
    localStorage.setItem("id", "");
    localStorage.setItem("secureLoginType", "");
    this.router.navigate(['/acceuil']);
  }

  toGeneralInfoSection() {
    document.getElementById("generalInfoSection").scrollIntoView({ behavior: "smooth" });
  }

  closeNotification(notificationKey) {
    if (this.notifications[notificationKey].unread)
      this.unreadNotifications -= 1;
    this.notifications.splice(notificationKey, 1);
  }

  changeUnreadNotification(notificationKey: number) {
    let newUnread: boolean;
    if (this.notifications[notificationKey].unread)
      newUnread = false;
    else
      newUnread = true;
    this.notificationService.changeUnreadNotification(this.notifications[notificationKey].notificationId, newUnread).subscribe(
      res => {
        if (res)
          this.notifications[notificationKey].unread = newUnread;
        if (newUnread)
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

}
