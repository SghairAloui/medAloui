import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DoctorPost } from 'src/model/DoctorPost';
import { PatientPost } from 'src/model/PatientPost';
import { PharmacyPost } from 'src/model/PharmacyPost';
import { SaveNewUserService } from './save-new-user.service';

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.css']
})
export class SignUpFormComponent implements OnInit { 
  @Output() outPutOpenClientSignUp = new EventEmitter<boolean>();
  @Output() outPutOpenSignIn = new EventEmitter<boolean>();
  
  constructor(private translate: TranslateService,private saveUser:SaveNewUserService,private http:HttpClient,private toastr:ToastrService) { 
  }
  saveUserResponse:any;
  private patientPost:PatientPost;
  private pharmacyPost:PharmacyPost;
  private doctorPost:DoctorPost;
  re = /^[A-Za-z]+$/;
  userType:string="";userName:string="";pharmacyName:string="";firstName:string="";lastName:string="";mail:string="";day:string="";month:string="";year:string="";adress:string="";password:string="";passwordRepeat:string="";userNameNameInformation:string=this.translate.instant('pharmacyUserName');pharmacyNameInformation:string=this.translate.instant('pharmacyName');passwordInfromation:string=this.translate.instant('password');passwordRepeatInfromation:string=this.translate.instant('repeatPassword');firstNameInformation:string=this.translate.instant('firstName');lastNameInformation:string=this.translate.instant('surname');mailInformation:string=this.translate.instant('mail');dayInformation:string=this.translate.instant('day');monthInformation:string=this.translate.instant('month');yearInformation:string=this.translate.instant('year');adressInformation:string=this.translate.instant('city');
  invalidFirstNameVariable:boolean;
  invalidLastNameVariable:boolean;
  invalidMailVariable:boolean;
  invalidDayVariable:boolean;
  invalidMonthVariable:boolean;
  invalidYearVariable:boolean;
  invalidAdressVariable:boolean;
  checkBoxInvaledInfoVriable:boolean;
  invalidPasswordVariable:boolean;
  invalidPasswordRepeatVariable:boolean;
  invalidPharmacyNameVariable:boolean;
  invalidUserNameVariable:boolean;
  maleCheckBox:boolean;
  femaleCheckBox:boolean;
  usernameExist:string="null";
  showForm:boolean=false;
  formInfo:string='false';

