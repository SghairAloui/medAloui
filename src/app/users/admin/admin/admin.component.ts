import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from 'src/app/Headers/header/header.service';
import { SecureLoginString } from 'src/model/SecureLoginString';
import { AdminService } from './admin.service';
import jwt_decode from 'jwt-decode';
import { DoctorService } from '../../doctor/doctor/doctor.service';
import { UserService } from 'src/app/services/user.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { WebSocketNotification } from 'src/model/WebSocketNotification';
import { AdminGet } from 'src/model/AdminGet';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private adminService: AdminService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private router: Router,
    private headerService: HeaderService,
    private doctorService: DoctorService,
    private userService:UserService,
    private webSocketService: WebSocketService) { 
      // Open connection with server socket
    let stompClient = this.webSocketService.connect();
    stompClient.connect({}, async frame => {

      // Subscribe to notification topic
      stompClient.subscribe('/topic/notification/' + this.adminGet.userId, async message => {
        let not: WebSocketNotification = JSON.parse(message.body);
        console.log(not);
        if (not.type == 'changePositionTosupervisor') {
          this.toastr.info(this.translate.instant('Admin')+' '+not.data +' '+this.translate.instant('changeYourPosition')
          +' '+this.translate.instant('supervisor'), this.translate.instant('Notification'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.adminGet.adminPosition='supervisor';
          this.adminGet.newPosition='supervisor';
          this.getAdmins();
          this.notificationSound();
        } else if (not.type == 'changePositionToobserver') {
          this.toastr.info(this.translate.instant('Admin')+' '+not.data +' '+this.translate.instant('changeYourPosition')
          +' '+this.translate.instant('observer'), this.translate.instant('Notification'), {
            timeOut: 5000,
            positionClass: 'toast-bottom-left'
          });
          this.adminGet.adminPosition='observer';
          this.adminGet.newPosition='observer';
          this.notificationSound();
        } else if (not.type == 'changePositionTodelete') {
          this.deleteMyAccount();
          this.notificationSound();
        }
      })
    });
    }

  adminGet: AdminGet;
  secureLogin: SecureLoginString;
  container: string = 'profile';
  adminInfo: boolean;
  cities: string[] = ["Ariana", this.translate.instant('Beja'), "Ben Arous", "Bizerte", this.translate.instant('Gabes'), "Gafsa", "Jendouba", "Kairouan", "Kasserine", this.translate.instant('Kebili'), "Kef", "Mahdia", "Manouba", this.translate.instant('Medenine'), "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];

  ngOnInit(): void {
    this.adminInfo = false;
    this.getAdminInfoById();
    this.headerService.setHeader('admin');
  }

  notVerified: boolean;
  getAdminInfoById() {
    let token: any = jwt_decode(sessionStorage.getItem('auth-token'));
    this.adminService.getAdminInfoById(parseInt(token.jti)).subscribe(
      res => {
        if (res) {
          this.adminGet = res;
          this.adminInfo = true;
          if (parseInt(this.adminGet.adminPosition) > 10000 && parseInt(this.adminGet.adminPosition) <= 99999)
            this.notVerified = true;
          else {
            this.notVerified = false;
            if (this.adminGet.adminPosition == 'supervisor')
              this.getAdmins();
            else if (this.adminGet.adminPosition == 'delete')
              this.deleteMyAccount();
            this.getImage(this.adminGet.userId + 'profilePic').then((val) => { this.adminGet.userImg = val });
            localStorage.setItem('id', this.adminGet.userId.toString());
          }
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

  admins: AdminGet[] = [];
  adminsPage: number = 0;
  getAdmins() {
    this.adminService.getAdmins(this.adminsPage, 10).subscribe(
      res => {
        let admins: AdminGet[] = res;
        for (let admin of admins) {
          this.getImage(admin.userId + 'profilePic').then((val) => { admin.userImg = val });
          this.admins.push(admin);
        }
      }
    );
  }

  selectedFile: File;
  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload(this.adminGet.userId + "profilePic");
  }

  onUpload(imageName: string) {
    const uploadImageData = new FormData();
    uploadImageData.append('imageFile', this.selectedFile, imageName);
    this.doctorService.updateDoctorProfilePhoto(uploadImageData).subscribe(
      res => {
        if (res == 'imageUpdated')
          this.getImage(imageName).then((val) => { this.adminGet.userImg = val });
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  async getImage(imageName: string) {
    let res = await this.doctorService.getDoctorPofilePhoto(imageName).toPromise();
    let retrievedImage: any;
    if (res != null) {
      let retrieveResonse: any = res;
      let base64Data: any = retrieveResonse.picByte;
      retrievedImage = 'data:image/jpeg;base64,' + base64Data;
    } else
      retrievedImage = false;
    return retrievedImage;
  }

  password: string = '';
  passwordRepeat: string = '';
  name: string = '';
  city: string = '';
  email: string = '';
  infoErrAddAdmin: string = '';
  addAdmin() {
    let re = /^[A-Za-z]+\s+[A-Za-z]+$/;
    let re1 = /^[A-Za-z]+$/;

    if (this.name.length < 3)
      this.infoErrAddAdmin = 'nameFirst';
    else if (re.test(this.name) || re1.test(this.name)) {
      let foundCity: boolean = false;
      for (let city of this.cities) {
        if (city == this.city) {
          foundCity = true;
          break;
        }
      }
      if (foundCity == false)
        this.infoErrAddAdmin = 'enterValidCity';
      else {
        let city = this.city.replace('é', 'e');
        city = city.replace('è', 'e');
        if (this.password.length < 6)
          this.infoErrAddAdmin = 'passwordUnder6';
        else if (this.password != this.passwordRepeat)
          this.infoErrAddAdmin = 'passwordDontMatch';
        else {
          let validMail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
          if (!this.email.length)
            this.infoErrAddAdmin = 'mailApha';
          else if (validMail.test(this.email)) {
            this.adminService.add(this.name, city, this.password, this.email).subscribe(
              res => {
                if (res == true) {
                  this.name = '';
                  this.city = '';
                  this.password = '';
                  this.passwordRepeat = '';
                  this.email = '';
                  this.toastr.success(this.translate.instant('adminAdded'), this.translate.instant('Notification'), {
                    timeOut: 5000,
                    positionClass: 'toast-bottom-left'
                  });
                } else
                  this.infoErrAddAdmin = 'mailExist';
              }, err => {
                this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
                  timeOut: 5000,
                  positionClass: 'toast-bottom-left'
                });
              }
            );
          }
          else
            this.infoErrAddAdmin = 'enterValidMail';
        }
      }
    }
    else
      this.infoErrAddAdmin = 'nameApha';
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
      this.userService.checkVerifacationCode(this.adminGet.userUsername, code).subscribe(
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
    this.userService.updateUserStatusByEmail(this.adminGet.userUsername, 'observer').subscribe(
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

  notificationSound() {
    let audio = new Audio();
    audio.src = "../../../../assets/sounds/notificationSound.wav";
    audio.load();
    audio.play();
  }

  changeAdminPosition(adminKey:number){
    this.adminService.changeAdminPosition(this.admins[adminKey].userId,this.admins[adminKey].newPosition,this.adminGet.userId).subscribe(
      res=>{
        if(res == true){
          if(this.admins[adminKey].newPosition == 'delete'){
            this.toastr.success(this.translate.instant('Admin') +' '+this.admins[parseInt(this.popUpValue1)].adminFullName+' '+this.translate.instant('deleted'), this.translate.instant('Notification'), {
              timeOut: 3500,
              positionClass: 'toast-bottom-left'
            });
            this.closePopUp();
            this.admins.splice(adminKey,1);
          }else{
            this.toastr.success(this.translate.instant('adminPosUpdated'), this.translate.instant('Notification'), {
              timeOut: 3500,
              positionClass: 'toast-bottom-left'
            });
            this.admins[adminKey].adminPosition=this.admins[adminKey].newPosition;
            this.admins[adminKey].newPosition=null;
          }
        }else{
          if(this.admins[adminKey].newPosition == 'delete'){
            this.toastr.warning(this.translate.instant('youCantDeleteThisAdmin'), this.translate.instant('Notification'), {
              timeOut: 3500,
              positionClass: 'toast-bottom-left'
            });
          } else{
            this.toastr.warning(this.translate.instant('youCantChnageAdminPos'), this.translate.instant('Notification'), {
              timeOut: 3500,
              positionClass: 'toast-bottom-left'
            });
          }
        }
      },err=>{
        this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
          timeOut: 3500,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  popUp: boolean = false;
  popUpTitle: string;
  popUpText: string;
  popUpFor: string;
  confirming: boolean = false;
  popUpValue1: string;
  popUpValue2: string;
  openPopUp(popUpFor: string, value1: string, value2: string) {
    this.popUpFor = popUpFor;
    this.popUpValue1 = value1;
    this.popUpValue2 = value2;
    if (popUpFor == 'deleteAdmin') {
      this.admins[parseInt(this.popUpValue1)].newPosition='delete';
      this.popUpTitle = this.translate.instant('confirmDelete');
      this.popUpText = this.translate.instant('areYouSureToDelete') + ' ' + this.admins[parseInt(this.popUpValue1)].adminFullName.toLocaleUpperCase() + ', ' + this.translate.instant('thisActionIsIrr')+', ' + this.translate.instant('confirmToDelete') + '?';
    } else if (popUpFor == 'accountDeleted') {
      this.popUpTitle = this.translate.instant('accountDeleted');
      this.popUpText = this.translate.instant('yourAccountWasDeleted');
    }
    this.popUp = true;
    console.log('popup opened')
  }
  confirmPopUp() {
    if (this.popUpFor == 'deleteAdmin')
      this.changeAdminPosition(parseInt(this.popUpValue1));
    else if (this.popUpFor == 'accountDeleted'){
      sessionStorage.removeItem('auth-user');
      sessionStorage.removeItem('auth-token');
      this.router.navigate(['/acceuil']);
    }
  }
  closePopUp() {
    this.popUp = false;
    this.popUpTitle = '';
    this.popUpText = '';
    this.popUpFor = '';
    this.popUpValue1 = '';
    this.popUpValue2 = '';
  }

  deleteMyAccount(){
    this.adminService.deleteAdmin(this.adminGet.userId).subscribe(
      res=>{
        this.openPopUp('accountDeleted','','');
      }
    );
  }
}
