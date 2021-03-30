import { HttpClient } from '@angular/common/http';
import { EventEmitter, Component, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { SignInResponse } from 'src/model/SignInResponse';
import { UsernameAndPassPost } from 'src/model/UsernameAndPassPost';
import { SignInService } from './sign-in.service';

@Component({
  selector: 'app-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.css']
})
export class SignInFormComponent implements OnInit {
  constructor(private http:HttpClient,private translate: TranslateService,private toastr:ToastrService,
     private signInService:SignInService,private router: Router
     ,private authService: AuthService, private tokenStorage: TokenStorageService) { }
  @Output() outPutOpenSignUp = new EventEmitter<boolean>();
 
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  signInResponse:SignInResponse;
  waitOppeningAcc:boolean=false;

  InvalidInfo:boolean=false;
  emailAddressInfo:string=this.translate.instant('username');passwordInfo:string=this.translate.instant('password');
  username:string;
  password:string;
  private usernameAndPassPost:UsernameAndPassPost;
  openSignUp(){
    this.outPutOpenSignUp.emit(true);
  }
  openAccount(){
    this.checkInfoForm();
  }
  checkInfoForm(){
    this.usernameAndPassPost = new UsernameAndPassPost(this.username.toLowerCase(),this.password);
    this.signInService.openPatientAccount(this.usernameAndPassPost).subscribe(
      res=>{
        if(res=='invalidInfo'){
          this.signInService.openDoctorAccount(this.usernameAndPassPost).subscribe(
            res=>{
              if(res=='invalidInfo'){
                this.signInService.openPharmacyAccount(this.usernameAndPassPost).subscribe(
                  res=>{
                    if(res=='invalidInfo'){
                      this.signInService.openAdminAccount(this.usernameAndPassPost).subscribe(
                        res=>{
                          if(res=='invalidInfo'){
                            this.emailAddressInfo=this.translate.instant('checkUsername');
                            this.passwordInfo=this.translate.instant('checkPassword');
                            this.InvalidInfo=true;
                          }else{
                            localStorage.setItem("secureLogin",res);
                            localStorage.setItem("secureLoginType","admin");
                            this.router.navigate(['/admin']);
                          }
                        },
                        err=>{
                          this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
                            timeOut: 5000,
                            positionClass: 'toast-bottom-left'
                          });
                        }
                      );
                    }else{
                      localStorage.setItem("secureLogin",res);
                      localStorage.setItem("secureLoginType","pharmacy");
                      this.router.navigate(['/pharmacy']);
                    }
                  },
                  err=>{
                    this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
                      timeOut: 5000,
                      positionClass: 'toast-bottom-left'
                    });
                  }
                );
              }else{
                localStorage.setItem("secureLogin",res);
                localStorage.setItem("secureLoginType","doctor");
                this.router.navigate(['/doctor']);
              }
            },
            err=>{
              this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
                timeOut: 5000,
                positionClass: 'toast-bottom-left'
              });
            }
          );
        }else{
          localStorage.setItem("secureLogin",res);
          localStorage.setItem("secureLoginType","patient");
          this.router.navigate(['/patient']);
        }
      },
      err=>{
        console.log("err");
        this.toastr.warning(this.translate.instant('checkCnx'),this.translate.instant('cnx'),{
          timeOut: 5000,
          positionClass: 'toast-bottom-left'
        });
      }
    );
  }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    }
  }

  onSubmit(): void {
    this.waitOppeningAcc=true;
    this.authService.login(this.username, this.password).subscribe(
      data => {
        this.signInResponse=data;
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        localStorage.setItem("secureLogin",this.signInResponse.secureLogin)
        if(this.signInResponse.roles.indexOf('PATIENT_ROLE') != -1){
          this.router.navigate(['/patient']);
        }else if (this.signInResponse.roles.indexOf('DOCTOR_ROLE') != -1){
          this.router.navigate(['/doctor']);
        }else if (this.signInResponse.roles.indexOf('ADMIN_ROLE') != -1){
          this.router.navigate(['/admin']);
        }else if (this.signInResponse.roles.indexOf('PHARMACIST_ROLE') != -1){
          this.router.navigate(['/pharmacy']);
        }
      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
        this.waitOppeningAcc=false;
      }
    );
  }

  reloadPage(): void {
    window.location.reload();
  }

}
