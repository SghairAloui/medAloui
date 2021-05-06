import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
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

  constructor(private translate: TranslateService, private saveUser: SaveNewUserService,
    private http: HttpClient, private toastr: ToastrService,
    private authService: AuthService, private userService: UserService
  ) {
  }

  private roleUser: string;
  saveUserResponse: any;
  private patientPost: PatientPost;
  private pharmacyPost: PharmacyPost;
  private doctorPost: DoctorPost;
  re = /^[A-Za-z]+$/;
  nb = /^\d+$/;
  userType: string = ""; userName: string = ""; pharmacyName: string = ""; firstName: string = ""; lastName: string = ""; mail: string = ""; day: string = ""; month: string = ""; year: string = ""; adress: string = ""; password: string = ""; passwordRepeat: string = ""; userNameNameInformation: string = this.translate.instant('pharmacyUserName'); pharmacyNameInformation: string = this.translate.instant('pharmacyName'); passwordInfromation: string = this.translate.instant('password'); passwordRepeatInfromation: string = this.translate.instant('repeatPassword'); firstNameInformation: string = this.translate.instant('firstName'); lastNameInformation: string = this.translate.instant('surname'); mailInformation: string = this.translate.instant('mail'); dayInformation: string = this.translate.instant('day'); monthInformation: string = this.translate.instant('month'); yearInformation: string = this.translate.instant('year'); adressInformation: string = this.translate.instant('city');
  invalidFirstNameVariable: boolean;
  invalidLastNameVariable: boolean;
  invalidMailVariable: boolean;
  invalidDayVariable: boolean;
  invalidMonthVariable: boolean;
  invalidYearVariable: boolean;
  invalidAdressVariable: boolean;
  checkBoxInvaledInfoVriable: boolean;
  invalidPasswordVariable: boolean;
  invalidPasswordRepeatVariable: boolean;
  invalidPharmacyNameVariable: boolean;
  invalidUserNameVariable: boolean;
  maleCheckBox: boolean;
  femaleCheckBox: boolean;
  usernameExist: string = "null";
  showForm: boolean = false;
  formInfo: string = 'false';
  field1Code: string; field2Code: string; field3Code: string; field4Code: string; field5Code: string;
  isVerificationCode: boolean;
  creatingUser: boolean = false;

  errorMessage = '';
  cities: string[] = ["Ariana", this.translate.instant('Beja'), "Ben Arous", "Bizerte", this.translate.instant('Gabes'), "Gafsa", "Jendouba", "Kairouan", "Kasserine", this.translate.instant('Kebili'), "Kef", "Mahdia", "Manouba", this.translate.instant('Medenine'), "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"];

  ngOnInit(): void {
  }

  openSignIn() {
    this.outPutOpenSignIn.emit(false);
  }

  checkAdress() {
    let lowerCaseAdress: string = this.adress.toLowerCase();
    this.adress = this.adress.replace('é', 'e');
    this.adress = this.adress.replace('è', 'e');
    for (let city of this.cities) {
      if (city.toLowerCase() == lowerCaseAdress) {
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

  checkPharmacyNameAndUserName() {
    this.checkAdress();
    if (this.pharmacyName.length < 3) {
      this.invalidPharmacyNameVariable = true;
      this.pharmacyNameInformation = this.translate.instant('PharmacyNameUnder3');
    } else {
      if (this.re.test(this.pharmacyName)) {
        this.invalidPharmacyNameVariable = false;
        this.pharmacyNameInformation = this.translate.instant('pharmacyName');
      }
      else {
        this.invalidPharmacyNameVariable = true;
        this.pharmacyNameInformation = this.translate.instant('pharmacyNameAlpha');
      }
    }
    if (!this.userName) {
      this.invalidUserNameVariable = true;
      this.userNameNameInformation = this.translate.instant('userNameNameUnder3');
    } else {
      let validMail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (validMail.test(this.userName)) {
        this.checkIfUserNameExist(this.userName, 'pharmacy');
      }
      else {
        this.invalidUserNameVariable = true;
        this.userNameNameInformation = this.translate.instant('userNameNoSpace');
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

  checkMail() {
    let validMail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (!this.mail.length) {
      this.invalidMailVariable = true;
      this.mailInformation = this.translate.instant('mailApha');
    } else {
      if (validMail.test(this.mail)) {
        this.checkIfUserNameExist(this.mail, 'normalAccount');
      }
      else {
        this.invalidMailVariable = true;
        this.mailInformation = this.translate.instant('enterValidMail');
      }
    }
  }

  checkGenderAndAdress() {
    this.checkAdress();
    if (this.maleCheckBox == true || this.femaleCheckBox == true)
      this.checkBoxInvaledInfoVriable = false;
    else
      this.checkBoxInvaledInfoVriable = true;
    if (this.invalidAdressVariable == false && this.checkBoxInvaledInfoVriable == false)
      this.formInfo = 'password';
  }

  checkPassword() {
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
    if (this.invalidPasswordVariable == false && this.invalidPasswordRepeatVariable == false)
      this.saveNewUser();
  }

  checkEmailAndNameForm() {
    this.checkMail();
    this.checkFirstName();
    this.checkLastName();
  }

  checkBirthday() {
    this.formInfo = 'GeneralInfo';
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
    if (this.invalidDayVariable == true || this.invalidMonthVariable == true || this.invalidYearVariable == true) {

    } else
      this.formInfo = 'GeneralInfo';
  }

  checkIfUserNameExist(username: string, accountType: string) {
    this.userService.checkIfUsernameExists(username.toLowerCase()).subscribe(
      res => {
        if (accountType == 'pharmacy') {
          if (res == true) {
            this.invalidUserNameVariable = true;
            this.userNameNameInformation = this.translate.instant('mailExist');
          } else {
            if (!this.invalidUserNameVariable && !this.invalidPharmacyNameVariable && !this.invalidAdressVariable) {
              this.formInfo = 'pharmacyPassword';
            }
          }
        } else {
          if (res == true) {
            this.invalidMailVariable = true;
            this.mailInformation = this.translate.instant('mailExist');
          } else {
            if (!this.invalidFirstNameVariable && !this.invalidLastNameVariable && !this.invalidMailVariable)
              this.formInfo = 'birthday';
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
  }

  saveNewUser() {
    this.creatingUser = true;
    let roleUserList = new Set();
    roleUserList.add(this.roleUser);

    let birthday: string = this.day + '/' + this.month + '/' + this.year;
    let gender: string;
    if (this.maleCheckBox)
      gender = 'male';
    else
      gender = 'female';
    let username: string;
    if (this.roleUser == 'PHARMACIST_ROLE')
      username = this.userName;
    else
      username = this.mail;
    this.authService.register(username.toLowerCase(), this.password, this.roleUser, this.firstName.toLowerCase(), this.lastName.toLowerCase(), this.pharmacyName.toLowerCase(), this.adress.toLowerCase(), gender, birthday).subscribe(
      data => {
        this.creatingUser = false;
        this.formInfo = 'verification';
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  checkVerifacationCode() {
    let mail: string;
    if (this.userType == 'client' || this.userType == 'doctor')
      mail = this.mail;
    else
      mail = this.userName;
    let code: number = parseInt(this.field1Code + this.field2Code + this.field3Code + this.field4Code + this.field5Code);
    if (code) {
      this.userService.checkVerifacationCode(mail, code).subscribe(
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
    let mail: string;
    if (this.userType == 'client' || this.userType == 'doctor')
      mail = this.mail;
    else
      mail = this.userName;
    let status: string;
    if (this.userType == 'client')
      status = 'approved'
    if (this.userType == 'pharmacy')
      status = 'notApproved'
    if (this.userType == 'doctor')
      status = 'notApproved'
    this.userService.updateUserStatusByEmail(mail, status).subscribe(
      res => {
        if (res) {
          this.formInfo = 'validated';
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

}