import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AcceuilService } from 'src/app/acceuil/acceuil.service';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.css']
})
export class SignUpFormComponent implements OnInit { 
  @Output() outPutOpenClientSignUp = new EventEmitter<boolean>();
  @Output() outPutOpenSignIn = new EventEmitter<boolean>();
  
  constructor(private acceuilService: AcceuilService) { 
  }
  re = /^[A-Za-z]+$/;
  firstName:string="";lastName:string="";mail:string="";day:string="";month:string="";year:string="";adress:String="";password:string="";passwordRepeat:string="";passwordInfromation:string="Password";passwordRepeatInfromation:string="Repeat password";firstNameInformation:string="First name";lastNameInformation:string="Last name";mailInformation:string="Mail";dayInformation:string="Day";monthInformation:string='Month';yearInformation:string="Year";adressInformation:string="City";
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
      this.firstNameInformation="Enter your name first";
    }else{
      if(this.re.test(this.firstName)){
        this.invalidFirstNameVariable=false;
        this.firstNameInformation="First name";
      }
      else{
        this.invalidFirstNameVariable=true;
        this.firstNameInformation="Name must be alphabitic";
      }
    }
  }
  checkLastName(){
    if(this.lastName.length==0){
      this.invalidLastNameVariable=true;
      this.lastNameInformation="Enter your surname first";
    }else{
      if(this.re.test(this.lastName)){
        this.invalidLastNameVariable=false;
        this.lastNameInformation="Last name";
      }
      else
        {
          this.invalidLastNameVariable=true;
          this.lastNameInformation="Surname must be alphabitic";
        }
    }
  }
  checkMail(){
    let email = new RegExp(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/);
    if(this.mail.length==0){
        this.invalidMailVariable=true;
        this.mailInformation="Enter your mail first";
    }else{
      if(email.test(this.mail)){
        this.invalidMailVariable=false;
        this.mailInformation="Mail";
      }
      else{
        this.invalidMailVariable=true;
        this.mailInformation="Please enter a valid mail";
      }
    }
  }
  checkGenderAndAdress(){
    let upperCaseAdress:string = this.adress.toUpperCase();
    if(upperCaseAdress == "Ariana".toUpperCase() || upperCaseAdress == "Béja".toUpperCase()|| upperCaseAdress == "Ben Arous".toUpperCase() || upperCaseAdress =="Bizerte".toUpperCase()||upperCaseAdress =="Gabès".toUpperCase()||upperCaseAdress =="Gafsa".toUpperCase()||upperCaseAdress =="Jendouba".toUpperCase()||upperCaseAdress =="Kairouan".toUpperCase()||upperCaseAdress =="Kasserine".toUpperCase() ||upperCaseAdress == "Kébili".toUpperCase() ||upperCaseAdress =="Kef".toUpperCase()||upperCaseAdress =="Mahdia".toUpperCase()||upperCaseAdress == "Manouba" ||upperCaseAdress =="Médenine".toUpperCase()||upperCaseAdress =="Monastir".toUpperCase()||upperCaseAdress == "Nabeul".toUpperCase() ||upperCaseAdress =="Sfax".toUpperCase()||upperCaseAdress =="Sidi Bouzid".toUpperCase()||upperCaseAdress == "Siliana".toUpperCase() ||upperCaseAdress =="Sousse".toUpperCase()||upperCaseAdress =="Tataouine".toUpperCase()||upperCaseAdress == "Tozeur".toUpperCase() ||upperCaseAdress =="Tunis".toUpperCase()||upperCaseAdress =="Zaghouan".toUpperCase()){
      this.invalidAdressVariable=false;
      this.adressInformation="City";
    }
    else{
      this.invalidAdressVariable=true;
      this.adressInformation="Please Enter a valid city name";
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
      this.passwordInfromation='Password';
    }
    else{
      this.invalidPasswordVariable=true; 
      this.passwordInfromation='Password must be at least 6 character';
    }
    if(this.passwordRepeat==this.password || this.password.length < 6){
      this.invalidPasswordRepeatVariable=false;
      this.passwordRepeatInfromation='Repeat password';
    }
    else{
      this.invalidPasswordRepeatVariable=true;
      this.passwordRepeatInfromation='Please check your password repeat';
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
      this.dayInformation="Day";
    }
    else{
      this.invalidDayVariable=true;
      this.dayInformation="Please enter a valid day";
    }
    if(parseInt(this.month) <= 12 && parseInt(this.month) > 0){
      this.invalidMonthVariable=false;
      this.monthInformation="Month";
    }
    else{
      this.invalidMonthVariable=true;
      this.monthInformation="Please enter a valid month";
    }
    if(parseInt(this.year) <= 2021 && parseInt(this.year) > 1900){
      this.invalidYearVariable=false;
      this.yearInformation="Year";
    }
    else{
      this.invalidYearVariable=true;
      this.yearInformation="Please enter a valid year";
    }
    if(this.invalidDayVariable==true || this.invalidMonthVariable==true || this.invalidYearVariable==true)
    {

    }else
    this.formInfo='GeneralInfo';
  }

}
export class NgbdDatepickerPopup {
  model: NgbDateStruct;
}
