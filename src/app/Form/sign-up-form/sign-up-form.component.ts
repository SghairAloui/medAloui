import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AcceuilService } from 'src/app/acceuil/acceuil.service';

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.css']
})
export class SignUpFormComponent implements OnInit { 
  @Output() outPutOpenClientSignUp = new EventEmitter<boolean>();
  @Output() outPutOpenSignIn = new EventEmitter<boolean>();
  
  constructor(private acceuilService: AcceuilService, private translate: TranslateService) { 
  }
  re = /^[A-Za-z]+$/;
  firstName:string="";lastName:string="";mail:string="";day:string="";month:string="";year:string="";adress:String="";password:string="";passwordRepeat:string="";passwordInfromation:string=this.translate.instant('password');passwordRepeatInfromation:string=this.translate.instant('repeatPassword');firstNameInformation:string=this.translate.instant('firstName');lastNameInformation:string=this.translate.instant('surname');mailInformation:string=this.translate.instant('mail');dayInformation:string=this.translate.instant('day');monthInformation:string=this.translate.instant('month');yearInformation:string=this.translate.instant('year');adressInformation:string=this.translate.instant('city');
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
  maleCheckBox:boolean;
  femaleCheckBox:boolean;
  showForm:boolean=false;
  formInfo:String='false';

  ngOnInit(): void {
  }
  openSignIn(){
    this.outPutOpenSignIn.emit(false);
  }
  checkFirstName(){
    if(this.firstName.length==0){
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
  checkLastName(){
    if(this.lastName.length==0){
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
    let email = new RegExp(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/);
    if(this.mail.length==0){
        this.invalidMailVariable=true;
        this.mailInformation=this.translate.instant('mailApha');
    }else{
      if(email.test(this.mail)){
        this.invalidMailVariable=false;
        this.mailInformation=this.translate.instant('mail');
      }
      else{
        this.invalidMailVariable=true;
        this.mailInformation=this.translate.instant('enterValidMail');
      }
    }
  }
  checkGenderAndAdress(){
    let upperCaseAdress:string = this.adress.toUpperCase();
    if(upperCaseAdress == "Ariana".toUpperCase() || upperCaseAdress == "Béja".toUpperCase()|| upperCaseAdress == "Ben Arous".toUpperCase() || upperCaseAdress =="Bizerte".toUpperCase()||upperCaseAdress =="Gabès".toUpperCase()||upperCaseAdress =="Gafsa".toUpperCase()||upperCaseAdress =="Jendouba".toUpperCase()||upperCaseAdress =="Kairouan".toUpperCase()||upperCaseAdress =="Kasserine".toUpperCase() ||upperCaseAdress == "Kébili".toUpperCase() ||upperCaseAdress =="Kef".toUpperCase()||upperCaseAdress =="Mahdia".toUpperCase()||upperCaseAdress == "Manouba".toUpperCase() ||upperCaseAdress =="Médenine".toUpperCase()||upperCaseAdress =="Monastir".toUpperCase()||upperCaseAdress == "Nabeul".toUpperCase() ||upperCaseAdress =="Sfax".toUpperCase()||upperCaseAdress =="Sidi Bouzid".toUpperCase()||upperCaseAdress == "Siliana".toUpperCase() ||upperCaseAdress =="Sousse".toUpperCase()||upperCaseAdress =="Tataouine".toUpperCase()||upperCaseAdress == "Tozeur".toUpperCase() ||upperCaseAdress =="Tunis".toUpperCase()||upperCaseAdress =="Zaghouan".toUpperCase()){
      this.invalidAdressVariable=false;
      this.adressInformation=this.translate.instant('city');
    }
    else{
      this.invalidAdressVariable=true;
      this.adressInformation=this.translate.instant('enterValidCity');
    }
    console.log(this.maleCheckBox);
    console.log(this.femaleCheckBox);
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
  }
  checkEmailAndNameForm(){
    this.checkMail();
    this.checkFirstName();
    this.checkLastName();
    if(this.invalidFirstNameVariable==true || this.invalidLastNameVariable==true || this.invalidMailVariable==true)
    {

    }else
    this.formInfo='birthday';
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

}