import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EmailService } from '../services/email.service';
import { UserService } from '../services/user.service';
import { ValidationService } from '../validation/validation.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

  constructor(private translate: TranslateService,
    private userService: UserService,
    private emailService: EmailService,
    private toastr: ToastrService,
    private router: Router,
    private validationService: ValidationService) { }

  email: string;
  invalidMail: boolean = false;
  mailInfo: string;
  isMailSent: string = 'getMail';
  field1Code: string; field2Code: string; field3Code: string; field4Code: string; field5Code: string;
  isVerificationCode: boolean;
  password: string; passwordRepeat: string;
  invalidPasswordVariable: boolean; invalidPasswordRepeatVariable: boolean;
  passwordInfromation: string; passwordRepeatInfromation: string;
  sendingEmail: boolean = false;

  ngOnInit(): void {
  }

  checkMail() {
    this.sendingEmail = true;
    let validMail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    if (validMail.test(this.email)) {
      this.userService.checkIfUsernameExists(this.email).subscribe(
        res => {
          if (res == true) {
            this.emailService.sendMail('verification', '', this.email).subscribe(
              res => {
                this.sendingEmail = false;
                if (res)
                  this.isMailSent = 'verification';
                else
                  this.isMailSent = 'getMail';
              },
              err => {
                this.sendingEmail = false;
                this.isMailSent = 'getMail';
              }
            );
          } else {
            this.sendingEmail = false;
            this.invalidMail = true;
            this.mailInfo = this.translate.instant('noAccountWithEmail');
          }
        }, err => {
          this.sendingEmail = false;
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    } else {
      this.sendingEmail = false;
      this.invalidMail = true;
      this.mailInfo = this.translate.instant('invalidEmail');
    }
  }

  checkVerificationCode() {
    let code: number = parseInt(this.field1Code + this.field2Code + this.field3Code + this.field4Code + this.field5Code);
    if (code) {
      this.userService.checkVerifacationCode(this.email, code).subscribe(
        res => {
          if (res != false) {
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
    this.validationService.checkIfUserValidated(this.email).subscribe(
      res => {
        if (res == true) {
          this.userService.updateUserStatusByEmail(this.email, 'approved').subscribe(
            res => {
              if (res) {
                this.isMailSent = 'newPassword';
                this.passwordInfromation = this.translate.instant('password');
                this.passwordRepeatInfromation = this.translate.instant('repeatPassword');
              }
            }
          );
        } else {
          this.userService.updateUserStatusByEmail(this.email, 'notApproved').subscribe(
            res => {
              if (res) {
                this.isMailSent = 'newPassword';
                this.passwordInfromation = this.translate.instant('password');
                this.passwordRepeatInfromation = this.translate.instant('repeatPassword');
              }
            }
          );
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

  updatePassword() {
    if (!this.password) {
      this.invalidPasswordVariable = true;
      this.passwordInfromation = this.translate.instant('passwordUnder6');
    }
    else if (!this.passwordRepeat) {
      this.invalidPasswordRepeatVariable = true;
      this.passwordRepeatInfromation = this.translate.instant('passwordUnder6');
    }
    else if (this.password.length < 6) {
      this.invalidPasswordVariable = true;
      this.passwordInfromation = this.translate.instant('passwordUnder6');
    }
    else if (this.password != this.passwordRepeat) {
      this.invalidPasswordVariable = true;
      this.invalidPasswordRepeatVariable = true;
      this.passwordInfromation = this.translate.instant('passwordDontMatch');
      this.passwordRepeatInfromation = this.translate.instant('passwordDontMatch');
    } else {
      this.userService.updateUserPasswordByEmail(this.email, this.password).subscribe(
        res => {
          if (res) {
            this.isMailSent = 'passwordUpdated';
          }
        }, err => {
          this.toastr.warning(this.translate.instant('checkCnx'), this.translate.instant('cnx'), {
            timeOut: 3500,
            positionClass: 'toast-bottom-left'
          });
        }
      );
    }
  }

  async openSignIn() {
    this.router.navigate(['/acceuil']);

    let connection = document.getElementById("connexionSection");

    while (!connection) {
      connection = document.getElementById("connexionSection");
      await this.sleep(500);
    }

    document.getElementById("connexionSection").scrollIntoView({ behavior: 'smooth' });
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
