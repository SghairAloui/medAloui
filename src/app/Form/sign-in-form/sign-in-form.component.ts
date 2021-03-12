import { HttpClient } from '@angular/common/http';
import { EventEmitter, Component, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { UsernameAndPassPost } from 'src/model/UsernameAndPassPost';
import { SignInService } from './sign-in.service';

@Component({
  selector: 'app-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.css']
})
export class SignInFormComponent implements OnInit {

  constructor(private http:HttpClient,private translate: TranslateService,private toastr:ToastrService, private signInService:SignInService,private router: Router) { }
  @Output() outPutOpenSignUp = new EventEmitter<boolean>();
  ngOnInit(): void {
  }
  InvalidInfo:boolean=false;
  emailAddressInfo:string=this.translate.instant('username');passwordInfo:string=this.translate.instant('password');
  username:string;password:string;
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
}