  ngOnInit(): void {
  }
  openSignIn(){
    this.outPutOpenSignIn.emit(false);
  }
  checkAdress(){
    let upperCaseAdress:string = this.adress.toUpperCase();
    if(upperCaseAdress == "Ariana".toUpperCase() || upperCaseAdress == "Béja".toUpperCase()|| upperCaseAdress == "Ben Arous".toUpperCase() || upperCaseAdress =="Bizerte".toUpperCase()||upperCaseAdress =="Gabès".toUpperCase()||upperCaseAdress =="Gafsa".toUpperCase()||upperCaseAdress =="Jendouba".toUpperCase()||upperCaseAdress =="Kairouan".toUpperCase()||upperCaseAdress =="Kasserine".toUpperCase() ||upperCaseAdress == "Kébili".toUpperCase() ||upperCaseAdress =="Kef".toUpperCase()||upperCaseAdress =="Mahdia".toUpperCase()||upperCaseAdress == "Manouba".toUpperCase() ||upperCaseAdress =="Médenine".toUpperCase()||upperCaseAdress =="Monastir".toUpperCase()||upperCaseAdress == "Nabeul".toUpperCase() ||upperCaseAdress =="Sfax".toUpperCase()||upperCaseAdress =="Sidi Bouzid".toUpperCase()||upperCaseAdress == "Siliana".toUpperCase() ||upperCaseAdress =="Sousse".toUpperCase()||upperCaseAdress =="Tataouine".toUpperCase()||upperCaseAdress == "Tozeur".toUpperCase() ||upperCaseAdress =="Tunis".toUpperCase()||upperCaseAdress =="Zaghouan".toUpperCase()){
      this.invalidAdressVariable=false;
      this.adressInformation=this.translate.instant('city');
    }
    else{
      this.invalidAdressVariable=true;
      this.adressInformation=this.translate.instant('enterValidCity');
    }
  }
  checkFirstName(){
    if(this.firstName.length<3){
      this.invalidFirstNameVariable=true;
      this.firstNameInformation= this.translate.instant('nameFirst');
    }else{
      if(this.re.test(this.firstName)){
        this.invalidFirstNameVariable=false;
        this.firstNameInformation=this.translate.instant('firstName');
      }
      else{
        this.invalidFirstNameVariable=true;
        this.firstNameInformation=this.translate.instant('nameApha');
      }
    }
  }
  checkPharmacyNameAndUserName(){
    this.checkAdress();
    if(this.pharmacyName.length<3){
      this.invalidPharmacyNameVariable=true;
      this.pharmacyNameInformation=this.translate.instant('PharmacyNameUnder3');
    }else{
      if(this.re.test(this.pharmacyName)){
        this.invalidPharmacyNameVariable=false;
        this.pharmacyNameInformation=this.translate.instant('pharmacyName');
      }
      else
        {
          this.invalidPharmacyNameVariable=true;
          this.pharmacyNameInformation=this.translate.instant('pharmacyNameAlpha');
        }
    }
    if(this.userName.length<6){
      this.invalidUserNameVariable=true;
      this.userNameNameInformation=this.translate.instant('userNameNameUnder3');
    }else{
    if(this.userName.indexOf(' ')!== -1){
      this.invalidUserNameVariable=true;
      this.userNameNameInformation=this.translate.instant('userNameNoSpace');
    }
    else{
      this.invalidUserNameVariable=false;
      this.userNameNameInformation=this.translate.instant('pharmacyUserName');
    }
  }
  
    this.checkIfPharmacyUserNameExist(this.userName);
  }
  checkLastName(){
    if(this.lastName.length<3){
      this.invalidLastNameVariable=true;
      this.lastNameInformation=this.translate.instant('firstSurname');
    }else{
      if(this.re.test(this.lastName)){
        this.invalidLastNameVariable=false;
        this.lastNameInformation=this.translate.instant('surname');
      }
      else
        {
          this.invalidLastNameVariable=true;
          this.lastNameInformation=this.translate.instant('surnameApha');
        }
    }
  }
  checkMail(){
    if(this.mail.length<6){
        this.invalidMailVariable=true;
        this.mailInformation=this.translate.instant('mailApha');
    }else{
      if(this.mail.indexOf(' ')!== -1){
        this.invalidMailVariable=true;
        this.mailInformation=this.translate.instant('enterValidMail');
      }
      else{
        this.invalidMailVariable=false;
        this.mailInformation=this.translate.instant('mail');
      }
    }
  }
  checkGenderAndAdress(){
    this.checkAdress();
    if(this.maleCheckBox==true || this.femaleCheckBox==true)
     this.checkBoxInvaledInfoVriable=false;
    else
     this.checkBoxInvaledInfoVriable=true;
    if(this.invalidAdressVariable==false && this.checkBoxInvaledInfoVriable==false)
    this.formInfo='password';
  }
  checkPassword(){
    if(this.password.length > 5){
      this.invalidPasswordVariable=false;
      this.passwordInfromation=this.translate.instant('password');
    }
    else{
      this.invalidPasswordVariable=true; 
      this.passwordInfromation=this.translate.instant('passwordUnder6');
    }
    if(this.passwordRepeat==this.password || this.password.length < 6){
      this.invalidPasswordRepeatVariable=false;
      this.passwordRepeatInfromation=this.translate.instant('repeatPassword');
    }
    else{
      this.invalidPasswordRepeatVariable=true;
      this.passwordRepeatInfromation=this.translate.instant('repeatPasswordErr');
    }
    if(this.invalidPasswordVariable==false && this.invalidPasswordRepeatVariable==false)
     this.saveUserNow();
  }
  checkEmailAndNameForm(){
    this.checkMail();
    this.checkFirstName();
    this.checkLastName();
    this.checkIfUserNameExist(this.mail);
  }
  checkBirthday(){
    if(parseInt(this.day) <= 31 && parseInt(this.day) > 0){
      this.invalidDayVariable=false;
      this.dayInformation=this.translate.instant('day');
    }
    else{
      this.invalidDayVariable=true;
      this.dayInformation=this.translate.instant('dayErr');
    }
    if(parseInt(this.month) <= 12 && parseInt(this.month) > 0){
      this.invalidMonthVariable=false;
      this.monthInformation=this.translate.instant('month');
    }
    else{
      this.invalidMonthVariable=true;
      this.monthInformation=this.translate.instant('monthErr');
    }
    if(parseInt(this.year) <= 2021 && parseInt(this.year) > 1900){
      this.invalidYearVariable=false;
      this.yearInformation=this.translate.instant('year');
    }
    else{
      this.invalidYearVariable=true;
      this.yearInformation=this.translate.instant('yearErr');
    }
    if(this.invalidDayVariable==true || this.invalidMonthVariable==true || this.invalidYearVariable==true)
    {

    }else
    this.formInfo='GeneralInfo';
  }

  public saveUserNow(){
    
    if(this.userType=='pharmacy'){
      this.pharmacyPost =new PharmacyPost(this.userName,this.pharmacyName,this.adress,this.password);
        this.saveUser.savePharmacy(this.pharmacyPost).subscribe(
          res => {
            this.formInfo=res;
          },
          err => {
            this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
          }
        );
    }else{
      let gender:string;
      if(this.maleCheckBox==true)
      gender="male";
      else
      gender="female";  
      let birthday:string=this.day+"/"+this.month+"/"+this.year;
      if(this.userType=='doctor'){
        this.doctorPost =new DoctorPost(this.mail,this.firstName,this.lastName,this.adress,birthday,this.password,gender);
        let resp = this.saveUser.saveDoctor(this.doctorPost).subscribe(
          res => {
            this.formInfo=res;
          },
          err => {
            this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
          }
        );
      }else{
        this.patientPost =new PatientPost(this.mail,this.firstName,this.lastName,this.adress,this.password,birthday,gender);
        let resp = this.saveUser.savePatient(this.patientPost).subscribe(
          res => {
            this.formInfo=res;
          },
          err => {
            this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
              timeOut: 5000,
              positionClass: 'toast-bottom-left'
            });
          }
        );
      }
    }
  }

  checkIfUserNameExist(username:string){
    let url="http://localhost:8080/resource/ExistsByUsername/"+username;
    this.http.get<boolean>(url).subscribe(
      res => {
        if(res==true){
          this.invalidMailVariable=true;
          this.mailInformation=this.translate.instant('mailExist');
        }else{
          if(this.invalidFirstNameVariable==false && this.invalidLastNameVariable==false && this.invalidMailVariable==false)
          this.formInfo='birthday';
        }
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
  checkIfPharmacyUserNameExist(username:string){
    let url="http://localhost:8080/resource/ExistsByUsername/"+username;
    this.http.get<boolean>(url).subscribe(
      res => {
        if(res==true){
          this.invalidUserNameVariable=true;
          this.userNameNameInformation=this.translate.instant('mailExist');
        }else{
          if(this.invalidUserNameVariable==false && this.invalidPharmacyNameVariable==false && this.invalidAdressVariable==false)
          this.formInfo='pharmacyPassword';
        }
      },
      err => {
        this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }
}